import { TAB_SPACE } from "constants";
import { tryRemoveSpaces } from "modal/optimize-svg";
import { getState, updateState } from "state/url-state-manager";
import {
  calculateSquircleSlimmedSides,
  extractViewboxValues,
  viewboxUnSlimmed,
} from "tab-canvas/crop-side-margins";
import { roundToTwoDecimals, toFixedTrimmed } from "utils/number-rounding";

// Rounded 'Squircle, slimmed' geometry shared by the clip path and the viewBox
interface SquircleSlimmedGeometry {
  gridSize: number;
  center: number;
  left: number;
  right: number;
  topControlPoint: number;
  pathData: string;
}

// Update SVG with selected shape path
export async function updateSvgWithNewShapePath(
  shape: string,
  inputSvg: string,
): Promise<string> {
  const shapeToTrimSelect = document.getElementById("shape-to-trim");
  if (!shapeToTrimSelect) throw new Error("Element 'shape-to-trim' not found");
  (shapeToTrimSelect as HTMLSelectElement).value = shape;

  // Params for generating the 'Squircle' and 'Squircle, slimmed' shape path
  const viewboxValues = extractViewboxValues(inputSvg);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");
  const gridHeight = viewboxValues.get("h");
  if (gridHeight === undefined) {
    throw new Error("viewBox height ('h') not found in SVG string");
  }
  const gridSize = gridHeight;
  const center = roundToTwoDecimals(gridSize / 2);

  // Generate new shape path to trim
  const squircleSlimmedGeometry = shape === "squircleSlimmed"
    ? generateClippathShapeOfSquircleSlimmed(
      inputSvg,
      getWidthNarrowness(),
      getTopHeavyRatio(),
    )
    : null;
  const shapePath = squircleSlimmedGeometry
    ? squircleSlimmedGeometry.pathData
    : shape === "square"
    ? `<rect width="100%" height="100%" />`
    : shape === "circle"
    ? `<circle cx="50%" cy="50%" r="50%" />`
    : `<path d="M 0 ${center} Q 0 0 ${center} 0 T ${gridSize} ${center} ${center} ${gridSize} 0 ${center}" />`; // shape === 'squircle'

  // Optimize the SVG if 'Remove Extra Spaces' checked
  const isSpacesRemoved = getState("removeSpaces");
  updateState("removeSpaces", isSpacesRemoved);
  const shapePathOptimized = tryRemoveSpaces(shapePath, isSpacesRemoved);

  // Replace to new shape <clipPath> (With indentation or not decided by 'Remove Line Breaks' checked)
  const patternForClippathShape =
    /<clipPath id="shape-to-trim">(\n?).*(\n?).*<\/clipPath>/g;
  const isLineBreaksRemoved = getState("removeLineBreaks");
  const newClippathSvg = isLineBreaksRemoved
    ? inputSvg.replace(
      patternForClippathShape,
      `<clipPath id="shape-to-trim">${shapePathOptimized}</clipPath>`,
    )
    : inputSvg.replace(
      patternForClippathShape,
      `<clipPath id="shape-to-trim">\n${
        TAB_SPACE.repeat(3)
      }${shapePathOptimized}\n${TAB_SPACE.repeat(2)}</clipPath>`,
    );

  // Update the viewBox string
  // - If 'squircleSlimmed' selected, update the viewBox from the same rounded
  //   left/right values used for the clip path, by current 'cropSideMargin' bool.
  // - If 'square|circle|squircle' selected, always apply the viewboxUnSlimmed() to reset the viewBox to original grid dimension.
  const clippathAndViewboxUpdatedSvg =
    squircleSlimmedGeometry && isCropSideMargins()
      ? viewboxSlimmedFromGeometry(
        newClippathSvg,
        squircleSlimmedGeometry,
        viewboxValues,
      )
      : await viewboxUnSlimmed(newClippathSvg);

  return clippathAndViewboxUpdatedSvg;
}

// Update the viewBox from the same rounded geometry used for the clip path
function viewboxSlimmedFromGeometry(
  inputSvg: string,
  geometry: SquircleSlimmedGeometry,
  viewboxValues: Map<string, number>,
): string {
  const newViewboxString = `viewBox="${toFixedTrimmed(geometry.left)} ${
    viewboxValues.get("y")
  } ${toFixedTrimmed(geometry.right - geometry.left)} ${
    viewboxValues.get("h")
  }"`;

  // Replace the viewBox string with new one
  const patternForViewboxStr = /viewBox="[^"]+"/;
  return inputSvg.replace(patternForViewboxStr, newViewboxString);
}

// For 'Squircle, slimmed' selected

// Generate the geometry of 'Squircle, slimmed'
function generateClippathShapeOfSquircleSlimmed(
  inputSvg: string,
  widthNarrowness: number,
  topHeavyRatio: number,
): SquircleSlimmedGeometry {
  console.log(
    "widthNarrowness, topHeavyRatio: ",
    widthNarrowness,
    topHeavyRatio,
  );

  const viewboxValues = extractViewboxValues(inputSvg);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");
  const gridHeight = viewboxValues.get("h");
  if (gridHeight === undefined) {
    throw new Error("viewBox height ('h') not found in SVG string");
  }
  const gridSize = gridHeight;
  const center = getCenter(gridSize);

  // generate the geometry of squircle slimmed
  const { left, right } = calculateSquircleSlimmedSides(
    gridSize,
    widthNarrowness,
  );
  const topControlPoint = roundToTwoDecimals(
    left - ((gridSize / 100) * topHeavyRatio),
  );
  const pathData =
    `<path d="M ${left} ${center} Q ${topControlPoint} 0 ${center} 0 T ${right} ${center} ${center} ${gridSize} ${left} ${center}" />`;

  return { gridSize, center, left, right, topControlPoint, pathData };
}

// Get center (the half of grid size)
function getCenter(gridSize: number): number {
  const center = roundToTwoDecimals(gridSize / 2);
  return center;
}

// Three options for 'Squircle, slimmed'

// "Width narrowness" value: number
function getWidthNarrowness(): number {
  // Get the value from url param
  const widthNarrowness = getState("widthNarrowness");
  if (widthNarrowness) {
    const widthNarrownessSelect = document.getElementById("width-narrowness");
    if (!widthNarrownessSelect) {
      throw new Error("Element 'width-narrowness' not found");
    }
    (widthNarrownessSelect as HTMLSelectElement).value = String(
      widthNarrowness,
    );
    return Number(widthNarrowness);

    // Get the value from html elem
  } else {
    const widthNarrownessSelect = document.getElementById("width-narrowness");
    if (!widthNarrownessSelect) {
      throw new Error("Element 'width-narrowness' not found");
    }
    const widthNarrowness = (widthNarrownessSelect as HTMLSelectElement).value;
    updateState("widthNarrowness", widthNarrowness);
    return Number(widthNarrowness);
  }
}

// "Top-heavy ratio" value: number
function getTopHeavyRatio(): number {
  // Get the value from url param
  const topHeavyRatio = getState("topHeavyRatio");
  if (topHeavyRatio) {
    const topHeavyRatioSelect = document.getElementById("top-heavy-ratio");
    if (!topHeavyRatioSelect) {
      throw new Error("Element 'top-heavy-ratio' not found");
    }
    (topHeavyRatioSelect as HTMLSelectElement).value = String(topHeavyRatio);
    return Number(topHeavyRatio);

    // Get the value from html elem
  } else {
    const topHeavyRatioSelect = document.getElementById("top-heavy-ratio");
    if (!topHeavyRatioSelect) {
      throw new Error("Element 'top-heavy-ratio' not found");
    }
    const topHeavyRatio = (topHeavyRatioSelect as HTMLSelectElement).value;
    updateState("topHeavyRatio", topHeavyRatio);
    return Number(topHeavyRatio);
  }
}

// "Crop side margins" value: boolean
function isCropSideMargins(): boolean {
  const cropCheckbox = document.getElementById("crop-side-margins");
  if (!cropCheckbox) throw new Error("Element 'crop-side-margins' not found");
  const cropCheckboxInput = cropCheckbox as HTMLInputElement;

  // Get the value from url param
  const isCropped = getState("cropSideMargins");
  if (isCropped !== undefined && isCropped !== null) {
    // URLパラメータが true ならチェックが入り false ならチェックが外れる
    // (Boolean() matches the legacy IDL coercion of the checkbox property.)
    cropCheckboxInput.checked = Boolean(isCropped);

    // If 'cropSideMargins' is not exists in url, use the value from html elem
  } else {
    updateState("cropSideMargins", cropCheckboxInput.checked);
  }

  return cropCheckboxInput.checked;
}
