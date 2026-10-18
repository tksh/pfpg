import initOxiGlue, { optimise_raw } from "jsquash/oxipng-glue";
import { defaultOptions as oxipngDefaults } from "jsquash/oxipng-meta";
import webpFactory from "jsquash/webp-enc";
import type { WebPModule } from "jsquash/webp-enc";
import webpSimdFactory from "jsquash/webp-enc-simd";
import { defaultOptions as webpDefaults } from "jsquash/webp-meta";
import { initEmscriptenModule } from "jsquash/webp-utils";
import jxlFactory from "jsquash/jxl-enc";
import type { JXLModule } from "jsquash/jxl-enc";
import { defaultOptions as jxlDefaults } from "jsquash/jxl-meta";
import { initEmscriptenModule as initJxlModule } from "jsquash/jxl-utils";
import avifFactory from "jsquash/avif-enc";
import type { AVIFModule } from "jsquash/avif-enc";
import { defaultOptions as avifDefaults } from "jsquash/avif-meta";
import { initEmscriptenModule as initAvifModule } from "jsquash/avif-utils";
import qoiFactory from "jsquash/qoi-enc";
import type { QOIModule } from "jsquash/qoi-enc";
import { initEmscriptenModule as initQoiModule } from "jsquash/qoi-utils";
import {
  getImageFormat,
  IMAGE_FORMATS,
  type ImageFormat,
} from "state/image-format";

export {
  AVIF_LOSSLESS_OPTIONS,
  type EncodedImage,
  encodeRasterImage,
  type EncodeRasterOptions,
  encodeRasterVariant,
  type ImageOptimizationVariant,
  JXL_LOSSLESS_OPTIONS,
  type OptimizedImage,
  WASM_DIRECTORY,
  WEBP_LOSSLESS_OPTIONS,
  WEBP_NEAR_LOSSLESS_OPTIONS,
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

/**
 * An encode requested by the image optimization modal.
 *
 * The extra flag lets the modal say when a measurement includes the one-off
 * Wasm download and compile, which would otherwise make the first row look
 * slower than the format really is.
 */
interface OptimizedImage extends EncodedImage {
  /** True when this encode had to load its Wasm module first. */
  wasmLoaded: boolean;
}

/** The formats offered by the image optimization modal. */
type ImageOptimizationVariant =
  | "webp-lossless"
  | "webp-near-lossless"
  | "jxl-lossless"
  | "png"
  | "avif-lossless"
  | "qoi";

const VARIANT_FORMATS: Record<
  ImageOptimizationVariant,
  { mimeType: string; extension: string }
> = {
  "webp-lossless": { mimeType: "image/webp", extension: "webp" },
  "webp-near-lossless": { mimeType: "image/webp", extension: "webp" },
  "jxl-lossless": { mimeType: "image/jxl", extension: "jxl" },
  "png": { mimeType: "image/png", extension: "png" },
  "avif-lossless": { mimeType: "image/avif", extension: "avif" },
  "qoi": { mimeType: "image/qoi", extension: "qoi" },
};

// Where the build copies the vendored Wasm to. `deno bundle` inlines the
// encoders' JavaScript but emits no Wasm asset, so the binaries are served
// from our own origin; see src/assets/jsquash/README.md.
const WASM_DIRECTORY = "./jsquash/";

// The encoder glue is imported statically rather than through the packages'
// `optimise()` / `encode()` wrappers. Those wrappers reach the same modules
// with `import()`, and `deno bundle` emits every dynamic import as a separate
// chunk under `_.._/`, a path derived from the absolute location of the source
// file on the build machine. Static hosts do not all publish that path, so the
// first render 404s on some of them while working on others.
const OXI_WASM_FILE = "squoosh_oxipng_bg.wasm";
const WEBP_WASM_FILES = {
  simd: "webp_enc_simd.wasm",
  plain: "webp_enc.wasm",
} as const;
// Single-threaded builds only; see src/assets/jsquash/README.md.
const JXL_WASM_FILE = "jxl_enc.wasm";
const AVIF_WASM_FILE = "avif_enc.wasm";
const QOI_WASM_FILE = "qoi_enc.wasm";

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

/**
 * WebP near-lossless options.
 *
 * `lossless: 1` must be explicit: unlike the `cwebp` CLI, libwebp does not
 * switch to lossless when `near_lossless` is below 100, and the option is
 * ignored entirely on the lossy path. The preprocessing then only runs in
 * entropy configurations that use neither the palette nor the predictor
 * transform, so flat-color art comes out the same size as
 * "WebP (lossless)" — that is libwebp's design, not a fallback.
 *
 * The strength (0 = strongest preprocessing, 100 = off) is fixed because the
 * modal offers no picker; 20 measured at most an 8/255 per-channel change.
 * `quality` stays at the package default (75): on the lossless path it is an
 * effort knob, not an image-quality ceiling, and 100 made the flat-color
 * probe 24 bytes larger than the lossless row.
 */
const WEBP_NEAR_LOSSLESS_OPTIONS = { lossless: 1, near_lossless: 20 } as const;

/**
 * JPEG XL lossless options.
 *
 * The package's `encode()` wrapper treats `lossless: true` as `quality: 100`
 * and turns the two lossy modes off before it calls the glue. The glue has no
 * `lossless` field of its own: 100 is what selects modular coding with an
 * identity color transform, which round-trips RGBA exactly. pfpg calls the
 * glue directly, so it repeats that normalization here (same reason as the
 * WebP `exact: 1` note above).
 */
const JXL_LOSSLESS_OPTIONS = {
  lossless: true,
  quality: 100,
  lossyModular: false,
  lossyPalette: false,
} as const;

/**
 * AVIF lossless options.
 *
 * Same story as JPEG XL: the package's `encode()` wrapper normalizes
 * `lossless: true` to `quality: 100`, `qualityAlpha: -1` and `subsample: 3`
 * (YUV 4:4:4). The glue recognizes exactly that combination and switches to
 * the identity color matrix, which is what makes the encode lossless.
 */
const AVIF_LOSSLESS_OPTIONS = {
  quality: 100,
  qualityAlpha: -1,
  subsample: 3,
} as const;

// The canonical SIMD feature probe: a minimal module using a SIMD opcode.
// Validated rather than instantiated, it answers whether this browser can run
// the SIMD encoder without loading anything.
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

// Initialize once per session, per format. The packages keep their module
// internally, so re-initializing on every render would only cost time.
let webpReady: Promise<WebPModule> | null = null;
let oxipngReady: Promise<void> | null = null;
let jxlReady: Promise<JXLModule> | null = null;
let avifReady: Promise<AVIFModule> | null = null;
let qoiReady: Promise<QOIModule> | null = null;

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

async function ensureWebp(wasmBaseUrl: string): Promise<WebPModule> {
  if (webpReady === null) {
    webpReady = (async () => {
      const simd = browserHasWasmSimd();
      const module = await compileWasm(
        new URL(
          simd ? WEBP_WASM_FILES.simd : WEBP_WASM_FILES.plain,
          wasmBaseUrl,
        ),
      );
      // The package's own helper for injecting a compiled module; using it
      // keeps this on the supported manual-init path.
      return await initEmscriptenModule(
        simd ? webpSimdFactory : webpFactory,
        module,
        {},
      );
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      webpReady = null;
      throw error;
    });
  }
  return await webpReady;
}

async function ensureOxipng(wasmBaseUrl: string): Promise<void> {
  if (oxipngReady === null) {
    oxipngReady = (async () => {
      // The single-threaded build: the multi-threaded one only engages inside
      // a Worker and needs COOP/COEP headers that would apply to the whole
      // page.
      await initOxiGlue(
        await compileWasm(new URL(OXI_WASM_FILE, wasmBaseUrl)),
      );
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      oxipngReady = null;
      throw error;
    });
  }
  await oxipngReady;
}

async function ensureJxl(wasmBaseUrl: string): Promise<JXLModule> {
  if (jxlReady === null) {
    jxlReady = (async () => {
      const module = await compileWasm(new URL(JXL_WASM_FILE, wasmBaseUrl));
      return await initJxlModule(jxlFactory, module, {});
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      jxlReady = null;
      throw error;
    });
  }
  return await jxlReady;
}

async function ensureAvif(wasmBaseUrl: string): Promise<AVIFModule> {
  if (avifReady === null) {
    avifReady = (async () => {
      const module = await compileWasm(new URL(AVIF_WASM_FILE, wasmBaseUrl));
      return await initAvifModule(avifFactory, module, {});
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      avifReady = null;
      throw error;
    });
  }
  return await avifReady;
}

async function ensureQoi(wasmBaseUrl: string): Promise<QOIModule> {
  if (qoiReady === null) {
    qoiReady = (async () => {
      const module = await compileWasm(new URL(QOI_WASM_FILE, wasmBaseUrl));
      return await initQoiModule(qoiFactory, module, {});
    })().catch((error: unknown) => {
      // Do not cache the failure: a later render may have a working URL.
      qoiReady = null;
      throw error;
    });
  }
  return await qoiReady;
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
    const webpModule = await ensureWebp(wasmBaseUrl);
    const encoded = webpModule.encode(
      imageData.data,
      imageData.width,
      imageData.height,
      { ...webpDefaults, ...WEBP_LOSSLESS_OPTIONS },
    );
    if (encoded === null) {
      throw new Error("image-encoder: the WebP encoder returned no data");
    }
    return {
      bytes: new Uint8Array(encoded),
      mimeType,
      extension,
      width,
      height,
    };
  }

  await ensureOxipng(wasmBaseUrl);
  // The package's own defaults (level 2, no interlacing, no alpha alteration)
  // are the settings this project wants.
  const encoded = optimise_raw(
    imageData.data,
    imageData.width,
    imageData.height,
    oxipngDefaults.level,
    oxipngDefaults.interlace,
    oxipngDefaults.optimiseAlpha,
  );
  return {
    bytes: new Uint8Array(encoded),
    mimeType,
    extension,
    width,
    height,
  };
}

interface EncodeVariantOptions {
  /** Where the vendored Wasm is served from; defaults to the page's. */
  wasmBaseUrl?: string;
}

/** Whether the variant's Wasm module has already been initialized. */
function isVariantReady(variant: ImageOptimizationVariant): boolean {
  switch (variant) {
    case "png":
      return oxipngReady !== null;
    case "webp-lossless":
    case "webp-near-lossless":
      return webpReady !== null;
    case "jxl-lossless":
      return jxlReady !== null;
    case "avif-lossless":
      return avifReady !== null;
    case "qoi":
      return qoiReady !== null;
  }
}

/**
 * Encode raw RGBA pixels into one of the optimization modal's formats.
 *
 * PNG and WebP (lossless) deliberately go through encodeRasterImage(), the
 * same path the Render tab uses, so their sizes are comparable with the main
 * output's. The other formats call their glue directly, since the packages'
 * wrappers would load the Wasm dynamically.
 *
 * @param {Uint8Array} pixels - Straight-alpha RGBA, row-major, 4 bytes per pixel
 * @param {number} width - Raster width in pixels
 * @param {number} height - Raster height in pixels
 * @param {ImageOptimizationVariant} variant - Format and encoder settings
 * @param {EncodeVariantOptions} options - Wasm location override
 */
async function encodeRasterVariant(
  pixels: Uint8Array,
  width: number,
  height: number,
  variant: ImageOptimizationVariant,
  options: EncodeVariantOptions = {},
): Promise<OptimizedImage> {
  const wasmBaseUrl = options.wasmBaseUrl ?? defaultWasmBaseUrl();
  const wasmLoaded = !isVariantReady(variant);

  if (variant === "png" || variant === "webp-lossless") {
    const image = await encodeRasterImage(pixels, width, height, {
      format: variant === "png" ? "png" : "webp",
      wasmBaseUrl,
    });
    return { ...image, wasmLoaded };
  }

  const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    width,
    height,
  );
  const { mimeType, extension } = VARIANT_FORMATS[variant];

  if (variant === "webp-near-lossless") {
    const webpModule = await ensureWebp(wasmBaseUrl);
    const encoded = webpModule.encode(
      imageData.data,
      imageData.width,
      imageData.height,
      { ...webpDefaults, ...WEBP_NEAR_LOSSLESS_OPTIONS },
    );
    if (encoded === null) {
      throw new Error(
        "image-encoder: the near-lossless WebP encoder returned no data",
      );
    }
    return {
      bytes: new Uint8Array(encoded),
      mimeType,
      extension,
      width,
      height,
      wasmLoaded,
    };
  }

  if (variant === "jxl-lossless") {
    const jxlModule = await ensureJxl(wasmBaseUrl);
    const encoded = jxlModule.encode(
      imageData.data,
      imageData.width,
      imageData.height,
      { ...jxlDefaults, ...JXL_LOSSLESS_OPTIONS },
    );
    if (encoded === null) {
      throw new Error("image-encoder: the JPEG XL encoder returned no data");
    }
    return {
      bytes: new Uint8Array(encoded),
      mimeType,
      extension,
      width,
      height,
      wasmLoaded,
    };
  }

  if (variant === "avif-lossless") {
    const avifModule = await ensureAvif(wasmBaseUrl);
    const encoded = avifModule.encode(
      new Uint8Array(imageData.data.buffer),
      imageData.width,
      imageData.height,
      { ...avifDefaults, ...AVIF_LOSSLESS_OPTIONS },
    );
    if (encoded === null) {
      throw new Error("image-encoder: the AVIF encoder returned no data");
    }
    return {
      bytes: new Uint8Array(encoded),
      mimeType,
      extension,
      width,
      height,
      wasmLoaded,
    };
  }

  const qoiModule = await ensureQoi(wasmBaseUrl);
  const encoded = qoiModule.encode(
    imageData.data,
    imageData.width,
    imageData.height,
  );
  return {
    bytes: new Uint8Array(encoded),
    mimeType,
    extension,
    width,
    height,
    wasmLoaded,
  };
}
