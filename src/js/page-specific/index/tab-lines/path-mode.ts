import { getSvgString } from "button/download-as-file";
import { GROUP_COLORS_ELEMENT_REGEX } from "group-colors-svg/group-colors-svg";
import { decodeUrlToSvgForPage } from "state/url-decode";
import { optimizeSvg } from "modal/optimize-svg";
import { svg2pngOption } from "state/resvg-option";
import { getState, updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import { replaceAtIndex } from "group-colors-svg/group-colors-svg";

export { decodeAsSelectedPathMode, initPathModeSelect };

function initPathModeSelect(): void {
  //  Event listeners for 'Path mode' selection changes
  const pathModeSelect = document.getElementById("path-mode");
  if (pathModeSelect === null) {
    throw new Error("initPathModeSelect: element not found: #path-mode");
  }
  pathModeSelect.addEventListener("change", async (event: Event) => {
    // 現在の設定の値を保存しておく

    // Get the SVG string value
    const currentPathModeSvg = getSvgString();

    // Lines tab

    // Group colors
    const patternGroupColors = GROUP_COLORS_ELEMENT_REGEX;
    const matchOfGroupColors = currentPathModeSvg.match(patternGroupColors);
    // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="# ...

    // Opacity steps の選択肢の値は svgのコンテンツではなく UIのみに関わるので 保存しておいて元に戻す 必要はない

    // Canvas tab

    // Shape to trim
    const patternShapeToTrim = /<clipPath id="shape-to-trim">[^>]*>/g;
    const matchOfShapeToTrim = currentPathModeSvg.match(patternShapeToTrim);
    if (matchOfShapeToTrim === null || matchOfShapeToTrim[0] === undefined) {
      throw new Error("initPathModeSelect: no shape-to-trim value found");
    }
    const valueOfShapeToTrim = matchOfShapeToTrim[0]; // 'square' | 'circle' | 'squircle' | 'squircle, slimmed'
    // viewBox (for 'Crop side margins' checked.)
    const patternViewbox = /viewBox="[^"]*"/;
    const matchOfViewbox = currentPathModeSvg.match(patternViewbox);
    if (matchOfViewbox === null || matchOfViewbox[0] === undefined) {
      throw new Error("initPathModeSelect: no viewBox value found");
    }
    const valueOfViewbox = matchOfViewbox[0]; // e.g.: viewBox="1.55 0 27.9 31"

    // Render tab

    // Anti-aliasing (shape-rendering)
    const patternShapeRendering = /shape-rendering="[^"]*"/g;
    const matchOfShapeRendering = currentPathModeSvg.match(
      patternShapeRendering,
    );
    if (
      matchOfShapeRendering === null || matchOfShapeRendering[0] === undefined
    ) {
      throw new Error("initPathModeSelect: no shape-rendering value found");
    }
    const valueOfShapeRendering = matchOfShapeRendering[0]; // 'shape-rendering="geometricPrecision"' | 'shape-rendering="crispEdges"'

    // 選択された 'Path mode'の値を 取得
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      throw new Error(
        "initPathModeSelect: expected select element for #path-mode",
      );
    }
    const pathMode = target.value; // 'relativeMerged' | 'absoluteSeparated'

    // Re-decode as new 'Path mode' styled svg string from url params
    const newPathModeSvg = await decodeAsSelectedPathMode(pathMode);
    if (newPathModeSvg === undefined) {
      throw new Error("initPathModeSelect: failed to decode SVG for path mode");
    }

    // レンダリングし直す前に 保存しておいた 設定の値を 元に戻す

    // Anti-alias, Base color, Shape to trim, viewBox
    const recoverShapeRendering = recoverCurrentOptionValue(
      newPathModeSvg,
      patternShapeRendering,
      valueOfShapeRendering,
    );
    const recoverShapeToTrim = recoverCurrentOptionValue(
      recoverShapeRendering,
      patternShapeToTrim,
      valueOfShapeToTrim,
    );
    const recoverViewbox = recoverCurrentOptionValue(
      recoverShapeToTrim,
      patternViewbox,
      valueOfViewbox,
    );
    if (matchOfGroupColors === null) {
      throw new Error("initPathModeSelect: no group colors <g> elements found");
    }
    const updatedSvg = recoverCurrentGroupColorsValues(
      recoverViewbox,
      patternGroupColors,
      matchOfGroupColors,
    );

    // Update the state
    updateState("pathMode", pathMode);

    // 保存しておいた設定の値を 全て元に戻した 新しいSVG文字列 を
    // SVG最適化モーダルウィンドウでの 3つのチェックボックスの状態に応じた形にしてから
    // <textarea>のvalue属性に 挿入する

    // Optimize the SVG string using current three checkboxes status
    const svgOptState = new Map<string, unknown>([
      ["removeOpacity", getState("removeOpacity")], // SVG optimization modal
      ["removeLineBreaks", getState("removeLineBreaks")], // SVG optimization modal
      ["removeSpaces", getState("removeSpaces")], // SVG optimization modal
    ]);
    const optimizedSvg = optimizeSvg(updatedSvg, svgOptState);

    // Update the textarea content
    const svgTextarea = document.querySelector("#svg-string");
    if (svgTextarea === null) {
      throw new Error("initPathModeSelect: element not found: #svg-string");
    }
    (svgTextarea as HTMLTextAreaElement).value = optimizedSvg;

    // // Rendering the PNG with updated SVG
    executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
  });
}

// 選択された path-mode で url params から デコードし直す
async function decodeAsSelectedPathMode(
  pathMode: string,
): Promise<string | undefined> {
  if (pathMode === "relativeMerged") {
    return await decodeUrlToSvgForPage(true);
  } else { // (pathMode === 'absoluteSeparated')
    return await decodeUrlToSvgForPage(false);
  }
}

// Recover the option values like
//  - Anti-aliasing
//  - Base color
//  - Shape to trim

function recoverCurrentOptionValue(
  svgString: string,
  regexPattern: RegExp,
  valueString: string,
): string {
  return svgString.replace(regexPattern, valueString);
}

// Recover the group colors values like
//   - stroke
//   - opacity
//   - stroke-opacity

function recoverCurrentGroupColorsValues(
  svgString: string,
  regexPattern: RegExp,
  regexMatches: string[],
): string {
  let recoveredSvgString = svgString;
  for (let gId = 0; gId < regexMatches.length; gId++) {
    const colorsValues = regexMatches[gId];
    if (colorsValues === undefined) {
      throw new Error(
        `recoverCurrentGroupColorsValues: missing match at group ID ${gId}`,
      );
    }
    recoveredSvgString = replaceAtIndex(
      recoveredSvgString,
      regexPattern,
      colorsValues,
      gId,
    );
  }
  return recoveredSvgString;
}
