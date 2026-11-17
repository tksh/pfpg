import {
  calculateSquircleSlimmedSides,
  slimmedViewBox,
  squircleSlimmedGeometry,
} from "libpfpg/squircles";
import { extractViewboxValues, replaceViewBox } from "libpfpg/svg-attrs";
import { getDecodedSizeData } from "state/url-decode";
import { svg2pngOption } from "state/resvg-option";
import { getState, updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export {
  calculateSquircleSlimmedSides,
  cropSideMargins,
  extractViewboxValues,
  resetSideMargins,
};

async function cropSideMargins(inputSvg: string): Promise<string> {
  updateState("cropSideMargins", true);
  return await updateSvg(inputSvg, true);
}

async function resetSideMargins(inputSvg: string): Promise<string> {
  updateState("cropSideMargins", false);
  return await updateSvg(inputSvg, false);
}

async function updateSvg(
  inputSvg: string,
  isCropped: boolean,
): Promise<string> {
  const updatedSvg = isCropped
    ? viewboxSlimmed(inputSvg)
    : await viewboxUnSlimmed(inputSvg);
  const svgTextarea = document.querySelector("#svg-string");
  if (!svgTextarea) throw new Error("Element '#svg-string' not found");
  (svgTextarea as HTMLTextAreaElement).value = updatedSvg;
  executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
  return updatedSvg;
}

// Change the viewBox size to fit the 'Squircle, slimmed' clip path.
function viewboxSlimmed(inputSvg: string): string {
  const viewboxValues = extractViewboxValues(inputSvg);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");

  const geometry = squircleSlimmedGeometry(viewboxValues.height, {
    widthNarrowness: Number(getState("widthNarrowness")),
    topHeavyRatio: Number(getState("topHeavyRatio")),
  });
  return replaceViewBox(inputSvg, slimmedViewBox(geometry, viewboxValues));
}

// Get back the original viewBox size when:
//   1. un-check the checkbox, or
//   2. shapeToTrim changes to square|circle|squircle
async function viewboxUnSlimmed(inputSvg: string): Promise<string> {
  // Read original basic data from url params
  const sizeDataObj = await getDecodedSizeData();

  // Generate new string with original viewBox size
  const originalViewboxString = sizeDataObj.viewbox; // e.g.: '0 0 31 31'

  return replaceViewBox(inputSvg, originalViewboxString);
}
