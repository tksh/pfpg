import { getState } from "state/url-state-manager";
import {
  generateGroupColorsHtmlElements,
  generateGroupColorsSvgTags,
} from "tab-lines/group-colors-generator";
import { addEventListenerForGroupColorsInputs } from "tab-lines/group-colors-listener";
import { getNumberOfGroups } from "utils/get-number-of-groups";
import { replaceAtIndex } from "utils/replace-at-index";

export function applyGroupColors(
  svgString: string,
  svg2pngOption: { height: number },
  groupColorsByGroups: Array<Array<string | number | undefined>>,
  opacitySteps: number,
): string {
  const colorFormat = getState("colorFormat") as string;

  // Generate the <g> element string
  // - Type: Array of strings
  const gElemByGroups = groupColorsByGroups.map((groupColorsArr, gId) =>
    generateGroupColorsSvgTags(gId, groupColorsArr)
  );
  console.log("gElemByGroups: ", gElemByGroups);
  // e.g.: (3) ['<g (id="0") stroke="#38AA34" opacity="1" stroke-opacity="1">', '<g stroke="#000" opacity="1" stroke-opacity="1">', '<g stroke="#FFF" opacity="1" stroke-opacity="1">']

  // Replace the whole groups <g> element, via group ID = index number of array
  const pattern = /<g[^>]*stroke=[^>]*>/g;
  let updatedSvg = svgString;

  // Replace each group element
  gElemByGroups.forEach((gElem, gId) => {
    // Here, assign the result of replaceAtIndex back to updatedSvg
    updatedSvg = replaceAtIndex(updatedSvg, pattern, gElem, gId);
  });

  // HTMLを 新しい表示フォーマットに 更新
  generateGroupColorsHtmlElements(updatedSvg, colorFormat, opacitySteps);

  // Add event listener for new format opacity selectors
  const numberOfGroups = getNumberOfGroups(svgString);
  addEventListenerForGroupColorsInputs(
    numberOfGroups,
    svg2pngOption,
    "opacity",
  );
  addEventListenerForGroupColorsInputs(
    numberOfGroups,
    svg2pngOption,
    "stroke-opacity",
  );

  return updatedSvg;
}
