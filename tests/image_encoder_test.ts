import { assert, assertEquals, assertMatch, assertRejects } from "@std/assert";
import { decode as decodePng } from "@jsquash/png";
import decodeWebp from "@jsquash/webp-decode";
import decodeJxl from "@jsquash/jxl-decode";
import decodeAvif from "@jsquash/avif-decode";
import decodeQoi from "@jsquash/qoi-decode";
import encodeWebpDirectly from "jsquash/webp-encode";
import {
  encodeRasterImage,
  encodeRasterVariant,
  WASM_DIRECTORY,
  WEBP_LOSSLESS_OPTIONS,
  WEBP_NEAR_LOSSLESS_OPTIONS,
} from "state/image-encoder";

// The vendored Wasm, exactly as the build serves it to the page
const WASM_BASE = new URL("../src/assets/jsquash/", import.meta.url).href;

// A small image with the pixel cases the encoders treat differently: fully
// transparent pixels carrying invisible RGB, and semi-transparent pixels.
const WIDTH = 8;
const HEIGHT = 8;
const PIXELS = new Uint8Array(WIDTH * HEIGHT * 4);
for (let i = 0; i < WIDTH * HEIGHT; i++) {
  PIXELS[i * 4] = (i * 17) % 256;
  PIXELS[i * 4 + 1] = (i * 7) % 256;
  PIXELS[i * 4 + 2] = 200;
  PIXELS[i * 4 + 3] = i % 4 === 0 ? 0 : (i % 3 === 0 ? 128 : 255);
}

function toImageData(): ImageData {
  return new ImageData(new Uint8ClampedArray(PIXELS), WIDTH, HEIGHT);
}

function assertPixelsEqual(actual: Uint8ClampedArray): void {
  assertEquals(
    actual.length,
    PIXELS.length,
    "decoded pixels must have the same size",
  );
  for (let i = 0; i < PIXELS.length; i++) {
    assertEquals(
      actual[i],
      PIXELS[i],
      `pixel byte ${i} (rgba index ${i % 4}) differs`,
    );
  }
}

function pngDimensions(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(
    bytes.buffer as ArrayBuffer,
    bytes.byteOffset,
    bytes.byteLength,
  );
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

// Must run before any successful encode: the encoders cache their module
// per session, so afterwards a bad Wasm URL is never looked up.
Deno.test("a missing Wasm file is reported, and not cached", async () => {
  await assertRejects(
    () =>
      encodeRasterImage(PIXELS, WIDTH, HEIGHT, {
        format: "png",
        wasmBaseUrl: new URL("./nowhere/", import.meta.url).href,
      }),
    Error,
    // The message differs by environment (a 404 in the browser, a fetch
    // failure for file: URLs); naming the file is what both do.
    "squoosh_oxipng_bg.wasm",
  );
  // The failed init must not poison the cache: the next render, with the
  // right base URL, has to work.
  const image = await encodeRasterImage(PIXELS, WIDTH, HEIGHT, {
    format: "png",
    wasmBaseUrl: WASM_BASE,
  });
  assertEquals(pngDimensions(image.bytes), { width: WIDTH, height: HEIGHT });
});

Deno.test("the Wasm is vendored and the build serves it from dist/jsquash", async () => {
  for (
    const file of [
      "webp_enc.wasm",
      "webp_enc_simd.wasm",
      "squoosh_oxipng_bg.wasm",
      "jxl_enc.wasm",
      "avif_enc.wasm",
      "qoi_enc.wasm",
    ]
  ) {
    const stat = await Deno.stat(new URL(file, WASM_BASE));
    assert(stat.size > 0, `${file} must be vendored`);
  }

  // The page asks for the Wasm relative to itself, so the build has to copy
  // the vendored directory to exactly that place in dist/.
  assertEquals(WASM_DIRECTORY, "./jsquash/");
  const config = await Deno.readTextFile(
    new URL("../deno.jsonc", import.meta.url),
  );
  assertMatch(
    config,
    /"copy:encoder-wasm":\s*"cp -r src\/assets\/jsquash dist"/,
  );
});

Deno.test("PNG encoding keeps every pixel", async () => {
  const image = await encodeRasterImage(PIXELS, WIDTH, HEIGHT, {
    format: "png",
    wasmBaseUrl: WASM_BASE,
  });

  assertEquals(image.extension, "png");
  assertEquals(image.mimeType, "image/png");
  assertEquals(image.width, WIDTH);
  assertEquals(image.height, HEIGHT);
  // PNG signature
  assertEquals([...image.bytes.slice(0, 4)], [0x89, 0x50, 0x4e, 0x47]);
  assertEquals(pngDimensions(image.bytes), { width: WIDTH, height: HEIGHT });

  const decoded = await decodePng(image.bytes.slice().buffer);
  assertPixelsEqual(decoded.data);
});

Deno.test("WebP encoding is lossless, including transparent pixels", async () => {
  const image = await encodeRasterImage(PIXELS, WIDTH, HEIGHT, {
    format: "webp",
    wasmBaseUrl: WASM_BASE,
  });

  assertEquals(image.extension, "webp");
  assertEquals(image.mimeType, "image/webp");
  const asText = (offset: number, length: number) =>
    new TextDecoder().decode(image.bytes.slice(offset, offset + length));
  assertEquals(asText(0, 4), "RIFF");
  assertEquals(asText(8, 4), "WEBP");
  // VP8L is the lossless chunk; a lossy encode would be VP8 or VP8L via VP8X
  assertEquals(asText(12, 4), "VP8L", "WebP must use the lossless chunk");

  const decoded = await decodeWebp(image.bytes.slice().buffer);
  assertPixelsEqual(decoded.data);
});

Deno.test("the 'exact' option is what makes WebP lossless", async () => {
  // Encoding the same pixels without `exact` must NOT round-trip: libwebp
  // then discards the invisible RGB of fully transparent pixels. If this test
  // ever stops failing, `exact: 1` became unnecessary for the pixels this
  // fixture covers — but it is still the honest setting for a
  // "WebP (lossless)" label.
  const lossyEnough = new Uint8Array(
    await encodeWebpDirectly(toImageData(), { lossless: 1 }),
  );
  const decoded = await decodeWebp(lossyEnough.slice().buffer);
  let differing = 0;
  for (let i = 0; i < PIXELS.length; i++) {
    if (decoded.data[i] !== PIXELS[i]) differing++;
  }
  assert(
    differing > 0,
    "expected { lossless: 1 } alone to alter the transparent pixels",
  );

  assertEquals(WEBP_LOSSLESS_OPTIONS, { lossless: 1, exact: 1 });
});

Deno.test("WebP near-lossless encoding produces a WebP file", async () => {
  const image = await encodeRasterVariant(
    PIXELS,
    WIDTH,
    HEIGHT,
    "webp-near-lossless",
    {
      wasmBaseUrl: WASM_BASE,
    },
  );

  assertEquals(image.extension, "webp");
  assertEquals(image.mimeType, "image/webp");
  const asText = (offset: number, length: number) =>
    new TextDecoder().decode(image.bytes.slice(offset, offset + length));
  assertEquals(asText(0, 4), "RIFF");
  assertEquals(asText(8, 4), "WEBP");
  // The near-lossless strength is fixed; the modal has no picker for it.
  assertEquals(WEBP_NEAR_LOSSLESS_OPTIONS, { near_lossless: 60, quality: 100 });
});

Deno.test("JPEG XL lossless encoding keeps every pixel", async () => {
  const image = await encodeRasterVariant(
    PIXELS,
    WIDTH,
    HEIGHT,
    "jxl-lossless",
    {
      wasmBaseUrl: WASM_BASE,
    },
  );

  assertEquals(image.extension, "jxl");
  assertEquals(image.mimeType, "image/jxl");
  assertEquals(image.width, WIDTH);
  assertEquals(image.height, HEIGHT);

  const decoded = await decodeJxl(image.bytes.slice().buffer);
  assertPixelsEqual(decoded.data);
});

Deno.test("AVIF lossless encoding keeps every pixel", async () => {
  const image = await encodeRasterVariant(
    PIXELS,
    WIDTH,
    HEIGHT,
    "avif-lossless",
    {
      wasmBaseUrl: WASM_BASE,
    },
  );

  assertEquals(image.extension, "avif");
  assertEquals(image.mimeType, "image/avif");
  // AVIF is ISO-BMFF: the ftyp box starts at offset 4.
  const asText = (offset: number, length: number) =>
    new TextDecoder().decode(image.bytes.slice(offset, offset + length));
  assertEquals(asText(4, 4), "ftyp");

  const decoded = await decodeAvif(image.bytes.slice().buffer);
  assert(decoded !== null, "AVIF decode must return pixels");
  assertPixelsEqual(decoded.data);
});

Deno.test("QOI encoding keeps every pixel and carries the qoif header", async () => {
  const image = await encodeRasterVariant(PIXELS, WIDTH, HEIGHT, "qoi", {
    wasmBaseUrl: WASM_BASE,
  });

  assertEquals(image.extension, "qoi");
  assertEquals(image.mimeType, "image/qoi");
  const asText = (offset: number, length: number) =>
    new TextDecoder().decode(image.bytes.slice(offset, offset + length));
  assertEquals(asText(0, 4), "qoif");
  const view = new DataView(
    image.bytes.buffer,
    image.bytes.byteOffset,
    image.bytes.byteLength,
  );
  assertEquals(view.getUint32(4), WIDTH);
  assertEquals(view.getUint32(8), HEIGHT);

  const decoded = await decodeQoi(image.bytes.slice().buffer);
  assertPixelsEqual(decoded.data);
});
