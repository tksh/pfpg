import { assertEquals, assertRejects } from "@std/assert";
import { initSvg2rgba, svg2rgba } from "svg2ui8a";
import {
  InvalidOgpParamsError,
  renderFailureResponse,
  renderPipeline,
} from "../server/ogp-render.ts";

const fixture = new URLSearchParams(
  (await Deno.readTextFile("tests/fixtures/showcase-202401_001.search.txt"))
    .trim().slice(1),
);

Deno.test("OGP pipeline reuses libpfpg SVG and selected raster dimensions", async () => {
  await initSvg2rgba({
    wasmUrl:
      new URL("../src/assets/svg2ui8a/svg2rgba_bg.wasm", import.meta.url).href,
  });
  const params = new URLSearchParams(fixture);
  params.set("shapeToTrim", "circle");
  params.set("heightPixelSize", "96");
  const result = await renderPipeline(params);
  const expectedSvg = await Deno.readTextFile(
    "tests/fixtures/showcase-202401_001-shape_circle.svg",
  );
  assertEquals(result.svg, expectedSvg);
  assertEquals(result.width, 96);
  assertEquals(result.height, 96);
  const browserPixels = await svg2rgba(expectedSvg, { height: 96 });
  assertEquals(result.pixels, browserPixels.pixels);
});

Deno.test("OGP render rejects the removed auto query parameter", async () => {
  const params = new URLSearchParams(fixture);
  params.set("auto", "1");
  await assertRejects(
    () => renderPipeline(params),
    InvalidOgpParamsError,
    'The "auto" query parameter is no longer supported',
  );
});

Deno.test("OGP pipeline rejects unusable params as a client error", async () => {
  await assertRejects(
    () => renderPipeline(new URLSearchParams("title=~202401_001")),
    InvalidOgpParamsError,
  );
  const metadata = new URLSearchParams(fixture);
  metadata.set("metadata", "~nadir");
  await assertRejects(() => renderPipeline(metadata), InvalidOgpParamsError);
  const oversized = new URLSearchParams(fixture);
  oversized.set("other", "x".repeat(8200));
  await assertRejects(() => renderPipeline(oversized), InvalidOgpParamsError);
});

Deno.test("OGP maps unusable params to 400 and operational errors to 500", () => {
  const invalid = renderFailureResponse(
    new InvalidOgpParamsError("invalid params"),
  );
  const internal = renderFailureResponse(new Error("upload failed"));
  assertEquals(invalid.status, 400);
  assertEquals(internal.status, 500);
});

// A shared URL carries the locale and the UI settings. They are app state, not
// artwork data, so the codec must never see them: without filtering, `?lang=ja`
// would be read as a line group and the endpoint would answer 400 for a URL the
// browser renders fine.
Deno.test("OGP accepts a URL that carries app state keys", async () => {
  const expected = await renderPipeline(new URLSearchParams(fixture));

  const appStateKeys: Array<[string, string]> = [
    ["lang", "ja"],
    ["themeColor", "dark"],
    ["imageFormat", "png"],
    ["viewScaling", "fit"],
    ["buttonAction", "copy"],
  ];
  for (const [key, value] of appStateKeys) {
    const params = new URLSearchParams(fixture);
    params.set(key, value);
    const result = await renderPipeline(params);
    assertEquals(result.svg, expected.svg, `${key} must not change the SVG`);
  }
});

// colourFormat changes the serialized form, never the pixels. The shared-image
// key and the raster must agree with the rgb rendering.
Deno.test("OGP renders the same pixels for either color format", async () => {
  const rgbParams = new URLSearchParams(fixture);
  rgbParams.set("colorFormat", "rgb");
  const hexParams = new URLSearchParams(fixture);
  hexParams.set("colorFormat", "hex");

  const rgb = await renderPipeline(rgbParams);
  const hex = await renderPipeline(hexParams);
  assertEquals(rgb.pixels, hex.pixels);
});
