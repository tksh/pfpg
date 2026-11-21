import { getSvgString } from "button/download-as-file";
import { svg2pngOption } from "state/resvg-option";
import {
  adjustInputValueViaButton,
  syncInputNumberAndRange,
} from "tab-render/sync-number-and-range";
import { updateState } from "state/url-state-manager";
import { executeSvg2png } from "svg-to-png";

export { adjustImageDisplay, initHeightPixelSizeInputElements };

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

// Update svg2pngOption with new height size, and convert from SVG to PNG

function updateAndConvert(value: string | number): void {
  updateState("heightPixelSize", value);

  // update the 'svg2pngOption'
  svg2pngOption.height = parseInt(String(value), 10);

  executeSvg2png({ target: { value: getSvgString() } }, svg2pngOption);

  adjustImageDisplay(Number(value));
}

// Event listener for both png-size-number and png-size-range
function pngSizeElement(event: Event): void {
  const target = event.target as HTMLInputElement;
  // The number input's min/max are the same 1..4096 domain the URL parser
  // enforces. Reject the edit before it reaches the URL, the slider or the
  // rasterizer, and let the browser show why the value was refused.
  if (!target.checkValidity()) {
    target.reportValidity();
    return;
  }
  syncInputNumberAndRange(target);
  updateAndConvert(target.value);
}

// Function to handle button clicks
function handleButtonClick(step: number): void {
  const value = adjustInputValueViaButton("png-size", step);
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

  if (value <= boxWidth) {
    // 小さい画像の場合は中央揃え
    imgBox.classList.add("small-image");
  } else {
    // 大きい画像の場合はスクロール
    imgBox.classList.remove("small-image");
  }
}
