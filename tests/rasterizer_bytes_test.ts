import { assert, assertEquals, assertRejects } from "@std/assert";
import {
  FILES,
  SVG2UI8A_VERSION,
  verifyFile,
} from "../scripts/vendor_svg2ui8a.ts";
import { readRasterizerWasm } from "../server/rasterizer.ts";

interface Success {
  ok: true;
  width: number;
  height: number;
  firstPixel: number[];
}

interface Failure {
  ok: false;
  message: string;
}

const VENDORED_WASM = FILES[0];
if (VENDORED_WASM === undefined) {
  throw new Error("vendor_svg2ui8a must declare the rasterizer file");
}
const VENDORED_BYTES = await Deno.readFile(
  new URL(`../${VENDORED_WASM.to}`, import.meta.url),
);

const RED_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">' +
  '<rect width="4" height="4" fill="#ff0000"/></svg>';

/**
 * Run one initialization in a worker.
 *
 * A worker gets a fresh module instance, so the package's cached
 * initialization state does not leak between scenarios. Appending a query to
 * a jsr.io module URL would break the package integrity check.
 */
function runRasterizer(
  mode: "valid" | "invalid",
): Promise<Success | Failure> {
  const worker = new Worker(
    new URL("./fixtures/rasterizer_worker.ts", import.meta.url),
    { type: "module" },
  );
  return new Promise((resolve, reject) => {
    worker.onmessage = (event: MessageEvent<Success | Failure>) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message));
    };
    worker.postMessage({ mode, wasmBytes: VENDORED_BYTES, svg: RED_SVG });
  });
}

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
  const result = await runRasterizer("valid");
  assert(result.ok, "bytes rendering failed");
  assertEquals(result.width, 4);
  assertEquals(result.height, 4);
  assertEquals(result.firstPixel, [255, 0, 0, 255]);
});

Deno.test("invalid bytes fail instead of falling back to a URL", async () => {
  const result = await runRasterizer("invalid");
  assert(!result.ok, "invalid bytes must fail");
  assert(
    result.message.includes("svg2rgba"),
    `the error must name the capability (got: ${result.message})`,
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
  assert(!probe.includes('pathname === "/ogp"'));
  assert(probe.includes('pathname === "/ogp/render"'));
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
  const ogpRenderer = await Deno.readTextFile(
    new URL("../server/ogp-render.ts", import.meta.url),
  );
  assert(ogpRenderer.includes("renderParamsToSvg"));
  assert(ogpRenderer.includes("readHeightPixelSize"));
  assert(probe.includes('isAuto ? "ogp-auto" : "history"'));
  assert(probe.includes("`${key}-png`"));
  assert(!probe.includes('pathname === "/ogp"'));
  assertEquals(SVG2UI8A_VERSION, "0.6.1");
});
