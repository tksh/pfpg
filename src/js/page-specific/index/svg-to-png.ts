import { initSvg2rgba, svg2rgba } from "svg2ui8a";
import {
  updateButtonWithPngSize,
  updateButtonWithSvgSize,
} from "button/update-button-text";
import { t } from "i18n/i18n";
import { uploadRenderedImage } from "shared-image/generate-and-upload";
import { getSharedImageKeyHashForCurrentUrl } from "shared-image/shared-image-key";
import { type EncodedImage, encodeRasterImage } from "state/image-encoder";
import { displayFormatName } from "state/image-format";
import { extractViewboxValues } from "tab-canvas/crop-side-margins";

export {
  executeSvg2png,
  getLastRasterizedPixels,
  getLastRenderedImage,
  measureSvg2pngTime,
  type RasterizedPixels,
};

// Option type for the svg2ui8a rendering call (uses the package types as imported)
type RasterOption = NonNullable<Parameters<typeof svg2rgba>[1]>;

// Where the build copies the vendored rasterizer Wasm to. The package loads
// its binary from a URL, and `deno bundle` inlines the JavaScript but emits
// no Wasm asset, so the binary is served from our own origin; see
// src/assets/svg2ui8a/README.md.
const RASTERIZER_WASM_PATH = "./svg2ui8a/svg2rgba_bg.wasm";

// The rasterizer's Wasm module, once it has been loaded. The package takes
// the binary's location only before the module is loaded, so the
// initialization happens once, on the first render.
let rasterizerReady: Promise<void> | null = null;

function ensureRasterizer(): Promise<void> {
  rasterizerReady ??= initSvg2rgba({
    wasmUrl: new URL(RASTERIZER_WASM_PATH, globalThis.location.href).href,
  });
  return rasterizerReady;
}

// The encoded bytes of the latest render, for the download and clipboard
// actions. Those run outside the render call, but must write the same bytes
// the preview shows.
let lastRenderedImage: EncodedImage | null = null;

function getLastRenderedImage(): EncodedImage | null {
  return lastRenderedImage;
}

/**
 * The raw RGBA pixels of the latest render, before encoding.
 *
 * The image optimization modal re-encodes them into formats the Render tab
 * cannot make. Only the newest raster is kept: it is `width * height * 4`
 * bytes (64 MB at 4096 x 4096), so keeping earlier renders would grow without
 * bound as the user drags the size controls.
 */
interface RasterizedPixels {
  /** Straight-alpha RGBA, row-major, 4 bytes per pixel */
  pixels: Uint8Array;
  /** Raster width in pixels */
  width: number;
  /** Raster height in pixels */
  height: number;
}

let lastRasterizedPixels: RasterizedPixels | null = null;

function getLastRasterizedPixels(): RasterizedPixels | null {
  return lastRasterizedPixels;
}

// 連続操作が止まってからアップロードするまでの待ち時間
const UPLOAD_DEBOUNCE_MS = 5000;
let uploadTimer: number | undefined;
// 直前にアップロードした画像の識別子。同一画像の再アップロードを防ぐ。
let lastUploadedPublicId: string | null = null;

// Debounced upload target: skip when the artwork hash matches the last one
async function uploadOgImage(image: EncodedImage): Promise<void> {
  try {
    const hashHexPadded = await getSharedImageKeyHashForCurrentUrl();
    const publicId = `${hashHexPadded}-${image.extension}`;
    if (publicId === lastUploadedPublicId) {
      console.log("Skipping upload of the identical image:", publicId);
      return;
    }

    await uploadRenderedImage(image);
    lastUploadedPublicId = publicId;
  } catch (error) {
    console.error("Error uploading image:", error);
  }
}

// svg2rgba() を呼び出し 処理時間を計測する measureSvg2pngTime() を実行し 処理時間結果を表示する
async function executeSvg2png(
  event: { target: { value: string } },
  rasterOption: RasterOption,
): Promise<void> {
  // 処理時間を表示する HTML要素を 取得
  const renderingStatusElements = new Map<string, HTMLElement | null>([
    ["pngActionButton", document.getElementById("png-action-button")],
    ["lastRenderingTimeP", document.getElementById("last-rendering-time")],
  ]);

  // Input SVG string
  const svgString = event.target.value.trim();

  try {
    // Processing from SVG to an encoded image and measuring the time
    const image = await measureSvg2pngTime(
      svgString,
      rasterOption,
      renderingStatusElements,
    );

    //////////// shared image upload ////////////
    // エンコード済みの画像から OGイメージを生成 Cloudinary にアップロード。
    // 連続レンダリングのたびに即アップロードすると似た画像が並ぶため、
    // 最後のレンダリングから一定時間経ってから1回だけ実行する (デバウンス)。
    if (uploadTimer !== undefined) clearTimeout(uploadTimer);
    uploadTimer = setTimeout(() => {
      void uploadOgImage(image);
    }, UPLOAD_DEBOUNCE_MS);
    //////////// shared image upload ////////////
  } catch (error) {
    console.error(
      "An error occurred during the processing of the rendering:",
      error,
    );
  }

  // SVGファイルサイズを ダウンロードボタンに 表示する
  updateButtonWithSvgSize(svgString);
}

// Rendering from SVG to pixels, then encoding them into the selected format
async function rasterize(
  svgString: string,
  rasterOption: RasterOption,
): Promise<EncodedImage> {
  // Point the rasterizer at the vendored binary before the first render.
  await ensureRasterizer();
  // Render via svg2ui8a: the returned dimensions are authoritative for
  // everything downstream, including the aspect ratio of the output.
  const { pixels, width, height } = await svg2rgba(svgString, rasterOption);
  // Keep the pixels for the image optimization modal; see RasterizedPixels.
  lastRasterizedPixels = { pixels, width, height };
  return await encodeRasterImage(pixels, width, height);
}

// Encoding the raster and updating the preview, the size and the dimensions
async function encode(
  svgString: string,
  rasterOption: RasterOption,
): Promise<EncodedImage> {
  const image = await rasterize(svgString, rasterOption);
  lastRenderedImage = image;

  // Create a blob and its url
  const blob = new Blob([image.bytes.slice()], { type: image.mimeType });
  const blobUrl = URL.createObjectURL(blob);

  // Display the rasterized img on output area
  const outputImg = document.querySelector("#output img");
  if (!outputImg) throw new Error("Element '#output img' not found");
  (outputImg as HTMLImageElement).src = blobUrl;

  // Update the size and dimension info in HTML elements

  // Raster file size on the download/copy button
  updateButtonWithPngSize(image);

  // Raster pixel dimensions
  updateDimensionInfo("png", image.extension, image.width, image.height);

  // SVG viewBox dimension
  const viewboxValues = extractViewboxValues(svgString);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");
  const svgWidth = viewboxValues.get("w");
  const svgHeight = viewboxValues.get("h");
  if (svgWidth === undefined || svgHeight === undefined) {
    throw new Error("viewBox width/height not found in SVG string");
  }
  updateDimensionInfo("svg", "svg", svgWidth, svgHeight);

  return image;
}

/**
 * Updates the dimension information displayed for either a raster or the SVG source.
 * @param {string} elementKey - 'png' or 'svg', the id prefix of the info element.
 * @param {string} label     - the format name shown next to the values.
 * @param {number} widthValue  - The width value to display.
 * @param {number} heightValue - The height value to display.
 */
function updateDimensionInfo(
  elementKey: string,
  label: string,
  widthValue: number,
  heightValue: number,
): void {
  const container = document.querySelector(`#${elementKey}-info`);
  if (!container) throw new Error(`Element '#${elementKey}-info' not found`);

  // Create label element
  const labelElement = document.createElement("span");
  labelElement.textContent = label === "svg"
    ? t("render.sourceSvgViewBoxSize")
    : t("render.renderedPixelSize", { format: displayFormatName(label) });

  // Create value element
  const value = document.createElement("span");
  value.textContent = `${widthValue} x ${heightValue}`;

  // Clear existing content
  container.innerHTML = "";

  // Append new elements
  container.appendChild(labelElement);
  container.appendChild(value);
}

// Processing from SVG to an encoded image and measuring the time
async function measureSvg2pngTime(
  svgString: string,
  rasterOption: RasterOption,
  renderingStatusElements: Map<string, HTMLElement | null>,
): Promise<EncodedImage> {
  try {
    // 処理中メッセージを表示
    await updateRenderingStatus(
      t("render.nowRendering"),
      renderingStatusElements.get("pngActionButton"),
    );

    // 開始時刻を記録
    const startTime = performance.now();

    // 画像をエンコードする
    const image = await encode(svgString, rasterOption);

    // 終了時刻を記録
    const endTime = performance.now();

    // 処理時間を計算
    const elapsedTime = Math.floor(endTime - startTime);

    // 処理時間をコンソールに出力

    // 処理完了メッセージを表示
    await updateRenderingStatus(
      t("render.lastRenderingTime", { ms: elapsedTime }),
      renderingStatusElements.get("lastRenderingTimeP"),
    );

    // 処理結果を返す
    return image;
  } catch (error) {
    // エラー処理
    console.error(
      "An error occurred during the processing of the rendering:",
      error,
    );
    await updateRenderingStatus(
      t("render.errorOccurred"),
      renderingStatusElements.get("pngActionButton"),
    );
    throw error;
  }
}

// Update .innerHtml text
function updateRenderingStatus(
  text: string,
  element: HTMLElement | null | undefined,
): Promise<void> {
  return new Promise((resolve: () => void) => {
    if (!element) throw new Error("Rendering status element not found");
    // メッセージを更新し、次のフレームで反映させる
    element.innerHTML = text;
    requestAnimationFrame(() => {
      resolve();
    });
  });
}
