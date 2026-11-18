import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
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

    // The SVG text is regenerated from the same settings, but colour format is
    // a serialization setting: it only takes effect when a group is rebuilt
    // (a colour or opacity change). Rebuilding the pickers is enough here, and
    // deliberately does not rasterize, since the pixels are unchanged.
    const svgString = getSvgString();
    generateGroupColorsHtmlElements(
      svgString,
      colorFormat,
      Number(getState("opacitySteps")),
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
