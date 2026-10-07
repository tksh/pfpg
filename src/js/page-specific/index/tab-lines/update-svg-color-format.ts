import { getSvgString } from "button/download-as-file";
import { GROUP_COLORS_ELEMENT_REGEX } from "group-colors-svg/group-colors-svg";
import { convertColorFormat } from "color-formatter/format-converter";
import { generateGroupColorsSvgTags } from "tab-lines/group-colors-generator";
import { getElementValueById } from "tab-lines/opacity-steps";
import { getNumberOfGroups } from "group-colors-svg/group-colors-svg";
import { replaceAtIndex } from "group-colors-svg/group-colors-svg";

export function updateSvgAsNewColorFormat(colorFormat: string): string {
  // Get the SVG string value
  const inputSvg = getSvgString();

  // Get the number of groups
  const numberOfGroups = getNumberOfGroups(inputSvg);

  // Loop by group ID: Extract the values from UI tab HTML elements => Replace the <textarea> string

  // Function to process each group
  const processGroup = (inputSvg: string, gId: number): string => {
    // Get 'stroke' value
    const strokeElementId = `group-colors-stroke-thumbnail-${gId}`;
    const stroke = convertColorFormat(
      getElementValueById(strokeElementId),
      colorFormat,
    );
    console.log("stroke: ", stroke); // Current SVG string,  e.g.: "rgb(170,170,170)"
    console.log("colorFormat: ", colorFormat); // New selected format, e.g.: "hex"

    // Get 'opacity' value
    const opacityElementId = `group-colors-opacity-${gId}`;
    const opacity = getElementValueById(opacityElementId);

    // Get 'stroke-opacity' value
    const strokeOpacityElementId = `group-colors-stroke-opacity-${gId}`;
    const strokeOpacity = getElementValueById(strokeOpacityElementId);

    // Generate the array like regex 'match' object with input value
    const groupColorsArr = [
      undefined, // [0] = undefined
      stroke, // [1] = value of stroke
      opacity, // [2] = value of opacity
      strokeOpacity, // [3] = value of stroke-opacity
    ];

    // Generate new group colors <g> element
    const changedGroupElem = generateGroupColorsSvgTags(gId, groupColorsArr);

    // Replace the <g> elements via group ID
    const pattern = GROUP_COLORS_ELEMENT_REGEX;
    return replaceAtIndex(inputSvg, pattern, changedGroupElem, gId);
  };

  // Process each group and update svgString
  const updatedSvg = Array.from({ length: numberOfGroups }, (_, gId) => gId)
    .reduce((acc, gId) => processGroup(acc, gId), inputSvg);

  return updatedSvg;
}
