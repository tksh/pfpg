import { updateState } from "state/url-state-manager";
import { roundToOneDecimal } from "utils/number-rounding";
import type { EncodedImage } from "state/image-encoder";

export {
  initButtonActionSelect,
  replaceButtonText,
  updateButtonWithPngSize,
  updateButtonWithSvgSize,
};

function initButtonActionSelect(): void {
  // セレクトメニューの変更時にボタンのテキストを更新
  const buttonActionElem = document.getElementById("button-action");
  if (buttonActionElem === null) {
    throw new Error("initButtonActionSelect: missing element #button-action");
  }
  buttonActionElem.addEventListener("change", (event) => {
    // Selected action value: 'download' or 'copy'
    const target = event.target as HTMLSelectElement | null;
    if (target === null) {
      throw new Error("initButtonActionSelect: missing event target");
    }
    const buttonAction = target.value;

    // Update the state
    updateState("buttonAction", buttonAction);

    // Get the button elements, PNG and SVG
    const pngActionButton = document.getElementById("png-action-button");
    if (pngActionButton === null) {
      throw new Error(
        "initButtonActionSelect: missing element #png-action-button",
      );
    }
    const svgActionButton = document.getElementById("svg-action-button");
    if (svgActionButton === null) {
      throw new Error(
        "initButtonActionSelect: missing element #svg-action-button",
      );
    }

    // Update the button innerHtml as selected action
    replaceButtonText(buttonAction, pngActionButton);
    replaceButtonText(buttonAction, svgActionButton);
  });
}

function replaceButtonText(buttonAction: string, button: HTMLElement): void {
  const buttonText = button.innerHTML;

  // "Download" または "Copy" を含む部分を探す
  const regex = /(Download|Copy)/i;
  const match = buttonText.match(regex);

  if (match) {
    // マッチした部分を置き換える
    const matched = match[0];
    if (matched === undefined) {
      throw new Error("replaceButtonText: unreachable match index");
    }
    const replacement = buttonAction === "download" ? "Download" : "Copy";
    button.innerHTML = buttonText.replace(matched, replacement);
  }
}

// SVG/画像ファイルサイズを ダウンロードボタンに 表示する関数
// `buttonId` は対象ボタンの id の接頭辞（'png' | 'svg'）、`label` は表示する形式名
function updateButtonText(
  buttonId: string,
  label: string,
  byteSize: number,
): void {
  // Get button element
  const actionButtonElement = document.getElementById(
    `${buttonId}-action-button`,
  );
  if (actionButtonElement === null) {
    throw new Error(
      `updateButtonText: missing element #${buttonId}-action-button`,
    );
  }

  // Get current action type as string
  const actionType = getActionType();

  // Convert number value from 'byte' to 'KB'
  const sizeAsKb = roundToOneDecimal(byteSize / 1024);

  // Create action element
  const action = document.createElement("span");
  const formattedLabel = label.toLowerCase() === "webp"
    ? "WebP"
    : label.toUpperCase();
  action.textContent = `${actionType} as ${formattedLabel}:\u00A0`;

  // Create size element
  const size = document.createElement("span");
  size.textContent = `(${sizeAsKb} KB, ${byteSize.toLocaleString()} bytes)`;

  // Clear existing content
  actionButtonElement.innerHTML = "";

  // Append new elements
  actionButtonElement.appendChild(action);
  actionButtonElement.appendChild(size);
}

// Get current action type as string
function getActionType(): string | undefined {
  const actionSelect = document.getElementById("button-action") as
    | HTMLSelectElement
    | null;
  if (actionSelect === null) {
    throw new Error("getActionType: missing element #button-action");
  }
  const buttonAction = actionSelect.value;

  if (buttonAction === "download") {
    return "Download";
  } else if (buttonAction === "copy") {
    return "Copy";
  }
}

// SVGテキストのバイトサイズを計算する関数
function byteCount(s: string): number {
  // Blobオブジェクトを使ってUTF-8でのバイトサイズを取得
  return new Blob([s]).size;
}

// SVG
function updateButtonWithSvgSize(svgString: string): void {
  // SVGテキストの サイズ（バイト数）を計算して表示
  const svgByteSize = byteCount(svgString);
  updateButtonText("svg", "svg", svgByteSize);
}
// 画像 (PNG / WebP)
function updateButtonWithPngSize(image: EncodedImage): void {
  // 画像データの サイズ（バイト数）を取得して表示
  updateButtonText("png", image.extension, image.bytes.length);
}
