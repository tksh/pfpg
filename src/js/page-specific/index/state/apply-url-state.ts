import {
  replaceButtonText,
  updateButtonWithSvgSize,
} from "button/update-button-text";
import { SETTINGS_DEFAULTS } from "constants";
import {
  calculateStepsFromTwoOpacities,
  getInitialOpacitySteps,
} from "init/initial-opacity-steps";
import {
  tryRemoveLineBreaks,
  tryRemoveOpacity,
  tryRemoveSpaces,
} from "modal/optimize-svg";
import { getState, getStateUrl, updateState } from "state/url-state-manager";
import { getImageFormat } from "state/image-format";
import { applyGroupColors } from "tab-lines/apply-group-colors";
import {
  decodeGroupColorsAsArray,
  getGroupOpacitiesAsMap,
} from "tab-lines/decode-colors-as-array";
import { generateGroupColorsHtmlElements } from "tab-lines/group-colors-generator";
import {
  changeOpacitySelectOptionsAsNewStep,
  updateSvgWithNewSteps,
} from "tab-lines/opacity-steps";
import { updateSvgWithNewShapePath } from "tab-canvas/shape-to-trim";
import { toggleDisplay } from "tab-canvas/shape-to-trim-listener";
import { replaceShapeRendering } from "tab-render/shape-rendering";
import { adjustImageDisplay } from "tab-render/height-pixel-size";
import { toggleCheckerboardBg } from "tab-ui/checkerboard-bg";
import { toggleTextWrapping } from "tab-ui/text-wrapping";
import { changeThemeColor } from "tab-ui/theme-color";
import { switchViewScaling } from "tab-ui/view-scaling";

export { applyImageCustomization, applySvgOptimization, applyUiConfiguration };

async function applyImageCustomization(
  svgString: string,
  svg2pngOption: { height: number },
): Promise<string> {
  let updatedSvg = svgString;

  ////////////////////////////////////////////////// colorFormat //////////////////////////////////////////////////
  // Generate the HTML elements of group attrs color-pickers
  // Default value of color-format is 'rgb'
  // Require to generate the initial group colors input elements, even if there is no 'colorFormat' in url param,
  // Because below 'changeOpacitySelectOptionsAsNewStep()` needs pre-generated input elements.
  const colorFormat = getState("colorFormat");
  const colorFormatElem = document.getElementById("color-format");
  if (colorFormatElem === null) {
    throw new Error("applyImageCustomization: missing element #color-format");
  }
  (colorFormatElem as HTMLSelectElement).value = String(colorFormat);

  // Use possibly temporary 'opacitySteps' value as argument in this timing.
  // Calculate it from original lines data.
  let opacitySteps = await getInitialOpacitySteps(); // Getting the steps - 1st of 3
  console.log(
    "Default opacitySteps calculated via original lines data: ",
    opacitySteps,
  ); // Stored as default
  SETTINGS_DEFAULTS.set("opacitySteps", opacitySteps); // Set as default values

  // Update the html elements
  const opacityStepsSelector = document.getElementById("opacity-steps");
  if (opacityStepsSelector === null) {
    throw new Error("applyImageCustomization: missing element #opacity-steps");
  }
  const opacityStepsSelect = opacityStepsSelector as HTMLSelectElement;
  opacityStepsSelect.value = String(opacitySteps);

  // Create the group colors input elements
  generateGroupColorsHtmlElements(
    svgString,
    colorFormat as string,
    opacitySteps,
  );

  ////////////////////////////////////////////////// groupColors //////////////////////////////////////////////////
  // Apply the image customization values via url params if exists

  const groupColors = getState("groupColors");
  if (groupColors) {
    const groupColorsByGroupsArr = decodeGroupColorsAsArray(
      groupColors as string,
      colorFormat as string,
    );
    updatedSvg = applyGroupColors(
      svgString,
      svg2pngOption,
      groupColorsByGroupsArr,
      opacitySteps,
    );

    // Get the opacitySteps from customized group colors
    const opacitiesByGroupMap = getGroupOpacitiesAsMap(groupColorsByGroupsArr);
    opacitySteps = calculateStepsFromTwoOpacities(opacitiesByGroupMap); // Getting the steps - 2nd of 3
  }

  ////////////////////////////////////////////////// opacitySteps //////////////////////////////////////////////////
  // Try to retrieve the value via url param with 'getStateUrl()' instead of 'getState()' like others
  // 'opacitySteps' does not have default value in 'SETTINGS_DEFAULTS' map object, before the decoding svg.
  // The only way to get the default value is calculated from original lines data. (at above 'colorFormat' section)
  const opacityStepsViaUrl = getStateUrl("opacitySteps"); // Getting the steps - 3rd of 3
  if (opacityStepsViaUrl) {
    console.log("opacityStepsViaUrl: ", opacityStepsViaUrl);
    opacityStepsSelect.value = String(opacityStepsViaUrl);
    changeOpacitySelectOptionsAsNewStep(updatedSvg, Number(opacityStepsViaUrl)); // Update the group colors input elements
    updatedSvg = updateSvgWithNewSteps(updatedSvg); // Extract the steps value from input elements selected
  }

  ////////////////////////////////////////////////// shapeToTrim //////////////////////////////////////////////////
  /////////////////////////// includes: widthNarrowness, topHeavyRatio, cropSideMargins ///////////////////////////
  const shapeToTrim = getState("shapeToTrim");
  console.log("shapeToTrim                   from url param: ", shapeToTrim);
  updatedSvg = await updateSvgWithNewShapePath(
    shapeToTrim as string,
    updatedSvg,
  );

  // 'squircleSlimmed'が 選ばれた時だけ表示される
  // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
  const elementsToToggle = [
    "width-narrowness-div",
    "top-heavy-ratio-div",
    "crop-side-margins-div",
  ];

  if (shapeToTrim === "squircleSlimmed") {
    toggleDisplay(elementsToToggle, "inline");
  } else {
    toggleDisplay(elementsToToggle, "none");
  }

  ////////////////////////////////////////////////// shapeRendering //////////////////////////////////////////////////
  const shapeRendering = getState("shapeRendering");
  const shapeRenderingElem = document.getElementById("shape-rendering");
  if (shapeRenderingElem === null) {
    throw new Error(
      "applyImageCustomization: missing element #shape-rendering",
    );
  }
  (shapeRenderingElem as HTMLSelectElement).value = String(shapeRendering);
  updatedSvg = replaceShapeRendering(updatedSvg, shapeRendering as string);

  ////////////////////////////////////////////////// heightPixelSize //////////////////////////////////////////////////
  const heightPixelSize = parseInt(String(getState("heightPixelSize")), 10);
  svg2pngOption.height = heightPixelSize;

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

  return updatedSvg;
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
}

function applySvgOptimization(svgString: string): string {
  /////////////////////////////////////// removeOpacity ///////////////////////////////////////
  const isOpacityRemoved = getState("removeOpacity");
  updateState("removeOpacity", isOpacityRemoved);
  // Optimize the svg text
  const removeOpacityApplied = tryRemoveOpacity(svgString, isOpacityRemoved);

  // Set the checkbox state
  const removeOpacityElem = document.getElementById("remove-opacity");
  if (removeOpacityElem === null) {
    throw new Error("applySvgOptimization: missing element #remove-opacity");
  }
  (removeOpacityElem as HTMLInputElement).checked = isOpacityRemoved as boolean;
  // Toggle classes for the <code> content text
  const beforeRemoveOpacityElem = document.querySelector(
    "#before-remove-opacity",
  );
  if (beforeRemoveOpacityElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #before-remove-opacity",
    );
  }
  beforeRemoveOpacityElem.classList.toggle("option-applied", !isOpacityRemoved);
  const afterRemoveOpacityElem = document.querySelector(
    "#after-remove-opacity",
  );
  if (afterRemoveOpacityElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #after-remove-opacity",
    );
  }
  afterRemoveOpacityElem.classList.toggle(
    "option-applied",
    isOpacityRemoved as boolean,
  );

  ////////////////////////////////////// removeLineBreaks //////////////////////////////////////
  const isLineBreaksRemoved = getState("removeLineBreaks");
  updateState("removeLineBreaks", isLineBreaksRemoved);
  // Optimize the svg text
  const removeLineBreaksApplied = tryRemoveLineBreaks(
    removeOpacityApplied,
    isLineBreaksRemoved,
  );

  // Set the checkbox state
  const removeLineBreaksElem = document.getElementById("remove-line-breaks");
  if (removeLineBreaksElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #remove-line-breaks",
    );
  }
  (removeLineBreaksElem as HTMLInputElement).checked =
    isLineBreaksRemoved as boolean;
  // Toggle classes for the <code> content text
  const beforeRemoveLineBreaksElem = document.querySelector(
    "#before-remove-line-breaks",
  );
  if (beforeRemoveLineBreaksElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #before-remove-line-breaks",
    );
  }
  beforeRemoveLineBreaksElem.classList.toggle(
    "option-applied",
    !isLineBreaksRemoved,
  );
  const afterRemoveLineBreaksElem = document.querySelector(
    "#after-remove-line-breaks",
  );
  if (afterRemoveLineBreaksElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #after-remove-line-breaks",
    );
  }
  afterRemoveLineBreaksElem.classList.toggle(
    "option-applied",
    isLineBreaksRemoved as boolean,
  );

  /////////////////////////////////////// removeSpaces ///////////////////////////////////////
  const isSpacesRemoved = getState("removeSpaces");
  updateState("removeSpaces", isSpacesRemoved);
  // Optimize the svg text
  const removeSpacesApplied = tryRemoveSpaces(
    removeLineBreaksApplied,
    isSpacesRemoved,
  );

  // Set the checkbox state
  const removeSpacesElem = document.getElementById("remove-spaces");
  if (removeSpacesElem === null) {
    throw new Error("applySvgOptimization: missing element #remove-spaces");
  }
  (removeSpacesElem as HTMLInputElement).checked = isSpacesRemoved as boolean;
  // Toggle classes for the <code> content text
  const beforeRemoveSpacesElem = document.querySelector(
    "#before-remove-spaces",
  );
  if (beforeRemoveSpacesElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #before-remove-spaces",
    );
  }
  beforeRemoveSpacesElem.classList.toggle("option-applied", !isSpacesRemoved);
  const afterRemoveSpacesElem = document.querySelector("#after-remove-spaces");
  if (afterRemoveSpacesElem === null) {
    throw new Error(
      "applySvgOptimization: missing element #after-remove-spaces",
    );
  }
  afterRemoveSpacesElem.classList.toggle(
    "option-applied",
    isSpacesRemoved as boolean,
  );

  // Count the size of the updated SVG string and display it on the SVG download/copy button
  updateButtonWithSvgSize(removeSpacesApplied);

  return removeSpacesApplied;
}
