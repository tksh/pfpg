import { init as initWebpEncode } from "jsquash/webp-encode";
import encodeWebp from "jsquash/webp-encode";
import { init as initOxipng } from "jsquash/oxipng-optimise";
import optimisePng from "jsquash/oxipng-optimise";
import {
  getImageFormat,
  IMAGE_FORMATS,
  type ImageFormat,
} from "state/image-format";

export {
  type EncodedImage,
  encodeRasterImage,
  type EncodeRasterOptions,
  WASM_DIRECTORY,
  WEBP_LOSSLESS_OPTIONS,
};

/**
 * The rasterized artwork, encoded as the selected image file format.
 *
 * Carrying the MIME type and the extension alongside the bytes keeps the
 * preview, the download filename, the clipboard item and the upload in sync
 * with the format the user selected.
 */
interface EncodedImage {
  /** Encoded image file bytes */
  bytes: Uint8Array;
  /** MIME type of `bytes` */
  mimeType: string;
  /** File extension of `bytes`, without the leading dot */
  extension: string;
  /** Raster width in pixels */
  width: number;
  /** Raster height in pixels */
  height: number;
}

// Where the build copies the vendored Wasm to. `deno bundle` inlines the
// encoders' JavaScript but emits no Wasm asset, so the binaries are served
// from our own origin; see src/assets/jsquash/README.md.
const WASM_DIRECTORY = "./jsquash/";

/**
 * WebP encoding options.
 *
 * `lossless` alone is not lossless: libwebp's `exact` defaults to 0, which
 * lets the encoder discard the invisible RGB values of fully transparent
 * pixels. `exact: 1` keeps them, so the file decodes back to exactly the
 * pixels the renderer produced — the difference is 18 bytes on a 4×4 probe
 * with saturated transparent pixels, and it is what makes the
 * "WebP (lossless)" label true.
 */
const WEBP_LOSSLESS_OPTIONS = { lossless: 1, exact: 1 } as const;

// The canonical SIMD feature probe: a minimal module using a SIMD opcode.
// Compiled with WebAssembly.validate(), it answers whether this browser can
// run the SIMD encoder without instantiating anything.
const SIMD_PROBE = new Uint8Array([
  0,
  97,
  115,
  109,
  1,
  0,
  0,
  0,
  1,
  5,
  1,
  96,
  0,
  1,
  123,
  3,
  2,
  1,
  0,
  10,
  10,
  1,
  8,
  0,
  65,
  0,
  253,
  15,
  253,
  98,
  11,
]);

function browserHasWasmSimd(): boolean {
  return WebAssembly.validate(SIMD_PROBE);
}

// Init once per session, per format. Both packages cache their module
// internally, so re-initializing on every render would only cost time.
let webpReady: Promise<void> | null = null;
let oxipngReady: Promise<void> | null = null;

async function compileWasm(url: URL): Promise<WebAssembly.Module> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `image-encoder: cannot load ${url} (${response.status} ${response.statusText})`,
    );
  }
  // Compiling from bytes rather than compileStreaming: that requires a
  // `application/wasm` response, which is a property of the host, not of us.
  return await WebAssembly.compile(await response.arrayBuffer());
}

async function ensureWebp(wasmBaseUrl: string): Promise<void> {
  if (webpReady === null) {
    webpReady = (async () => {
      const file = browserHasWasmSimd()
        ? "webp_enc_simd.wasm"
        : "webp_enc.wasm";
      // Passing a compiled module skips the package's own SIMD detection,
      // which is what chose the file above.
      await initWebpEncode(await compileWasm(new URL(file, wasmBaseUrl)));
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      webpReady = null;
      throw error;
    });
  }
  await webpReady;
}

async function ensureOxipng(wasmBaseUrl: string): Promise<void> {
  if (oxipngReady === null) {
    oxipngReady = (async () => {
      // The single-threaded build: the multi-threaded one only engages inside
      // a Worker and needs COOP/COEP headers that would apply to the whole
      // page. Outside a Worker the package picks this build by itself.
      await initOxipng(
        await compileWasm(new URL("squoosh_oxipng_bg.wasm", wasmBaseUrl)),
      );
    })().catch((error: unknown) => {
      oxipngReady = null;
      throw error;
    });
  }
  await oxipngReady;
}

/** Resolve the Wasm directory against the page, for the browser entry point. */
function defaultWasmBaseUrl(): string {
  return new URL(WASM_DIRECTORY, globalThis.location.href).href;
}

interface EncodeRasterOptions {
  /** Format to encode into; defaults to the `imageFormat` URL state. */
  format?: ImageFormat;
  /** Where the vendored Wasm is served from; defaults to the page's. */
  wasmBaseUrl?: string;
}

/**
 * Encode raw RGBA pixels into an image file.
 *
 * @param {Uint8Array} pixels - Straight-alpha RGBA, row-major, 4 bytes per pixel
 * @param {number} width - Raster width in pixels
 * @param {number} height - Raster height in pixels
 * @param {EncodeRasterOptions} options - Format and Wasm location overrides
 */
async function encodeRasterImage(
  pixels: Uint8Array,
  width: number,
  height: number,
  options: EncodeRasterOptions = {},
): Promise<EncodedImage> {
  const format = options.format ?? getImageFormat();
  const wasmBaseUrl = options.wasmBaseUrl ?? defaultWasmBaseUrl();
  const { mimeType, extension } = IMAGE_FORMATS[format];
  const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    width,
    height,
  );

  if (format === "webp") {
    await ensureWebp(wasmBaseUrl);
    const buffer = await encodeWebp(imageData, WEBP_LOSSLESS_OPTIONS);
    return {
      bytes: new Uint8Array(buffer),
      mimeType,
      extension,
      width,
      height,
    };
  }

  await ensureOxipng(wasmBaseUrl);
  // No options: oxipng's defaults (level 2, no interlacing, no alpha
  // alteration) are the settings this project wants.
  const buffer = await optimisePng(imageData);
  return {
    bytes: new Uint8Array(buffer),
    mimeType,
    extension,
    width,
    height,
  };
}
