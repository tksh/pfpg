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
  params.set("heightPixelSize", "96px");
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

Deno.test("OGP auto discriminator does not affect artwork output or key", async () => {
  const normal = await renderPipeline(fixture);
  const auto = new URLSearchParams(fixture);
  auto.set("auto", "1");
  const automatic = await renderPipeline(auto);
  assertEquals(automatic.key, normal.key);
  assertEquals(automatic.svg, normal.svg);
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
