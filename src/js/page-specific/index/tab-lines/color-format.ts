import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import { getState, updateState } from "state/url-state-manager";
import { updateSvgAsNewColorFormat } from "tab-lines/update-svg-color-format";
import { generateGroupColorsHtmlElements } from "tab-lines/group-colors-generator";
import { addEventListenerForGroupColorsInputs } from "tab-lines/group-colors-listener";
import { getNumberOfGroups } from "utils/get-number-of-groups";

export function initColorFormatSelect(): void {
  // Event listeners for 'Color format' <select> changes
  const colorFormatSelect = document.getElementById("color-format");
  if (colorFormatSelect === null) {
    throw new Error("initColorFormatSelect: element not found: #color-format");
  }
  colorFormatSelect.addEventListener("change", (event: Event) => {
    // 選択されたセレクトメニューの値を 取得
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      throw new Error(
        "initColorFormatSelect: expected select element for #color-format",
      );
    }
    const colorFormat = target.value; // rgb | hex
    console.log("Color format: ", colorFormat);

    // グローバルステートを 更新
    updateState("colorFormat", colorFormat);

    // HTMLを 新しい表示フォーマットに 更新
    const svgString = getSvgString();
    generateGroupColorsHtmlElements(
      svgString,
      colorFormat,
      getState("opacitySteps") as number,
    );

    // Get the number of groups
    const numberOfGroups = getNumberOfGroups(svgString);

    // Add event listener for new format opacity selectors
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

    // 新しいセレクトメニューでの 値 を取得して <g stroke=" ... >部分のSVG文字列を 生成し 置き換える
    const updatedSvg = updateSvgAsNewColorFormat(colorFormat);

    // Update the textarea content
    const svgTextarea = document.querySelector("#svg-string");
    if (svgTextarea === null) {
      throw new Error("initColorFormatSelect: element not found: #svg-string");
    }
    (svgTextarea as HTMLTextAreaElement).value = updatedSvg;

    // Only update the SVG strings in the textarea.
    // No need to execute `executeSvg2png()`,
    // because the color-format does not affect the appearance of the artwork.
  });
}
