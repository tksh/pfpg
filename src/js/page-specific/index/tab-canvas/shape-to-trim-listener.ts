import { getSvgString } from "button/download-as-file";
import { adjustLayoutIfNotMobile } from "init/adjust-layout";
import { svg2pngOption } from "state/resvg-option";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import { updateSvgWithNewShapePath } from "tab-canvas/shape-to-trim";
import {
  cropSideMargins,
  resetSideMargins,
} from "tab-canvas/crop-side-margins";

export {
  initCropSideMarginsCheckbox,
  initShapeToTrimSelect,
  initTopHeavyRatioSelect,
  initWidthNarrownessSelect,
  toggleDisplay,
};

// Event listener for 'Shape to trim'
function initShapeToTrimSelect(): void {
  const shapeToTrimSelect = document.getElementById("shape-to-trim");
  if (!shapeToTrimSelect) throw new Error("Element 'shape-to-trim' not found");
  shapeToTrimSelect.addEventListener("change", async (event: Event) => {
    // 選択された値を取得
    const shapeToTrim = (event.target as HTMLSelectElement).value; // square|circle|squircle|squircleSlimmed
    updateState("shapeToTrim", shapeToTrim);

    // 'squircleSlimmed'が 選ばれた時だけ表示される
    // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
    const elementsToToggle = [
      "width-narrowness-div",
      "top-heavy-ratio-div",
      "crop-side-margins-div",
    ];

    if (shapeToTrim === "squircleSlimmed") {
      toggleDisplay(elementsToToggle, "inline");
      adjustLayoutIfNotMobile();
    } else {
      toggleDisplay(elementsToToggle, "none");
      adjustLayoutIfNotMobile();
    }

    // Update the SVG string with new clip shape path and viewBox
    const inputSvg = getSvgString();
    const updatedSvg = await updateSvgWithNewShapePath(shapeToTrim, inputSvg);

    const svgTextarea = document.querySelector("#svg-string");
    if (!svgTextarea) throw new Error("Element '#svg-string' not found");
    (svgTextarea as HTMLTextAreaElement).value = updatedSvg; // Update the textarea
    executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption); // Render to PNG
  });
}

// Function to toggle display of below two <select> elements
function toggleDisplay(elements: string[], display: string): void {
  elements.forEach((element: string) => {
    const toggleTarget = document.getElementById(element);
    if (!toggleTarget) throw new Error(`Element '${element}' not found`);
    toggleTarget.style.display = display;
  });
}

// Event listeners for options that will be activated when 'Squircle, slimmed' is selected:
// - 'Width narrowness'
// - 'Top-heavy ratio'

function initWidthNarrownessSelect(): void {
  const widthNarrownessSelect = document.getElementById("width-narrowness");
  if (!widthNarrownessSelect) {
    throw new Error("Element 'width-narrowness' not found");
  }
  widthNarrownessSelect.addEventListener("change", async (event: Event) => {
    const widthNarrowness = (event.target as HTMLSelectElement).value;
    updateState("widthNarrowness", widthNarrowness);

    const updatedSvg = await updateSvgWithNewShapePath(
      "squircleSlimmed",
      getSvgString(),
    );

    const svgTextarea = document.querySelector("#svg-string");
    if (!svgTextarea) throw new Error("Element '#svg-string' not found");
    (svgTextarea as HTMLTextAreaElement).value = updatedSvg; // Update the textarea
    executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption); // Render to PNG
  });
}

function initTopHeavyRatioSelect(): void {
  const topHeavyRatioSelect = document.getElementById("top-heavy-ratio");
  if (!topHeavyRatioSelect) {
    throw new Error("Element 'top-heavy-ratio' not found");
  }
  topHeavyRatioSelect.addEventListener("change", async (event: Event) => {
    const topHeavyRatio = (event.target as HTMLSelectElement).value;
    updateState("topHeavyRatio", topHeavyRatio);

    const updatedSvg = await updateSvgWithNewShapePath(
      "squircleSlimmed",
      getSvgString(),
    );

    const svgTextarea = document.querySelector("#svg-string");
    if (!svgTextarea) throw new Error("Element '#svg-string' not found");
    (svgTextarea as HTMLTextAreaElement).value = updatedSvg; // Update the textarea
    executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption); // Render to PNG
  });
}

// Event listener for 'Crop side margins'

function initCropSideMarginsCheckbox(): void {
  const cropSideMarginsCheckbox = document.getElementById("crop-side-margins");
  if (!cropSideMarginsCheckbox) {
    throw new Error("Element 'crop-side-margins' not found");
  }
  cropSideMarginsCheckbox.addEventListener("change", async (event: Event) => {
    const svgString = getSvgString();
    (event.target as HTMLInputElement).checked
      ? await cropSideMargins(svgString)
      : await resetSideMargins(svgString);
  });
}
