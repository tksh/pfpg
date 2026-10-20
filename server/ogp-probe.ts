// Deno Deploy probe: decode the artwork URL params to SVG and compute the
// shared-image key on the server (no DOM, no location), plus a Wasm render
// smoke check via @tksh/svg2ui8a. Does not upload to Cloudinary yet.
//
// Parity with the browser pipeline: artwork params go through stln-codec,
// then `<g>` color overrides from the `groupColors` state param are applied
// via the shared group-colors-svg helpers, then the optimize-svg state keys
// (like `removeOpacity`) are applied.
import { decodeUrlToSvg } from "@tksh/stln-codec";
import { excludeStateKeys } from "common-utils/read-url-params";
import { PhotonImage } from "@denext/photon";
import {
  applyGroupColorsToSvg,
  removeOpacity,
} from "group-colors-svg/group-colors-svg";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import { decodeGroupColorsAsArray } from "tab-lines/decode-colors-as-array";
import {
  API_KEY,
  CLOUD_NAME,
  createSignedUpload,
  UPLOAD_PRESET,
} from "../functions/lib/sign-upload.ts";
import { initSvg2rgba, svg2rgba } from "svg2ui8a";

// The rasterizer's Wasm binary is published next to the package on JSR, and
// the package loads it from a URL. A deployment bundles the module into a
// single file, so the module's own URL cannot point at the binary the way it
// does in the published package: the location is pinned here instead.
//
// The version must match the `svg2ui8a` import in deno.jsonc.
const RASTERIZER_WASM_URL =
  "https://jsr.io/@tksh/svg2ui8a/0.6.0/assets/svg2rgba_bg.wasm";

// The rasterizer's Wasm module, once it has been loaded. The package takes
// the binary's location only before the module is loaded, so the
// initialization happens once, on the first render.
let rasterizerReady: Promise<void> | null = null;

function ensureRasterizer(): Promise<void> {
  rasterizerReady ??= initSvg2rgba({ wasmUrl: RASTERIZER_WASM_URL });
  return rasterizerReady;
}

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/ogp" && req.method === "GET") {
    return await handleProbe(url);
  }
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
      return jsonError(error);
    }
  }
  if (pathname === "/ogp/render" && req.method === "POST") {
    try {
      const data = await renderAndUpload(url);
      return new Response(
        JSON.stringify(data),
        { headers: { "content-type": "application/json" } },
      );
    } catch (error) {
      return jsonError(error);
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

function jsonError(error: unknown): Response {
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
    { status: 500, headers: { "content-type": "application/json" } },
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
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET");
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not configured");
  }

  const { key, svg, pixels, width, height } = await renderPipeline(params);

  // Encode RGBA to PNG via photon (same strategy as svg2ui8a-demo)
  using img = new PhotonImage(pixels, width, height);
  const pngBytes = img.get_bytes();
  const publicId = `${key}-png`;
  const imageUrl = await uploadAsset(
    "image",
    new Blob([new Uint8Array(pngBytes)], { type: "image/png" }),
    publicId,
    apiSecret,
  );
  const paramsBlob = new Blob([url.search], { type: "text/plain" });
  try {
    await uploadAsset("raw", paramsBlob, publicId, apiSecret, "params.txt");
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

async function handleProbe(url: URL): Promise<Response> {
  const params = url.searchParams;
  if (params.toString() === "") {
    return new Response(
      JSON.stringify({ error: "missing artwork params" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  try {
    const { key, svg, pixels, width, height } = await renderPipeline(params);

    return new Response(
      JSON.stringify({
        key,
        svgBytes: new TextEncoder().encode(svg).length,
        rgbaBytes: pixels.length,
        width,
        height,
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

// Decode params (state-key aware) -> svg string -> rgba pixels
async function renderPipeline(params: URLSearchParams): Promise<{
  key: string;
  svg: string;
  pixels: Uint8Array;
  width: number;
  height: number;
}> {
  const pathMode = params.get("pathMode") === "relativeMerged"
    ? "relativeMerged"
    : "absoluteSeparated";
  const { svg: decodedSvg } = await decodeUrlToSvg(
    excludeStateKeys(params),
    { pathMode },
  );

  let svg = decodedSvg;
  const groupColors = params.get("groupColors");
  const isOpacityRemoved = params.get("removeOpacity") === "true";
  const colorFormat = params.get("colorFormat") ?? "rgb";

  if (groupColors) {
    const colorsByGroups = decodeGroupColorsAsArray(groupColors, colorFormat);
    svg = applyGroupColorsToSvg(svg, colorsByGroups, {
      removeOpacity: isOpacityRemoved,
    });
  }
  if (isOpacityRemoved) {
    svg = removeOpacity(svg);
  }

  const key = await getSharedImageKeyHash(params);
  await ensureRasterizer();
  const { width, height, pixels } = await svg2rgba(svg, { height: 256 });
  return { key, svg, pixels, width, height };
}

async function uploadAsset(
  resourceType: "image" | "raw",
  blob: Blob,
  publicId: string,
  apiSecret: string,
  fileName = "file",
): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const yyyyMm = `${yyyy}-${("00" + (now.getMonth() + 1)).slice(-2)}`;
  const tags = ["pfpg", "history", yyyy, yyyyMm].join(",");

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
  const resp = await fetch(uploadUrl, { method: "POST", body: form });
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
