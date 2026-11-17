import { adjustLayoutIfNotMobile } from "init/adjust-layout";
import { commitRender } from "state/render-commit";
import { updateState } from "state/url-state-manager";

export {
  initCropSideMarginsCheckbox,
  initShapeToTrimSelect,
  initTopHeavyRatioSelect,
  initWidthNarrownessSelect,
  toggleDisplay,
};

// Elements shown only while 'Squircle, slimmed' is selected
const SQUIRCLE_SLIMMED_OPTIONS = [
  "width-narrowness-div",
  "top-heavy-ratio-div",
  "crop-side-margins-div",
];

// Event listener for 'Shape to trim'
function initShapeToTrimSelect(): void {
  const shapeToTrimSelect = document.getElementById("shape-to-trim");
  if (!shapeToTrimSelect) throw new Error("Element 'shape-to-trim' not found");
  shapeToTrimSelect.addEventListener("change", (event: Event) => {
    // 選択された値を取得
    const shapeToTrim = (event.target as HTMLSelectElement).value; // square|circle|squircle|squircleSlimmed
    updateState("shapeToTrim", shapeToTrim);

    // 'squircleSlimmed'が 選ばれた時だけ 2つの <select> と
    // 横幅クロップ用の <label>&<input> を表示する
    toggleDisplay(
      SQUIRCLE_SLIMMED_OPTIONS,
      shapeToTrim === "squircleSlimmed" ? "inline" : "none",
    );
    adjustLayoutIfNotMobile();

    commitRender();
  });
}

// Function to toggle display of below two <select> elements
function toggleDisplay(elements: string[], display: string): void {
  elements.forEach((element) => {
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
  widthNarrownessSelect.addEventListener("change", (event: Event) => {
    const widthNarrowness = (event.target as HTMLSelectElement).value;
    updateState("widthNarrowness", widthNarrowness);

    commitRender();
  });
}

function initTopHeavyRatioSelect(): void {
  const topHeavyRatioSelect = document.getElementById("top-heavy-ratio");
  if (!topHeavyRatioSelect) {
    throw new Error("Element 'top-heavy-ratio' not found");
  }
  topHeavyRatioSelect.addEventListener("change", (event: Event) => {
    const topHeavyRatio = (event.target as HTMLSelectElement).value;
    updateState("topHeavyRatio", topHeavyRatio);

    commitRender();
  });
}

// Event listener for 'Crop side margins'
function initCropSideMarginsCheckbox(): void {
  const cropSideMarginsCheckbox = document.getElementById("crop-side-margins");
  if (!cropSideMarginsCheckbox) {
    throw new Error("Element 'crop-side-margins' not found");
  }
  cropSideMarginsCheckbox.addEventListener("change", (event: Event) => {
    updateState("cropSideMargins", (event.target as HTMLInputElement).checked);

    commitRender();
  });
}
