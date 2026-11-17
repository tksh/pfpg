import { getSvgString } from "button/download-as-file";
import { GROUP_COLORS_ELEMENT_REGEX } from "libpfpg/group-colors";
import { svg2pngOption } from "state/resvg-option";
import { commitRender } from "state/render-commit";
import { updateState } from "state/url-state-manager";
import { getGroupColorsAsJoinedHex } from "libpfpg/group-colors-encode";
import { generateGroupColorsSvgTags } from "tab-lines/group-colors-generator";
import {
  getOpacity,
  getStroke,
  getStrokeOpacity,
  regexMatchesOfGroupColors,
} from "libpfpg/group-colors";
import { replaceAtIndex } from "libpfpg/group-colors";
import { getNumberOfGroups } from "libpfpg/group-colors";

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
  _svg2pngOption: { height: number },
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

      // Apply the value to the artwork state and re-render
      updateSvgWithNewColorValue(inputValue, attrName, gId);
    });
  }
}

/**
 * Apply one picker change.
 *
 * The colour is written to the URL as the whole `groupColors` value, because
 * that is what the renderer reads: there is no per-group edit to make in the
 * SVG string. Rebuilding the pickers afterwards keeps the Alwan instances in
 * step with the thumbnails.
 */
function updateSvgWithNewColorValue(
  inputValue: string,
  attrName: string,
  gId: number,
): void {
  const svgString = getSvgString();
  const matches = regexMatchesOfGroupColors(svgString);
  // e.g: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', ...]

  const match = matches[gId];
  if (match === undefined) {
    throw new Error(
      `updateSvgWithNewColorValue: no group colors match for group ID ${gId}`,
    );
  }

  // Carry the other two attributes over from the current SVG.
  const groupColorsArr: Array<string | number | undefined> = [
    undefined,
    attrName === "stroke" ? inputValue : getStroke(match),
    attrName === "opacity" ? inputValue : getOpacity(match),
    attrName === "stroke-opacity" ? inputValue : getStrokeOpacity(match),
  ];

  const changedGroupElem = generateGroupColorsSvgTags(gId, groupColorsArr);
  const updatedSvg = replaceAtIndex(
    svgString,
    GROUP_COLORS_ELEMENT_REGEX,
    changedGroupElem,
    gId,
  );

  (document.querySelector("#svg-string") as HTMLTextAreaElement).value =
    updatedSvg;

  // The sliders themselves are not persisted; the resulting colours are, as a
  // 'groupColors' override, which is what the renderer and a shared link read.
  updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg));

  commitRender();
}
