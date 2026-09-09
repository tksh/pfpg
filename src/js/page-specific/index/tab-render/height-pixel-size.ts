import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import {
  adjustInputValueViaButton,
  syncInputNumberAndRange,
} from "tab-render/sync-number-and-range";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export {
  adjustImageDisplay,
  initHeightPixelSizeInputElements,
  initNumberInputValidatorListener,
};

// Attach the event listeners to number input, range slider, and inc/dec buttons

function initHeightPixelSizeInputElements(): void {
  // input-box and slider
  const numberElem = document.querySelector("#png-size-number");
  if (!numberElem) throw new Error("Element '#png-size-number' not found");
  numberElem.addEventListener("change", pngSizeElement);
  const rangeElem = document.querySelector("#png-size-range");
  if (!rangeElem) throw new Error("Element '#png-size-range' not found");
  rangeElem.addEventListener("change", pngSizeElement);
  // Increment and decrement buttons
  const decButton = document.querySelector("#png-size-dec");
  if (!decButton) throw new Error("Element '#png-size-dec' not found");
  decButton.addEventListener("click", () => handleButtonClick(-1));
  const incButton = document.querySelector("#png-size-inc");
  if (!incButton) throw new Error("Element '#png-size-inc' not found");
  incButton.addEventListener("click", () => handleButtonClick(1));
}

// Attach the event listener to number input

function initNumberInputValidatorListener(): void {
  // Constraint validation
  const numberInput = document.getElementById("png-size-number");
  if (!numberInput) throw new Error("Element 'png-size-number' not found");
  const numberInputElement = numberInput as HTMLInputElement;
  numberInputElement.addEventListener(
    "change",
    numberInputElement.reportValidity,
  ); // 入力値が変更されたとき その妥当性を報告する
}

// Update svg2pngOption with new height size, and convert from SVG to PNG

function updateAndConvert(value: string | number): void {
  console.log("Updated value of 'Height pixel size':", value);
  updateState("heightPixelSize", value);

  // update the 'svg2pngOption'
  svg2pngOption.height = parseInt(String(value), 10);

  executeSvg2png({ target: { value: getSvgString() } }, svg2pngOption);

  adjustImageDisplay(Number(value));
}

// Event listener for both png-size-number and png-size-range
function pngSizeElement(event: Event): void {
  const target = event.target as HTMLInputElement;
  syncInputNumberAndRange(target);
  updateAndConvert(target.value);
}

// Function to handle button clicks
function handleButtonClick(step: number): void {
  const value = adjustInputValueViaButton(step);
  if (value !== null) {
    updateAndConvert(value);
  }
}

// Additional class for .actual-image-size
function adjustImageDisplay(value: number): void {
  const imgBox = document.getElementById("img-box");
  if (!imgBox) throw new Error("Element 'img-box' not found");

  // 画像サイズを取得
  const boxWidth = imgBox.clientWidth;
  console.log("value, boxWidth: ", value, boxWidth);

  if (value <= boxWidth) {
    // 小さい画像の場合は中央揃え
    imgBox.classList.add("small-image");
  } else {
    // 大きい画像の場合はスクロール
    imgBox.classList.remove("small-image");
  }
}
