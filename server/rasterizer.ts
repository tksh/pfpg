import { initSvg2rgba } from "svg2ui8a";

// The OGP server does not go through the static build, so it reads the
// vendored binary from `src/assets`, not `dist/svg2ui8a`.
export const RASTERIZER_WASM_URL = new URL(
  "../src/assets/svg2ui8a/svg2rgba_bg.wasm",
  import.meta.url,
);

/** Read the vendored rasterizer binary, naming the path on failure. */
export async function readRasterizerWasm(
  url: URL = RASTERIZER_WASM_URL,
): Promise<Uint8Array> {
  try {
    return await Deno.readFile(url);
  } catch (error) {
    throw new Error(
      `ogp-probe: failed to read the rasterizer Wasm at ${url.pathname}`,
      { cause: error },
    );
  }
}

/**
 * Initialize the rasterizer from the vendored bytes.
 *
 * Called once before `Deno.serve()`; the bytes are not retained after the
 * package has instantiated its Wasm module.
 */
export async function initializeRasterizer(): Promise<void> {
  await initSvg2rgba({ wasmBytes: await readRasterizerWasm() });
}
