import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  FILES,
  SVG2UI8A_VERSION,
  verifyFile,
} from "../scripts/vendor_svg2ui8a.ts";
import { readRasterizerWasm } from "../server/rasterizer.ts";

interface RasterizerModule {
  initSvg2rgba: (options: { wasmBytes: Uint8Array }) => Promise<void>;
  svg2rgba: (
    svg: string,
    options?: { height?: number },
  ) => Promise<{ width: number; height: number; pixels: Uint8Array }>;
}

const VENDORED_WASM = FILES[0];
if (VENDORED_WASM === undefined) {
  throw new Error("vendor_svg2ui8a must declare the rasterizer file");
}
const VENDORED_BYTES = await Deno.readFile(
  new URL(`../${VENDORED_WASM.to}`, import.meta.url),
);
const PACKAGE_URL = import.meta.resolve("svg2ui8a");

let instanceCounter = 0;

/** A fresh package instance, so initialization state does not leak. */
async function freshRasterizer(): Promise<RasterizerModule> {
  const url = new URL(PACKAGE_URL);
  url.searchParams.set("bytes-test", String(instanceCounter++));
  return await import(url.href) as RasterizerModule;
}

const RED_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">' +
  '<rect width="4" height="4" fill="#ff0000"/></svg>';

Deno.test("the vendored binary matches its recorded size and sha256", async () => {
  await verifyFile(VENDORED_WASM, VENDORED_BYTES);
});

Deno.test("a wrong hash fails vendor validation", async () => {
  const corrupted = VENDORED_BYTES.slice();
  corrupted[0] = (corrupted[0] ?? 0) ^ 0xff;
  await assertRejects(
    () => verifyFile(VENDORED_WASM, corrupted),
    Error,
    "expected ",
  );
});

Deno.test("server bytes render a known SVG without a network fetch", async () => {
  const module = await freshRasterizer();
  await module.initSvg2rgba({ wasmBytes: VENDORED_BYTES });
  const result = await module.svg2rgba(RED_SVG, { height: 4 });
  assertEquals(result.width, 4);
  assertEquals(result.height, 4);
  assertEquals([...result.pixels.slice(0, 4)], [255, 0, 0, 255]);
});

Deno.test("invalid bytes fail instead of falling back to a URL", async () => {
  const module = await freshRasterizer();
  await assertRejects(
    () => module.initSvg2rgba({ wasmBytes: new Uint8Array([0, 1, 2, 3]) }),
    Error,
    "svg2rgba",
  );
  await assertRejects(
    () => module.svg2rgba(RED_SVG, { height: 4 }),
    Error,
    "svg2rgba",
  );
});

Deno.test("a missing vendored file names the path in the startup error", async () => {
  const missing = new URL("./missing_bg.wasm", import.meta.url);
  await assertRejects(
    () => readRasterizerWasm(missing),
    Error,
    missing.pathname,
  );
});

Deno.test("server source initializes before listening and has no fixed URL", async () => {
  const probe = await Deno.readTextFile(
    new URL("../server/ogp-probe.ts", import.meta.url),
  );
  const rasterizer = await Deno.readTextFile(
    new URL("../server/rasterizer.ts", import.meta.url),
  );

  assert(!probe.includes("jsr.io/@tksh"));
  assert(!probe.includes("RASTERIZER_WASM_URL"));
  assert(!probe.includes("ensureRasterizer"));
  assert(
    probe.indexOf("await initializeRasterizer()") <
      probe.indexOf("Deno.serve("),
    "initialization must be awaited before Deno.serve",
  );
  assert(
    rasterizer.includes("../src/assets/svg2ui8a/svg2rgba_bg.wasm"),
    "the server must read src/assets, not dist",
  );
  assert(
    rasterizer.includes("wasmBytes:"),
    "the server must initialize from bytes",
  );
  assertEquals(SVG2UI8A_VERSION, "0.6.1");
});
