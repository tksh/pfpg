// Deno Deploy probe: decode the artwork URL params to SVG and compute the
// shared-image key on the server (no DOM, no location), plus a Wasm render
// smoke check via @tksh/svg2ui8a. Does not upload to Cloudinary yet.
import { decodeUrlToSvg } from "@tksh/stln-codec";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import { svg2rgba } from "svg2ui8a";

Deno.serve(async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname !== "/ogp" || req.method !== "GET") {
    return new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }

  const params = url.searchParams;
  if (params.toString() === "") {
    return new Response(
      JSON.stringify({ error: "missing artwork params" }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const { svg } = await decodeUrlToSvg(params, {
      pathMode: "absoluteSeparated",
    });
    const key = await getSharedImageKeyHash(params);
    const { width, height, pixels } = await svg2rgba(svg, { height: 256 });

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
});
