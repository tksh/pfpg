import {
  replaceButtonText,
  syncCopyAvailability,
} from "button/update-button-text";
import { getInitialOpacitySteps } from "init/initial-opacity-steps";
import { getState, getStateUrl, updateState } from "state/url-state-manager";
import { getImageFormat } from "state/image-format";
import { syncSvgOptimizationUi } from "modal/optimize-svg";
import { currentArtwork, currentSettings } from "state/render-state";
import { renderArtworkWithoutOpacitySteps } from "libpfpg/render";
import { generateGroupColorsHtmlElements } from "tab-lines/group-colors-generator";
import { rememberArtworkLineStrokes } from "tab-lines/randomize-group-colors";
import { changeOpacitySelectOptionsAsNewStep } from "tab-lines/opacity-steps";
import { toggleDisplay } from "tab-canvas/shape-to-trim-listener";
import { adjustImageDisplay } from "tab-render/height-pixel-size";
import { toggleCheckerboardBg } from "tab-ui/checkerboard-bg";
import { toggleTextWrapping } from "tab-ui/text-wrapping";
import { changeThemeColor } from "tab-ui/theme-color";
import { switchViewScaling } from "tab-ui/view-scaling";

export { applyImageCustomization, applyUiConfiguration };

/**
 * Sync the Lines / Canvas / Render controls to the URL, and build the
 * group-color pickers from the artwork.
 *
 * This no longer touches the SVG: rendering is the shared renderer's job, and
 * `main.ts` calls it right after this. What remains here is everything that is
 * genuinely UI-only — select values, the opacity-step options each picker
 * offers, and the artwork's own line colours the randomizer anchors to.
 */
function applyImageCustomization(_svg2pngOption: { height: number }): void {
  const settings = currentSettings();

  ////////////////////////////////////////////////// colorFormat //////////////////////////////////////////////////
  // Default value of color-format is 'rgb'
  const colorFormat = settings.colorFormat ?? "rgb";
  const colorFormatElem = document.getElementById("color-format");
  if (colorFormatElem === null) {
    throw new Error("applyImageCustomization: missing element #color-format");
  }
  (colorFormatElem as HTMLSelectElement).value = String(colorFormat);

  // The artwork's own opacity step. A URL may override it.
  const opacitySteps = settings.opacitySteps ?? getInitialOpacitySteps();

  const opacityStepsSelector = document.getElementById("opacity-steps");
  if (opacityStepsSelector === null) {
    throw new Error("applyImageCustomization: missing element #opacity-steps");
  }
  (opacityStepsSelector as HTMLSelectElement).value = String(opacitySteps);

  // Two different SVGs are needed here, and they answer different questions.
  //
  // The artwork's own line colours are what 'Anchor: Original line colors'
  // anchors to, so that snapshot deliberately ignores any `groupColors`
  // override in the URL.
  const artworkSvg = renderArtworkWithoutOpacitySteps(currentArtwork(), {
    ...settings,
    groupColors: undefined,
    opacitySteps: undefined,
  });
  rememberArtworkLineStrokes(artworkSvg);

  // The pickers, on the other hand, must show what the artwork actually looks
  // like, so they are built from the rendered SVG including the override. If
  // they were built from the un-overridden artwork, the first picker edit would
  // suddenly reveal colours the user never saw.
  const pickersSvg = renderArtworkWithoutOpacitySteps(currentArtwork(), {
    ...settings,
    opacitySteps: undefined,
  });
  generateGroupColorsHtmlElements(
    pickersSvg,
    colorFormat,
    opacitySteps,
  );

  // The pickers' <option> lists must reflect the step in effect, so a URL
  // override has to be pushed into them before the first render.
  if (settings.opacitySteps !== undefined) {
    changeOpacitySelectOptionsAsNewStep(
      pickersSvg,
      settings.opacitySteps,
    );
  }

  ////////////////////////////////////////////////// shapeToTrim //////////////////////////////////////////////////
  // 'squircleSlimmed'が 選ばれた時だけ表示される
  // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
  const shapeToTrim = getState("shapeToTrim");
  const elementsToToggle = [
    "width-narrowness-div",
    "top-heavy-ratio-div",
    "crop-side-margins-div",
  ];
  toggleDisplay(
    elementsToToggle,
    shapeToTrim === "squircleSlimmed" ? "inline" : "none",
  );

  ////////////////////////////////////////////////// shapeRendering //////////////////////////////////////////////////
  const shapeRendering = getState("shapeRendering");
  const shapeRenderingElem = document.getElementById("shape-rendering");
  if (shapeRenderingElem === null) {
    throw new Error(
      "applyImageCustomization: missing element #shape-rendering",
    );
  }
  (shapeRenderingElem as HTMLSelectElement).value = String(shapeRendering);

  ////////////////////////////////////////////////// heightPixelSize //////////////////////////////////////////////////
  const heightPixelSize = parseInt(String(getState("heightPixelSize")), 10);
  _svg2pngOption.height = heightPixelSize;

  const pngSizeNumberElem = document.querySelector("#png-size-number");
  if (pngSizeNumberElem === null) {
    throw new Error(
      "applyImageCustomization: missing element #png-size-number",
    );
  }
  (pngSizeNumberElem as HTMLInputElement).value = String(heightPixelSize);
  const pngSizeRangeElem = document.querySelector("#png-size-range");
  if (pngSizeRangeElem === null) {
    throw new Error("applyImageCustomization: missing element #png-size-range");
  }
  (pngSizeRangeElem as HTMLInputElement).value = String(heightPixelSize);

  // The modal's checkboxes ship unchecked, so a URL that turns an option on
  // would otherwise show an unchecked box next to a sample claiming it is off.
  syncSvgOptimizationUi();
}

function applyUiConfiguration(): void {
  ///////////////////////////// viewScaling /////////////////////////////
  const viewScaling = getState("viewScaling"); // 'fit'|'actual'
  const viewScalingElem = document.getElementById("view-scaling");
  if (viewScalingElem === null) {
    throw new Error("applyUiConfiguration: missing element #view-scaling");
  }
  (viewScalingElem as HTMLSelectElement).value = String(viewScaling);
  switchViewScaling(viewScaling as string);
  adjustImageDisplay(parseInt(String(getState("heightPixelSize")), 10)); // It affects for 'actual'

  //////////////////////////// checkerboardBg ////////////////////////////
  const isCheckerboardBg = getState("checkerboardBg"); // bool
  const checkerboardBgElem = document.getElementById("checkerboard-bg");
  if (checkerboardBgElem === null) {
    throw new Error("applyUiConfiguration: missing element #checkerboard-bg");
  }
  (checkerboardBgElem as HTMLInputElement).checked =
    isCheckerboardBg as boolean;
  toggleCheckerboardBg(isCheckerboardBg as boolean);

  ///////////////////////////// textWrapping /////////////////////////////
  const isTextWrapping = getState("textWrapping"); // bool
  const textWrappingElem = document.getElementById("text-wrapping");
  if (textWrappingElem === null) {
    throw new Error("applyUiConfiguration: missing element #text-wrapping");
  }
  (textWrappingElem as HTMLInputElement).checked = isTextWrapping as boolean;
  toggleTextWrapping(isTextWrapping as boolean);

  ///////////////////////////// buttonAction /////////////////////////////
  const buttonAction = getState("buttonAction"); // 'download'|'copy'
  const buttonActionElem = document.getElementById("button-action");
  if (buttonActionElem === null) {
    throw new Error("applyUiConfiguration: missing element #button-action");
  }
  (buttonActionElem as HTMLSelectElement).value = String(buttonAction);
  // Get the button elements, PNG and SVG
  const pngActionButton = document.getElementById("png-action-button");
  if (pngActionButton === null) {
    throw new Error("applyUiConfiguration: missing element #png-action-button");
  }
  const svgActionButton = document.getElementById("svg-action-button");
  if (svgActionButton === null) {
    throw new Error("applyUiConfiguration: missing element #svg-action-button");
  }
  // Update the button innerHtml as selected action
  replaceButtonText(buttonAction as string, pngActionButton);
  replaceButtonText(buttonAction as string, svgActionButton);

  ///////////////////////////// themeColor /////////////////////////////
  const themeColor = getStateUrl("themeColor");
  updateState("themeColor", themeColor);
  const themeColorElem = document.getElementById("theme-color");
  if (themeColorElem === null) {
    throw new Error("applyUiConfiguration: missing element #theme-color");
  }
  (themeColorElem as HTMLSelectElement).value = String(themeColor);
  changeThemeColor(themeColor as string);

  ///////////////////////////// imageFormat /////////////////////////////
  // The initial render already happened in this format, so only the select
  // element has to reflect it here
  const imageFormatElem = document.getElementById("image-format");
  if (imageFormatElem === null) {
    throw new Error("applyUiConfiguration: missing element #image-format");
  }
  (imageFormatElem as HTMLSelectElement).value = getImageFormat();

  // Both selects now hold the restored values, so the copy button and its ⓘ
  // have to reflect them before anything else can change them.
  syncCopyAvailability();
}
