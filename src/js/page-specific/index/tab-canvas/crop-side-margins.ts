import { getDecodedSizeData } from "state/url-decode";
import { svg2pngOption } from "state/resvg-option";
import { getState, updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import { roundToTwoDecimals, toFixedTrimmed } from "utils/number-rounding";

export {
  calculateSquircleSlimmedSides,
  cropSideMargins,
  extractViewboxValues,
  resetSideMargins,
  viewboxSlimmed,
  viewboxUnSlimmed,
};

async function cropSideMargins(inputSvg: string): Promise<string> {
  console.log("Crop side margins: [x]");
  updateState("cropSideMargins", true);
  return await updateSvg(inputSvg, true);
}

async function resetSideMargins(inputSvg: string): Promise<string> {
  console.log("Crop side margins: [ ]");
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

// Change the viewBox size fit to Squircle, slimmed.
function viewboxSlimmed(inputSvg: string): string {
  const viewboxValues = extractViewboxValues(inputSvg);
  if (!viewboxValues) throw new Error("viewBox not found in SVG string");
  const gridSize = viewboxValues.get("h");
  if (gridSize === undefined) {
    throw new Error("viewBox height ('h') not found in SVG string");
  }

  // Use the same rounded insets as the 'Squircle, slimmed' clip path
  const widthNarrowness = Number(getState("widthNarrowness"));
  const { left, right } = calculateSquircleSlimmedSides(
    gridSize,
    widthNarrowness,
  );

  // Generate new viewBox string
  const newViewboxString = `viewBox="${toFixedTrimmed(left)} ${
    viewboxValues.get("y")
  } ${toFixedTrimmed(right - left)} ${viewboxValues.get("h")}"`;
  console.log("newViewboxString: ", newViewboxString); // e.g.: viewBox="1.55 0 27.9 31"

  // Replace the viewBox string with new one
  const patternForViewboxStr = /viewBox="[^"]+"/; // viewBox属性 全体 を抽出する正規表現
  return inputSvg.replace(patternForViewboxStr, newViewboxString);
}

// Round the horizontal insets of 'Squircle, slimmed' (= how much each side is
// reduced) so the clip path and the slimmed viewBox always match.
function calculateSquircleSlimmedSides(
  gridSize: number,
  widthNarrowness: number,
): { left: number; right: number } {
  const eachSideWidthForNarrowing = (gridSize / 100) * (widthNarrowness / 2);
  return {
    left: roundToTwoDecimals(eachSideWidthForNarrowing),
    right: roundToTwoDecimals(gridSize - eachSideWidthForNarrowing),
  };
}

/**
 * Get viewBox four(x/y/w/h) number values as Map object
 *
 * The resvg-js library outputs the width and height as integers by default, so the code below works fine:
 * > document.querySelector('#svg-info').innerHTML = 'Source SVG viewbox: ' + resvgJS.width + ' x ' + resvgJS.height
 * However, when 'Crop side margins:' is applied in the Canvas tab, the viewBox size values can be floats, not just integers.
 * Therefore, we need to extract the size values from the SVG string using a regular expression, as shown below.
 *
 * @param inputSvg string
 * @returns Map object - Outputs the viewBox size as float to indicate at #svg-info <textarea>
 *                       e.g: Map(4) {'x' => 0, 'y' => 0, 'w' => 31, 'h' => 31}   (Shape to trim: 'Square')
 *                            Map(4) {'x' => 0, 'y' => 0, 'w' => 27.9, 'h' => 31} (Shape to trim: 'Squircle, slimmed' and Crop side margins: checked)
 */
function extractViewboxValues(inputSvg: string): Map<string, number> | null {
  // Use a regular expression to match the four number values in the viewBox string
  const match = inputSvg.match(
    /viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/,
  );
  console.log("viewBox matches: ", match);

  // Check if the match was successful
  if (match && match.length === 5) {
    const xValue = match[1];
    const yValue = match[2];
    const wValue = match[3];
    const hValue = match[4];
    if (
      xValue === undefined || yValue === undefined || wValue === undefined ||
      hValue === undefined
    ) {
      return null;
    }
    // Extract the four number values and return them as a Map object
    return new Map([
      ["x", parseFloat(xValue)],
      ["y", parseFloat(yValue)],
      ["w", parseFloat(wValue)],
      ["h", parseFloat(hValue)],
    ]);
  } else {
    // Return null or throw an error if the match was not successful
    return null;
  }
}

// Get back the original viewBox size when:
//   1. un-check the checkbox, or
//   2. shapeToTrim changes to square|circle|squircle

async function viewboxUnSlimmed(inputSvg: string): Promise<string> {
  // Read original basic data from url params
  const sizeDataObj = await getDecodedSizeData();

  // Generate new string with original viewBox size
  const originalViewboxString = sizeDataObj.viewbox; // e.g.: '0 0 31 31'
  console.log("originalViewboxString: ", originalViewboxString);

  // Replace the viewBox string with new one
  const patternForViewboxStr = /viewBox="([^"]+)"/;
  const matchesForViewboxStr = patternForViewboxStr.exec(inputSvg); // e.g.: 'viewBox="0 0 31 31"'
  console.log("matchesForViewboxStr: ", matchesForViewboxStr);
  if (!matchesForViewboxStr) throw new Error("viewBox not found in SVG string");
  const matchForViewboxValueStr = matchesForViewboxStr[1]; // e.g.: '0 0 31 31'
  if (matchForViewboxValueStr === undefined) {
    throw new Error("viewBox value not found in SVG string");
  }
  return inputSvg.replace(matchForViewboxValueStr, originalViewboxString);
}
