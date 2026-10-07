import {
  convertColorFormatForArray,
  convertToRgbArr,
} from "color-formatter/format-converter";
import { rgbToLch } from "color-formatter/rgb-to-lch";
import { removeOpacity } from "modal/optimize-svg";
import { getState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";
import { getGroupColorsValues } from "group-colors-svg/group-colors-svg";
import { numbersIncrementByStep } from "tab-lines/opacity-steps";
import { updateSvgWithNewColorValue } from "tab-lines/group-colors-listener";

import { svg2pngOption } from "state/resvg-option";

// Import Alwan JS and CSS from node_modules
import Alwan from "alwan";
import "alwan/css";

export {
  determinePickerTheme,
  generateGroupColorsHtmlElements,
  generateGroupColorsSvgTags,
};

// SVG

// Generate the group-colors SVG <g> tag strings.

function generateGroupColorsSvgTags(
  gId: number,
  matches: Array<string | number | undefined>,
): string {
  //console.log('matches: ', matches) // e.g.: (4) [undefined, '#4E8D09', '0.6', '1.0']

  const stroke = matches[1]; // e.g.: "rgb(0,0,0)" | "#FFF"
  const opacity = matches[2] !== undefined ? matches[2] : "1.0"; // opacity が明示的に指定されていない場合は 1.0 とみなす
  const strokeOpacity = matches[3] !== undefined ? matches[3] : "1.0"; // strokeOpacity が明示的に指定されていない場合は 1.0 とみなす
  const groupElem =
    `<g id="${gId}" stroke="${stroke}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`;

  // Apply 'removeOpacity()' if 'removeOpacity=true'
  const isOpacityRemoved = getState("removeOpacity");
  if (isOpacityRemoved) {
    return removeOpacity(groupElem); // e.g.: <g (id="0") stroke="#4E8D09">
  } else {
    return groupElem; // e.g.: <g (id="0") stroke="#4E8D09" opacity="0.6" stroke-opacity="1.0">
  }
}

// HTML

// Generate the group-colors customize HTML elements.
// Each line-groups has a <div> that contains below four elements.
//  - <span>   - Group ID number text
//  - <div>    - This is a custom color thumbnail (and color value text) element that to open Alwan color picker
//  - <select> - opacity value selector
//  - <select> - stroke-opacity value selector

function generateGroupColorsHtmlElements(
  inputSvg: string,
  colorFormat: string,
  opacitySteps: number,
): void {
  console.log(
    `generateGroupColorsHtmlElements() started. (Opacity step = ${opacitySteps})`,
  );

  // Get the group-colors values from SVG string in textarea
  const groupColorsValues = getGroupColorsValues(inputSvg);
  const numberOfGroupsValue = groupColorsValues.get("number_of_groups");
  if (typeof numberOfGroupsValue !== "number") {
    throw new Error(
      "generateGroupColorsHtmlElements: missing number_of_groups",
    );
  }
  const numberOfGroups = numberOfGroupsValue;
  const strokeArrayValues = groupColorsValues.get("stroke_array");
  if (!Array.isArray(strokeArrayValues)) {
    throw new Error("generateGroupColorsHtmlElements: missing stroke_array");
  }
  const strokeArr = convertColorFormatForArray(strokeArrayValues, colorFormat);
  const opacityArrayValues = groupColorsValues.get("opacity_array");
  if (!Array.isArray(opacityArrayValues)) {
    throw new Error("generateGroupColorsHtmlElements: missing opacity_array");
  }
  const opacityArr = opacityArrayValues;
  const strokeOpacityArrayValues = groupColorsValues.get(
    "stroke_opacity_array",
  );
  if (!Array.isArray(strokeOpacityArrayValues)) {
    throw new Error(
      "generateGroupColorsHtmlElements: missing stroke_opacity_array",
    );
  }
  const strokeOpacityArr = strokeOpacityArrayValues;

  // Parent <div> element to append all line-group setting elements
  const groupColorsDiv = document.getElementById("group-colors-pickers");
  if (groupColorsDiv === null) {
    throw new Error(
      "generateGroupColorsHtmlElements: element not found: #group-colors-pickers",
    );
  }

  // Remove all current child nodes before generating new ones
  while (groupColorsDiv.firstChild) {
    groupColorsDiv.removeChild(groupColorsDiv.firstChild);
  }

  // Clean up existing color pickers before creating new ones
  // - Alwan color picker elements are not inside the above parent <div>, they are directly appended to the <body>
  // - Alwan instances must be destroyed using the '.destroy()' before removal
  cleanupExistingPickers();

  for (let gId = 0; gId < numberOfGroups; gId++) {
    // A parent <div> for group colors
    const settingItemDiv = document.createElement("div");
    settingItemDiv.classList.add("setting-item-for-group-colors");

    // A <span> to display the group ID number
    const gIdSpan = createGroupIdSpanElement(gId);

    // A <div> to indicate the color thumbnail with text
    const strokeValue = strokeArr[gId];
    if (strokeValue === undefined) {
      throw new Error(
        `generateGroupColorsHtmlElements: missing stroke value for group ${gId}`,
      );
    }
    const strokeThumbDiv = createStrokeThumbnailDivElement(
      gId,
      strokeValue,
      colorFormat,
    );

    // Alwanインスタンスを生成

    // Color format type of color picker will be set as current format
    const rgbOrHex = colorFormat === "rgb"
      ? { hex: false, rgb: true, hsl: false } // RGB enabled
      : { hex: true, rgb: false, hsl: false }; // HEX enabled

    // Determines color picker theme ('light'/'dark') based on active base UI theme
    const lightOrDark = determinePickerTheme();

    const alwan = new Alwan(strokeThumbDiv, {
      id: `alwan-picker-${gId}`,
      preset: false, // Use custom thumbnail as a reference element instead of pre-styled button
      // App domain for color format is 'rgb' | 'hex' (see #color-format options)
      format: colorFormat as "rgb" | "hex", // format:'rgb' or format:'hex'
      color: strokeValue, // Set the color value (rgb or hex)
      inputs: rgbOrHex, // Show only the format selected currently
      opacity: false, // Remove the alpha channel settings UI elements
      copy: false, // Remove a copy button
      theme: lightOrDark, // 'light' or 'dark' based on UI theme color
      position: "top-start", // Keep below space free for virtual keyboard for mobile
      preview: false, // Lesser height
    });

    // カラーピッカーで 色が変更された時の イベントリスナー
    addEventListenerToAlwanOnChange(alwan, gId, colorFormat, svg2pngOption);

    // Two <select> elements for opacity and stroke-opacity
    const opacitySelect = createOpacitiesSelectElement(
      gId,
      opacitySteps,
      "opacity",
      opacityArr[gId],
    );
    const strokeOpacitySelect = createOpacitiesSelectElement(
      gId,
      opacitySteps,
      "stroke-opacity",
      strokeOpacityArr[gId],
    );

    // Append into <div class="setting-item-for-group-colors">
    settingItemDiv.appendChild(gIdSpan); // gId
    settingItemDiv.appendChild(strokeThumbDiv); // stroke
    settingItemDiv.appendChild(opacitySelect); // opacity
    settingItemDiv.appendChild(strokeOpacitySelect); // stroke-opacity

    // Append into <div id="group-colors-pickers">
    groupColorsDiv.appendChild(settingItemDiv);
  }
}

// 既存のカラーピッカーをクリーンアップする関数
function cleanupExistingPickers(): void {
  // 既存のピッカー要素を取得
  const existingPickers = document.querySelectorAll(".alwan");
  console.log("existingPickers: ", existingPickers);
  // e.g.: NodeList(3) [ div#alwan-picker-0.alwan, div#alwan-picker-1.alwan, div#alwan-picker-2.alwan ]

  existingPickers.forEach((picker) => {
    // イベントハンドラ内で取得したインスタンスを使用してdestroy
    picker.addEventListener("change", (ev: Event) => {
      const pickerInstance =
        (ev as Event & { source: { destroy(): void } }).source;
      pickerInstance.destroy();
    });

    // または直接DOM要素を削除（この場合はdestroyする前に必ずイベントを実行する必要があります）
    picker.remove();
  });
}

// Create <span> to display the group ID number
function createGroupIdSpanElement(gId: number): HTMLSpanElement {
  const gIdSpan = document.createElement("span");
  gIdSpan.id = `group-colors-id-${gId}`;
  gIdSpan.textContent = `${gId}:`;
  gIdSpan.classList.add("group-id-text");
  return gIdSpan;
}
// Create <div> to indicate the color thumbnail with text
function createStrokeThumbnailDivElement(
  gId: number,
  strokeColorStr: string,
  colorFormat: string,
): HTMLDivElement {
  const strokeThumbDiv = document.createElement("div");
  strokeThumbDiv.id = `group-colors-stroke-thumbnail-${gId}`;
  strokeThumbDiv.innerHTML = strokeColorStr;
  strokeThumbDiv.style.backgroundColor = strokeColorStr;
  strokeThumbDiv.classList.add("stroke-thumbnail");

  // Set text color with calculated lightness for optimal contrast
  const textLightness = getTextLightness(strokeColorStr);
  strokeThumbDiv.style.color = `lch(${textLightness} 0 0)`;

  // Input box size defined by css class by color format: 'rgb' or 'hex'
  if (colorFormat === "rgb") {
    strokeThumbDiv.classList.add("stroke-rgb");
  } else { // (colorFormat === "hex")
    strokeThumbDiv.classList.add("stroke-hex");
  }

  return strokeThumbDiv;
}

/**
 * Get text color with calculated lightness for optimal contrast
 * @param {string} colorString - RGB|HEX color value string, e.g.: "rgb(0 0 0)"|"#000000"
 * @return {number} - Lightness value for LCH, [0-100]
 */
function getTextLightness(colorString: string): number {
  const rgbArr = convertToRgbArr(colorString);
  // Number() preserves the legacy coercion for invalid input (sentinel strings flow the same way).
  const lch = rgbToLch(Number(rgbArr[0]), Number(rgbArr[1]), Number(rgbArr[2])); // r, g, b UInt8 [0-255]
  const fillLightness = Math.round(lch.lightness); // Integer [0-100]
  const textLightness = calculateContrast(fillLightness);
  console.log(
    "colorString, fillLightness, textLightness: ",
    colorString,
    fillLightness,
    textLightness,
  );
  return textLightness;
}

function calculateContrast(fillLightness: number): number {
  const contrastDiff = 50;
  return fillLightness <= 50
    ? fillLightness + contrastDiff
    : fillLightness - contrastDiff;
}

// Determines color picker theme ('light'/'dark') based on active base UI theme
// Mapping logic:
// - Base UI themes ['white', 'light'] → 'light' picker theme
// - Base UI themes ['dark', 'black'] → 'dark' picker theme
function determinePickerTheme(): "light" | "dark" {
  const baseUiTheme = getState("themeColor") as string;
  const lightOrDark = ["white", "light"].includes(baseUiTheme)
    ? "light"
    : "dark";
  return lightOrDark;
}

// Create <select> elements for opacity and stroke-opacity
function createOpacitiesSelectElement(
  i: number,
  step: number,
  attrName: string,
  attrValue: string | number | undefined,
): HTMLSelectElement {
  // 選択肢となる数値のリストを作成
  const values = numbersIncrementByStep(step);
  console.log("values: ", values);
  // e.g.: 0.2  => //  (6) [0, 0.2, 0.4, 0.6, 0.8, 1]

  // 現在の値を設定
  const currentValue = attrValue;

  // 現在の値に最も近い値を見つけ出す
  // Number() preserves the legacy coercion for the string option values.
  const closestValue = values.reduce((prev: string, curr: string) =>
    Math.abs(Number(curr) - Number(currentValue)) <
        Math.abs(Number(prev) - Number(currentValue))
      ? curr
      : prev
  );

  // select要素を作成
  const opacitiesSelect = document.createElement("select");
  opacitiesSelect.name = `group-colors-${attrName}-${i}`;
  opacitiesSelect.id = `group-colors-${attrName}-${i}`;
  opacitiesSelect.classList.add("opacities-selector");

  // 各選択肢を作成し、それぞれにvalue属性を設定
  values.forEach((value: string) => {
    const valuesOption = document.createElement("option");
    valuesOption.value = value;
    valuesOption.text = value;

    // 現在の値に最も近い値に対応するオプションに 'selected' 属性を設定
    if (value === closestValue) {
      valuesOption.setAttribute("selected", "selected");
    }

    opacitiesSelect.appendChild(valuesOption);
  });
  return opacitiesSelect;
}

function addEventListenerToAlwanOnChange(
  alwanInstance: InstanceType<typeof Alwan>,
  gId: number,
  colorFormat: string,
  svg2pngOption: { height: number },
): void {
  alwanInstance.on("change", (ev) => {
    console.log("ev.source: ", ev.source);
    console.log(`Color changed for group ${gId}:`, ev.rgb, ev.hex);
    // e.g: Color changed for group 0: rgb(255, 255, 255) #ffffff

    // Refine the color format
    const rgbAsSpaceDelimited = ev.rgb.replace(/,\s*/g, " "); // e.g.: rgb(255, 255, 255) => rgb(255 255 255)
    const hexInUpperCase = ev.hex.toUpperCase(); // e.g.: #ffffff => #FFFFFF

    // Get color value as current selected color format (RGB(remove ",") or HEX)
    const inputValue = colorFormat === "rgb"
      ? rgbAsSpaceDelimited
      : hexInUpperCase;

    // Apply the value to HTML (color thumbnail element)
    const strokeThumbDiv = document.getElementById(
      `group-colors-stroke-thumbnail-${gId}`,
    );
    if (strokeThumbDiv === null) {
      throw new Error(
        `addEventListenerToAlwanOnChange: element not found: #group-colors-stroke-thumbnail-${gId}`,
      );
    }
    strokeThumbDiv.style.backgroundColor = inputValue; // Fill with selected color
    strokeThumbDiv.innerHTML = inputValue; // Add text
    const textLightness = getTextLightness(inputValue); // Get text color
    strokeThumbDiv.style.color = `lch(${textLightness} 0 0)`; // Apply text color

    // Apply the value to SVG string
    // @attrName = 'stroke'
    const updatedSvg = updateSvgWithNewColorValue(inputValue, "stroke", gId);

    // Render new PNG
    executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption);
  });
}
