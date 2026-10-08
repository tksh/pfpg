import { getSvgString } from "button/download-as-file";
import { GROUP_COLORS_ELEMENT_REGEX } from "group-colors-svg/group-colors-svg";
import { svg2pngOption } from "state/resvg-option";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import { getGroupColorsAsJoinedHex } from "tab-lines/encode-colors-as-hex";
import { generateGroupColorsSvgTags } from "tab-lines/group-colors-generator";
import {
  getOpacity,
  getStroke,
  getStrokeOpacity,
  regexMatchesOfGroupColors,
} from "group-colors-svg/group-colors-svg";
import { replaceAtIndex } from "group-colors-svg/group-colors-svg";
import { getNumberOfGroups } from "group-colors-svg/group-colors-svg";

export {
  addEventListenerForGroupColorsInputs,
  initGroupColorsInputs,
  updateSvgWithNewColorValue,
};

// Add event listeners to group-colors elements.
// - Applies to <select> elements for 'opacity' and 'stroke-opacity'.
// - The 'stroke' color picker will have an event listener added when it is created.

function initGroupColorsInputs(): void {
  const numberOfGroups = getNumberOfGroups(getSvgString());
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
}

/**
 / @attrName string - 'opacity' | 'stroke-opacity'
*/
function addEventListenerForGroupColorsInputs(
  numberOfGroups: number,
  svg2pngOption: { height: number },
  attrName: string,
): void {
  // id `group-colors-${attrName}-N` の要素の変更を監視
  for (let i = 0; i < numberOfGroups; i++) {
    const elementId = `group-colors-${attrName}-${i}`;
    //console.log('elementId: ', elementId) // group-colors-${attrName}-0

    const element = document.querySelector(`#${elementId}`);
    if (element === null) {
      throw new Error(
        `addEventListenerForGroupColorsInputs: element not found: #${elementId}`,
      );
    }
    // e.g.: i, element:  0 <select id="group-colors-opacity-0" class="opacity" name="group-colors-opacity-0">

    element.addEventListener("change", function (event: Event): void {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) {
        throw new Error(
          `addEventListenerForGroupColorsInputs: expected select element for #${elementId}`,
        );
      }
      const inputValue = target.value; // 'attrName' の input値を 取得

      // elementId最後の idの数値のみ を抽出して 変更されたグループの indexナンバー を特定
      const gId = parseInt(
        elementId.replace(`group-colors-${attrName}-`, ""),
        10,
      );
      //console.log('gId: ', gId)                 // e.g: 0, 1, 2 ...
      //console.log('typeof(gId): ', typeof(gId)) // number

      // Apply the value to SVG string
      const updatedSvg = updateSvgWithNewColorValue(inputValue, attrName, gId);

      // Render new PNG
      executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
    });
  }
}

function updateSvgWithNewColorValue(
  inputValue: string,
  attrName: string,
  gId: number,
): string {
  // Get the matches for <g> from current SVG string in textarea
  const svgString = getSvgString();
  const matches = regexMatchesOfGroupColors(svgString);
  //console.log('matches: ', matches)
  // e.g: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', ... '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

  // Get three group colors value
  const match = matches[gId];
  if (match === undefined) {
    throw new Error(
      `updateSvgWithNewColorValue: no group colors match for group ID ${gId}`,
    );
  }
  const stroke = getStroke(match); // RGB or HEX string: "rgb(0,0,0)" / "#000000"
  const opacity = getOpacity(match); // [0-1] number
  const strokeOpacity = getStrokeOpacity(match); // [0-1] number

  // Generate the array with input value, as same structured like regex '.match()' object
  let groupColorsArr: Array<string | number | undefined> = [];

  if (attrName === "stroke") {
    groupColorsArr = [
      undefined, // [0] = undefined
      inputValue, // [1] = value of stroke
      opacity, // [2] = value of opacity
      strokeOpacity, // [3] = value of stroke-opacity
    ];
  } else if (attrName === "opacity") {
    groupColorsArr = [
      undefined, // [0] = undefined
      stroke, // [1] = value of stroke
      inputValue, // [2] = value of opacity
      strokeOpacity, // [3] = value of stroke-opacity
    ];
  } else if (attrName === "stroke-opacity") {
    groupColorsArr = [
      undefined, // [0] = undefined
      stroke, // [1] = value of stroke
      opacity, // [2] = value of opacity
      inputValue, // [3] = value of stroke-opacity
    ];
  }
  //console.log('groupColorsArr: ', groupColorsArr)
  // e.g: (4) [undefined, '#FF0000', '0.8', '1']

  // Generate the <g> element string
  const changedGroupElem = generateGroupColorsSvgTags(gId, groupColorsArr);
  //console.log('changedGroupElem: ', changedGroupElem)
  // e.g: <g (id="0") stroke="#FF7523" opacity="1" stroke-opacity="1">

  // Replace the changed <g> element via specific group ID
  const pattern = GROUP_COLORS_ELEMENT_REGEX;
  const updatedSvg = replaceAtIndex(svgString, pattern, changedGroupElem, gId);

  // Update the svg string in html
  const svgTextarea = document.querySelector("#svg-string");
  if (svgTextarea === null) {
    throw new Error(
      "updateSvgWithNewColorValue: element not found: #svg-string",
    );
  }
  (svgTextarea as HTMLTextAreaElement).value = updatedSvg;

  // Update the status
  const groupColorsHexString = getGroupColorsAsJoinedHex(updatedSvg);
  updateState("groupColors", groupColorsHexString);

  return updatedSvg;
}
