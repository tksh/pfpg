import { clipShapeElement, squircleSlimmedGeometry } from "libpfpg/squircles";
import { extractViewboxValues, replaceViewBox } from "libpfpg/svg-attrs";
import { tryRemoveSpaces } from "libpfpg/optimize";
import { TAB_SPACE } from "constants";
import { getState, updateState } from "state/url-state-manager";

export { initShapeToTrimSelect } from "tab-canvas/shape-to-trim-listener";
export { updateSvgWithNewShapePath };

// Update SVG with selected shape path
async function updateSvgWithNewShapePath(
  shape: string,
  inputSvg: string,
): Promise<string> {
  // Params for generating the 'Squircle' and 'Squircle, slimmed' shape path
  const viewboxValues = extractViewboxValues(inputSvg);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");
  const gridSize = viewboxValues.height;

  const geometry = shape === "squircleSlimmed"
    ? squircleSlimmedGeometry(gridSize, {
      widthNarrowness: Number(getState("widthNarrowness")),
      topHeavyRatio: Number(getState("topHeavyRatio")),
    })
    : undefined;

  const shapePath = clipShapeElement(shape, geometry, gridSize);

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
  if (geometry && isCropSideMargins()) {
    return replaceViewBox(
      newClippathSvg,
      slimmedViewBoxFromGeometry(geometry, viewboxValues),
    );
  }
  return await viewboxUnSlimmed(newClippathSvg);
}

// Build the slimmed viewBox string from the same rounded geometry the clip
// path uses, so the two can never disagree.
function slimmedViewBoxFromGeometry(
  geometry: { left: number; right: number },
  viewboxValues: { y: number; height: number },
): string {
  return `${geometry.left} ${viewboxValues.y} ${
    geometry.right - geometry.left
  } ${viewboxValues.height}`;
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

// Get the original viewBox size for square|circle|squircle, or after
// un-checking 'Crop side margins'. The library has the decoded canvas size;
// this reads it through the page's decoder.
async function viewboxUnSlimmed(inputSvg: string): Promise<string> {
  const { getDecodedSizeData } = await import("state/url-decode");
  const sizeDataObj = await getDecodedSizeData();
  return replaceViewBox(inputSvg, sizeDataObj.viewbox);
}
