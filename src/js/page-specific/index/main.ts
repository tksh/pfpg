import { initDownloadButtons } from "button/init-download-buttons";
import { initButtonActionSelect } from "button/update-button-text";
import { decodeUrlToSvgForPage as decodeUrlToSvg } from "state/url-decode";
import {
  adjustLayoutIfNotMobile,
  initViewportLister,
} from "init/adjust-layout";
import { initTabs } from "init/tab-setup";
import {
  initImageOptimizationModalToggle,
  initSvgOptimizationModalToggle,
} from "modal/modal-toggle";
import { initImageOptimization } from "modal/optimize-image";
import { initSvgOptimization } from "modal/optimize-svg";
import { initResetSettings } from "modal/reset-settings";
import {
  applyImageCustomization,
  applySvgOptimization,
  applyUiConfiguration,
} from "state/apply-url-state";
import { svg2pngOption } from "state/resvg-option";
import { getState, updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import {
  initCropSideMarginsCheckbox,
  initShapeToTrimSelect,
  initTopHeavyRatioSelect,
  initWidthNarrownessSelect,
} from "tab-canvas/shape-to-trim-listener";
import { initColorFormatSelect } from "tab-lines/color-format";
import { initOptionDetailsToggleListener } from "tab-lines/details-toggle-listener";
import { initGroupColorsInputs } from "tab-lines/group-colors-listener";
import { initOpacityStepsSelect } from "tab-lines/opacity-steps";
import { initPathModeSelect } from "tab-lines/path-mode";
import { initRandomizeGroupColors } from "tab-lines/randomize-group-colors";
import {
  initHeightPixelSizeInputElements,
  initNumberInputValidatorListener,
} from "tab-render/height-pixel-size";
import { initShapeRenderingSelect } from "tab-render/shape-rendering";
import { initImageFormatSelect } from "tab-render/image-format";
import { initCheckerboardBgCheckbox } from "tab-ui/checkerboard-bg";
import { initTextWrappingCheckbox } from "tab-ui/text-wrapping";
import {
  getDefaultThemeViaPrefersColorScheme,
  initThemeColorSelect,
} from "tab-ui/theme-color";
import { initViewScalingSelect } from "tab-ui/view-scaling";

(async function (): Promise<void> {
  // Initialize sample artwork data.

  // If no URL parameters are present (e.g., on initial page load),
  // select a random artwork from the .artwork-item in 'Showcase' section and update the URL.
  if (!globalThis.location.search) {
    // Retrieve query strings from showcase artwork links.
    const hrefArray = Array.from(
      document.querySelectorAll("figure .artworks-container .artwork-item a"),
    )
      .map((a: Element) => {
        const url = new URL((a as HTMLAnchorElement).href);
        return url.search; // Extract the query string (including the '?').
      });
    // e.g.: Array ["?bits=~7&title=~202401_001&desc=001kObPF...jpKYE_m9iQ", ..., "?bits=~5&title=~202412_001&B=~231b...6jCW"]

    // Select a random query string.
    const randomIndex = Math.floor(Math.random() * hrefArray.length);
    const randomQueryString = hrefArray[randomIndex];
    if (randomQueryString === undefined) {
      throw new Error("No artwork query string found in showcase");
    }

    // Update the browser's history and URL with the selected query string.
    globalThis.history.pushState(
      {},
      "",
      globalThis.location.pathname + randomQueryString,
    );
  }

  // Initial decoding from url param to svg

  // Get the path-mode value
  // - If there is no url param of 'pathMode', use 'absoluteSeparated' as default.
  const isRelative = getState("pathMode") === "relativeMerged";
  const pathModeSelect = document.getElementById("path-mode");
  if (!pathModeSelect) throw new Error("Element 'path-mode' not found");
  (pathModeSelect as HTMLSelectElement).value = isRelative
    ? "relativeMerged"
    : "absoluteSeparated";

  // Decode the SVG from url params
  const initialDecodedSvgString = await decodeUrlToSvg(isRelative);

  // URLに themeColor が既にある場合はそれを尊重し、ブラウザ設定による検知・上書きは行わない
  const existingThemeColor = getState("themeColor");
  const themeColor = existingThemeColor ??
    getDefaultThemeViaPrefersColorScheme();
  if (!existingThemeColor) {
    updateState("themeColor", themeColor);
  }

  // Apply URL params to customize SVG, falling back to SETTINGS_DEFAULTS when empty
  if (initialDecodedSvgString === undefined) {
    throw new Error("No artwork URL params to decode");
  }
  const svgString = await applyImageCustomization(
    initialDecodedSvgString,
    svg2pngOption,
  );

  // Initial rendering. The rasterizer loads its Wasm module on the first
  // render, and the render path points it at the vendored binary, so there is
  // no separate initialization step here.
  executeSvg2png({ target: { value: svgString } }, svg2pngOption);

  // Restore SVG string optimization
  // - This processes doesn't affect the rendering result
  // - It only updates the SVG string
  const optimizedSvg = applySvgOptimization(svgString);

  // Insert the SVG string to textarea
  const svgTextarea = document.querySelector("#svg-string");
  if (!svgTextarea) throw new Error("Element '#svg-string' not found");
  (svgTextarea as HTMLTextAreaElement).value = optimizedSvg;

  // Startup layout initialization process must be executed before 'DOMContentLoaded'
  adjustLayoutIfNotMobile();
})(); // `(async function () { ... })` 無名即時実行関数

// IIFEの外にDOMContentLoadedイベントリスナーを設定
// - 即時実行関数（IIFE: Immediately Invoked Function Expression）

// DOMContentLoadedイベント
// - HTMLのパースが完了し DOMツリーが構築された時点で発火する

// 'Group colors', 'Opacity steps' などのインプットHTMLタグ要素は
// 最初の即実行関数内のSVGデコード時に URLパラメータのデータから 動的に生成されるので
// それを待ってからイベントリスナーを設定する

document.addEventListener("DOMContentLoaded", () => {
  const imageUrl =
    "https://res.cloudinary.com/ddoy3pmjg/image/upload/v1734026224/cld-sample-3.jpg";
  const ogImageMeta = document.querySelector('meta[property="og:image"]');
  if (!ogImageMeta) {
    throw new Error("Element 'meta[property=\"og:image\"]' not found");
  }
  (ogImageMeta as HTMLMetaElement).content = imageUrl;

  // Get first tab ('Lines') activated
  initTabs();

  // Tab - Lines
  initGroupColorsInputs();
  initPathModeSelect();
  initOpacityStepsSelect();
  initColorFormatSelect();
  initOptionDetailsToggleListener();
  initRandomizeGroupColors();

  // Tab - Canvas
  initShapeToTrimSelect();
  initWidthNarrownessSelect();
  initTopHeavyRatioSelect();
  initCropSideMarginsCheckbox();

  // Tab - Render
  initShapeRenderingSelect();
  initHeightPixelSizeInputElements();
  initNumberInputValidatorListener();
  initImageFormatSelect();

  // Tab - UI
  initViewScalingSelect();
  initCheckerboardBgCheckbox();
  initTextWrappingCheckbox();
  initButtonActionSelect();
  initThemeColorSelect();

  // Apply the UI configuration values retrieved from url params.
  // if there is no url param for specific attr,
  // get the default value from 'SETTINGS_DEFAULTS'
  // or detect the default value from data or environment.
  applyUiConfiguration();

  // Buttons for SVG and PNG
  initDownloadButtons();

  // Modal - SVG optimization
  initSvgOptimizationModalToggle();
  initSvgOptimization();

  // Modal - Image optimization. The toggle runs first: it opens the dialog on
  // the click that also starts the conversions.
  initImageOptimizationModalToggle();
  initImageOptimization();

  // Modal - Reset settings
  initResetSettings();

  // Add event lister to viewport for continuous resizing the output boxes (PNG and SVG)
  initViewportLister();
});
