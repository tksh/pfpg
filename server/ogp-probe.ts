// Deno Deploy OGP endpoints. Rendering is shared with the browser through
// libpfpg; this service rasterizes and uploads the result.
import { PhotonImage } from "@denext/photon";
import {
  API_KEY,
  CLOUD_NAME,
  createSignedUpload,
  UPLOAD_PRESET,
} from "../functions/lib/sign-upload.ts";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import {
  InvalidOgpParamsError,
  renderFailureResponse,
  renderPipeline,
} from "./ogp-render.ts";
import { initializeRasterizer } from "./rasterizer.ts";
import { renderGuardResponse } from "./ogp-render-guard.ts";

// Read the vendored Wasm and initialize eagerly, before the server listens.
// The asset must be present at startup; the runtime performs no jsr.io Wasm
// fetch. This is intentionally eager: a missing binary prevents the whole
// server, including endpoints that do not render, from starting.
await initializeRasterizer();

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/ogp/image-meta" && req.method === "GET") {
    try {
      const key = await getSharedImageKeyHash(url.searchParams);
      const publicId = `${key}-png`;
      const imageUrl =
        `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}.png`;
      return new Response(
        JSON.stringify({ key, publicId, imageUrl }),
        { headers: { "content-type": "application/json" } },
      );
    } catch (error) {
      console.log("ogp: meta-fetch-fail");
      return jsonError(error, 400);
    }
  }
  if (pathname === "/ogp/render" && req.method === "POST") {
    const guardResponse = renderGuardResponse(
      req,
      Deno.env.get("OGP_SHARED_SECRET"),
    );
    if (guardResponse !== null) {
      if (guardResponse.status === 403) console.log("ogp: secret-rejected");
      return guardResponse;
    }
    try {
      const data = await renderAndUpload(url);
      return new Response(
        JSON.stringify(data),
        { headers: { "content-type": "application/json" } },
      );
    } catch (error) {
      if (error instanceof InvalidOgpParamsError) {
        console.log("ogp: render-fail");
        return renderFailureResponse(error);
      }
      if (error instanceof DOMException && error.name === "TimeoutError") {
        console.log("ogp: timeout");
      } else {
        console.log("ogp: render-fail");
      }
      return renderFailureResponse(error);
    }
  }
  if (pathname === "/share" && req.method === "GET") {
    return handleShare(url);
  }
  return new Response(JSON.stringify({ error: "not found" }), {
    status: 404,
    headers: { "content-type": "application/json" },
  });
});

function jsonError(error: unknown, status = 500): Response {
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}

// The Deno Deploy host serves no static assets, so redirect /share directly
// to the production pages site, where the Pages middleware injects the OGP
// tags. Kept for OG tools that might visit a stale Deno /share link.
function handleShare(url: URL): Response {
  const search = url.search;
  const target = `https://pfpg.pages.dev/index.html${
    search === "" ? "" : search
  }`;
  return new Response(null, {
    status: 302,
    headers: { Location: target },
  });
}

async function renderAndUpload(url: URL): Promise<{
  key: string;
  publicId: string;
  imageUrl: string;
  svgBytes: number;
}> {
  const params = url.searchParams;
  const { key, svg, pixels, width, height } = await renderPipeline(params);
  const isAuto = params.getAll("auto").at(-1) === "1";
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not configured");

  // Encode RGBA to PNG via photon (same strategy as svg2ui8a-demo)
  using img = new PhotonImage(pixels, width, height);
  const pngBytes = img.get_bytes();
  const publicId = `${key}-png`;
  const imageUrl = await uploadAsset(
    "image",
    new Blob([new Uint8Array(pngBytes)], { type: "image/png" }),
    publicId,
    apiSecret,
    isAuto,
  );
  const paramsBlob = new Blob([url.search], { type: "text/plain" });
  try {
    await uploadAsset(
      "raw",
      paramsBlob,
      publicId,
      apiSecret,
      isAuto,
      "params.txt",
    );
  } catch (sidecarError) {
    console.error("Error uploading params sidecar:", sidecarError);
  }

  return {
    key,
    publicId,
    imageUrl,
    svgBytes: new TextEncoder().encode(svg).length,
  };
}

async function uploadAsset(
  resourceType: "image" | "raw",
  blob: Blob,
  publicId: string,
  apiSecret: string,
  isAuto: boolean,
  fileName = "file",
): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yyyyMm = `${yyyy}-${("00" + (now.getMonth() + 1)).slice(-2)}`;
  const tags = ["pfpg", isAuto ? "ogp-auto" : "history", yyyy, yyyyMm]
    .join(",");

  const signed = await createSignedUpload({ publicId, tags }, apiSecret);

  const form = new FormData();
  form.append("file", blob, fileName);
  form.append("api_key", API_KEY);
  form.append("timestamp", String(signed.timestamp));
  form.append("signature", signed.signature);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("public_id", publicId);
  form.append("tags", tags);

  const uploadUrl =
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const resp = await fetch(uploadUrl, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(4_000),
  });
  const data: unknown = await resp.json();
  if (!resp.ok) {
    let message = "Cloudinary upload failed";
    if (typeof data === "object" && data !== null && "error" in data) {
      const err: unknown = (data as { error: unknown }).error;
      if (
        typeof err === "object" && err !== null && "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      }
    }
    throw new Error(message);
  }
  if (
    typeof data !== "object" || data === null || !("secure_url" in data) ||
    typeof (data as { secure_url: unknown }).secure_url !== "string"
  ) {
    throw new Error("Cloudinary upload: missing secure_url");
  }
  return (data as { secure_url: string }).secure_url.replace(
    /\/v[0-9]+\//g,
    "/",
  );
}
