import { getArtworkTitle } from "button/download-as-file";
import {
  encodeRasterVariant,
  type ImageOptimizationVariant,
  type OptimizedImage,
} from "state/image-encoder";
import { getLastRasterizedPixels } from "svg-to-png";
import { roundToOneDecimal } from "utils/number-rounding";

export { initImageOptimization };

/**
 * One row of the modal.
 *
 * `encode` is the same call the row's download button will offer; the label
 * and the format metadata are what the row shows and what names the file.
 */
interface ImageOptimizationTarget {
  id: ImageOptimizationVariant;
  label: string;
  extension: string;
  mimeType: string;
  encode(
    pixels: Uint8Array,
    width: number,
    height: number,
  ): Promise<OptimizedImage>;
}

// Encode order: the two formats the Render tab already produced come first,
// then the new ones. AVIF and JPEG XL are the slow rows, and each row's
// spinner shows while its own encode runs.
const TARGETS: ImageOptimizationTarget[] = [
  {
    id: "webp-lossless",
    label: "WebP (lossless)",
    extension: "webp",
    mimeType: "image/webp",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "webp-lossless"),
  },
  {
    id: "webp-near-lossless",
    label: "WebP (near lossless)",
    extension: "webp",
    mimeType: "image/webp",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "webp-near-lossless"),
  },
  {
    id: "jxl-lossless",
    label: "Jpeg XL (lossless)",
    extension: "jxl",
    mimeType: "image/jxl",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "jxl-lossless"),
  },
  {
    id: "png",
    label: "PNG",
    extension: "png",
    mimeType: "image/png",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "png"),
  },
  {
    id: "avif-lossless",
    label: "AVIF (lossless)",
    extension: "avif",
    mimeType: "image/avif",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "avif-lossless"),
  },
  {
    id: "qoi",
    label: "QOI",
    extension: "qoi",
    mimeType: "image/qoi",
    encode: (pixels, width, height) =>
      encodeRasterVariant(pixels, width, height, "qoi"),
  },
];

/** What a finished row downloads. */
interface OptimizationResult {
  /** Blob URL of the encoded bytes; revoked when the modal closes. */
  url: string;
  width: number;
  height: number;
  /** File extension of the encoded bytes, without the leading dot. */
  extension: string;
}

// Every click on the output image starts a run. A run is a generation
// counter: closing the modal invalidates the generation, so an encode that
// is still running cannot fill a closed dialog or leak its Blob URL.
let currentRun = 0;
const results = new Map<ImageOptimizationVariant, OptimizationResult>();

/**
 * Wire the image optimization modal.
 *
 * The click that opens the modal is handled by
 * initImageOptimizationModalToggle(); this listener starts the conversions on
 * that same click, and re-runs them on every later click, so reopening the
 * modal after a re-render optimizes the new pixels.
 */
function initImageOptimization(): void {
  const modal = document.getElementById("img-opt-modal");
  if (modal === null) {
    throw new Error("initImageOptimization: missing element #img-opt-modal");
  }
  if (!(modal instanceof HTMLDialogElement)) {
    throw new Error(
      "initImageOptimization: element #img-opt-modal is not a <dialog>",
    );
  }

  const outputImage = document.querySelector("#output img");
  if (outputImage === null) {
    throw new Error("initImageOptimization: missing element '#output img'");
  }

  // Fail early, not when a row is being filled, if the markup and the
  // registry disagree.
  for (const target of TARGETS) {
    const row = getRow(modal, target);
    getRowButton(row, target).addEventListener("click", () => {
      const result = results.get(target.id);
      if (result !== undefined) {
        downloadResult(target, result);
      }
    });
  }

  outputImage.addEventListener("click", () => {
    void runOptimizations(modal);
  });
  modal.addEventListener("close", () => {
    clearResults(modal);
  });
}

async function runOptimizations(modal: HTMLDialogElement): Promise<void> {
  clearResults(modal);
  const run = currentRun;

  const raster = getLastRasterizedPixels();
  if (raster === null) {
    for (const target of TARGETS) {
      const row = getRow(modal, target);
      getRowSizeValue(row, target).textContent = "No rendered image yet";
      getRowSizeUnit(row, target).textContent = "";
    }
    return;
  }

  for (const target of TARGETS) {
    if (run !== currentRun) return;

    const row = getRow(modal, target);
    row.classList.add("is-working");
    // Paint the spinner before the encode blocks the main thread.
    await nextFrame();
    if (run !== currentRun) return;

    const started = performance.now();
    try {
      const image = await target.encode(
        raster.pixels,
        raster.width,
        raster.height,
      );
      const elapsed = performance.now() - started;
      if (run !== currentRun) return;
      finishRow(row, target, image, elapsed);
    } catch (error) {
      if (run !== currentRun) return;
      failRow(row, target, error);
    }
  }
}

function finishRow(
  row: HTMLElement,
  target: ImageOptimizationTarget,
  image: OptimizedImage,
  elapsed: number,
): void {
  row.classList.remove("is-working");

  const byteSize = image.bytes.byteLength;
  // The size runs over two cells and two lines: the value cell holds the KB
  // figure and the opening of the exact byte count, the unit cell holds their
  // units. `white-space: pre-line` turns the `\n`s into the line breaks that
  // stack "4.3 KB" over "(4,392 bytes)".
  getRowSizeValue(row, target).textContent = `${
    roundToOneDecimal(byteSize / 1024)
  }\n(${byteSize.toLocaleString()}`;
  getRowSizeUnit(row, target).textContent = "KB\nbytes)";
  getRowTime(row, target).textContent = `${Math.round(elapsed)} ms${
    image.wasmLoaded ? "\n(+ wasm load)" : ""
  }`;

  // `.slice()` copies: the Blob must outlive the encoder's Wasm memory.
  const url = URL.createObjectURL(
    new Blob([image.bytes.slice()], { type: target.mimeType }),
  );
  results.set(target.id, {
    url,
    width: image.width,
    height: image.height,
    extension: target.extension,
  });
  getRowButton(row, target).disabled = false;
}

function failRow(
  row: HTMLElement,
  target: ImageOptimizationTarget,
  error: unknown,
): void {
  row.classList.remove("is-working");
  row.classList.add("has-error");
  getRowSizeValue(row, target).textContent = "Failed";
  getRowSizeUnit(row, target).textContent = "";
  console.error(`Image optimization (${target.id}: ${target.label}):`, error);
}

function downloadResult(
  target: ImageOptimizationTarget,
  result: OptimizationResult,
): void {
  try {
    const link = document.createElement("a");
    link.href = result.url;
    link.download =
      `${getArtworkTitle()}-${result.width}x${result.height}px-opt-${target.id}.${result.extension}`;
    link.click();
  } catch (error) {
    console.error("Image optimization: cannot build the file name:", error);
  }
}

/** Invalidate the current run, drop the results and empty every row. */
function clearResults(modal: HTMLDialogElement): void {
  currentRun++;
  for (const result of results.values()) {
    URL.revokeObjectURL(result.url);
  }
  results.clear();

  for (const target of TARGETS) {
    const row = getRow(modal, target);
    row.classList.remove("is-working", "has-error");
    getRowSizeValue(row, target).textContent = "";
    getRowSizeUnit(row, target).textContent = "";
    getRowTime(row, target).textContent = "";
    getRowButton(row, target).disabled = true;
  }
}

function getRow(
  modal: HTMLDialogElement,
  target: ImageOptimizationTarget,
): HTMLElement {
  const row = modal.querySelector<HTMLElement>(
    `[data-target="${target.id}"]`,
  );
  if (row === null) {
    throw new Error(
      `optimize-image: missing a row for target '${target.id}'`,
    );
  }
  return row;
}

function getRowPart(
  row: HTMLElement,
  target: ImageOptimizationTarget,
  selector: string,
): HTMLElement {
  const part = row.querySelector<HTMLElement>(selector);
  if (part === null) {
    throw new Error(
      `optimize-image: target '${target.id}' has no element '${selector}'`,
    );
  }
  return part;
}

// The size is two cells: the value (`4.3` over `(4,392`) and the unit (`KB`
// over `bytes)`). finishRow() is what fills them in.
function getRowSizeValue(
  row: HTMLElement,
  target: ImageOptimizationTarget,
): HTMLElement {
  return getRowPart(row, target, ".img-opt-size-value");
}

function getRowSizeUnit(
  row: HTMLElement,
  target: ImageOptimizationTarget,
): HTMLElement {
  return getRowPart(row, target, ".img-opt-size-unit");
}

function getRowTime(
  row: HTMLElement,
  target: ImageOptimizationTarget,
): HTMLElement {
  return getRowPart(row, target, ".img-opt-time");
}

function getRowButton(
  row: HTMLElement,
  target: ImageOptimizationTarget,
): HTMLButtonElement {
  const button = getRowPart(row, target, "button.img-opt-download");
  if (!(button instanceof HTMLButtonElement)) {
    throw new Error(
      `optimize-image: target '${target.id}' download control is not a button`,
    );
  }
  return button;
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
