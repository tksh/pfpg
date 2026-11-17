import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import { commitRender } from "state/render-commit";
import { getState, updateState } from "state/url-state-manager";
import { generateGroupColorsHtmlElements } from "tab-lines/group-colors-generator";
import { addEventListenerForGroupColorsInputs } from "tab-lines/group-colors-listener";
import { getNumberOfGroups } from "libpfpg/group-colors";

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

    updateState("colorFormat", colorFormat);

    // Color format is a serialization setting: it changes the SVG text but not
    // the pixels, so the render is regenerated and no rasterization follows.
    commitRender();

    const svgString = getSvgString();
    generateGroupColorsHtmlElements(
      svgString,
      colorFormat,
      getState("opacitySteps") as number,
    );

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
  });
}
