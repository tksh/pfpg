import { assert, assertEquals } from "@std/assert";
import { initSvg2rgba, svg2rgba } from "svg2ui8a";

// The binary the page loads, copied to the static output by the build; see
// src/assets/svg2ui8a/README.md.
const VENDORED_WASM = new URL(
  "../src/assets/svg2ui8a/svg2rgba_bg.wasm",
  import.meta.url,
);

Deno.test("the vendored rasterizer Wasm is a loadable module", async () => {
  const module = await WebAssembly.compile(
    await Deno.readFile(VENDORED_WASM),
  );
  const exports = WebAssembly.Module.exports(module).map((e) => e.name);
  assert(
    exports.includes("svg2rgba"),
    `the vendored binary must export svg2rgba, got ${exports.join(", ")}`,
  );
});

Deno.test("the vendored rasterizer Wasm renders through the package", async () => {
  // The package loads the binary from a URL; the page passes the deployed
  // location, and the test passes the vendored file.
  await initSvg2rgba({ wasmUrl: VENDORED_WASM.href });

  const { width, height, pixels } = await svg2rgba(
    '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">' +
      '<rect width="4" height="4" fill="#ff0000"/></svg>',
  );
  assertEquals(width, 4);
  assertEquals(height, 4);
  assertEquals(pixels.length, 4 * 4 * 4);
  assertEquals([...pixels.slice(0, 4)], [255, 0, 0, 255]);
});
