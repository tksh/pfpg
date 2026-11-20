import { assertEquals, assertRejects } from "@std/assert";
import { initSvg2rgba, svg2rgba } from "svg2ui8a";
import {
  InvalidOgpParamsError,
  renderFailureResponse,
  renderPipeline,
  resolveImageMeta,
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

// An invalid UI value is app state, not artwork data, but it must still be a
// client error: the browser rejects the same URL, so the endpoint must not hand
// out a shared-image URL for it through either route.
Deno.test("OGP rejects invalid UI params on both endpoints", async () => {
  const badUi = new URLSearchParams(fixture);
  badUi.set("themeColor", "almost-black");
  await assertRejects(
    () => renderPipeline(badUi),
    InvalidOgpParamsError,
    "themeColor",
  );
  await assertRejects(
    () => resolveImageMeta(badUi, "testcloud"),
    InvalidOgpParamsError,
    "themeColor",
  );

  const badBool = new URLSearchParams(fixture);
  badBool.set("checkerboardBg", "TRUE");
  await assertRejects(
    () => renderPipeline(badBool),
    InvalidOgpParamsError,
    "checkerboardBg",
  );
});

// Constraints that depend on the decoded artwork are Stage 2: too many group
// colors for the drawing must be a client error on both endpoints, not an
// ignored surplus that still produces a shared-image URL.
Deno.test("OGP rejects excess groupColors on both endpoints", async () => {
  const params = new URLSearchParams(fixture);
  params.set("groupColors", new Array(100).fill("F0F").join("_"));
  await assertRejects(
    () => renderPipeline(params),
    InvalidOgpParamsError,
    "Excess groupColors",
  );
  await assertRejects(
    () => resolveImageMeta(params, "testcloud"),
    InvalidOgpParamsError,
    "Excess groupColors",
  );
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

Deno.test("resolveImageMeta returns stable metadata for valid params", async () => {
  const meta = await resolveImageMeta(
    new URLSearchParams(fixture),
    "testcloud",
  );
  assertEquals(meta.key.length, 32);
  assertEquals(meta.publicId, `${meta.key}-png`);
  assertEquals(
    meta.imageUrl,
    `https://res.cloudinary.com/testcloud/image/upload/${meta.key}-png.png`,
  );
});

Deno.test("resolveImageMeta rejects invalid settings as InvalidOgpParamsError", async () => {
  const badOpacity = new URLSearchParams(fixture);
  badOpacity.set("opacitySteps", "0.3");
  await assertRejects(
    () => resolveImageMeta(badOpacity, "testcloud"),
    InvalidOgpParamsError,
  );

  const badHeight = new URLSearchParams(fixture);
  badHeight.set("heightPixelSize", "96px");
  await assertRejects(
    () => resolveImageMeta(badHeight, "testcloud"),
    InvalidOgpParamsError,
  );

  const emptyOpacity = new URLSearchParams(fixture);
  emptyOpacity.set("opacitySteps", "");
  await assertRejects(
    () => resolveImageMeta(emptyOpacity, "testcloud"),
    InvalidOgpParamsError,
  );
});
