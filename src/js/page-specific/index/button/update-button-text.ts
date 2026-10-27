import { roundToOneDecimal } from "utils/number-rounding";
import { updateState } from "state/url-state-manager";
import type { EncodedImage } from "state/image-encoder";
import { displayFormatName, getImageFormat } from "state/image-format";
import { t } from "i18n/i18n";

export {
  initButtonActionSelect,
  replaceButtonText,
  syncCopyAvailability,
  updateButtonWithPngSize,
  updateButtonWithSvgSize,
};

// Per-button display state: the format shown (PNG, WebP, ...) and the size
// line of the last render. The action select re-renders the buttons without a
// new render, so this state is what lets swapping Download for Copy keep the
// size display instead of leaking an English-only word search through the
// current HTML.
interface ActionButtonState {
  format: string;
  sizeText: string;
}

const buttonStates = new Map<string, ActionButtonState>();

function getActionType(): "download" | "copy" {
  const actionSelect = document.getElementById("button-action") as
    | HTMLSelectElement
    | null;
  if (actionSelect === null) {
    throw new Error("getActionType: missing element #button-action");
  }
  return actionSelect.value === "download" ? "download" : "copy";
}

// Rebuilds the button's label (and size line, if a render already ran) out of
// the i18n messages for the given action.
function renderActionButton(
  buttonId: string,
  action: "download" | "copy",
): void {
  const button = document.getElementById(buttonId);
  if (button === null) {
    throw new Error(`updateButtonText: missing element #${buttonId}`);
  }
  const state = buttonStates.get(buttonId) ?? {
    format: buttonId === "svg-action-button" ? "SVG" : "PNG",
    sizeText: "",
  };
  const actionSpan = document.createElement("span");
  actionSpan.textContent = action === "download"
    ? t("button.downloadFormat", { format: state.format })
    : t("button.copyFormat", { format: state.format });

  button.innerHTML = "";
  button.appendChild(actionSpan);
  if (state.sizeText !== "") {
    const sizeSpan = document.createElement("span");
    sizeSpan.dir = "ltr";
    sizeSpan.textContent = state.sizeText;
    button.appendChild(sizeSpan);
  }
}

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
    syncCopyAvailability();
  });
}

// WebP never reaches the system clipboard: the clipboard API refuses the
// write, so the click used to disappear into the console. While that
// combination is selected, the image button is disabled and the ⓘ beside the
// action select explains why; the hint describes WebP only, so it is tied to
// the image format rather than to the action.
function syncCopyAvailability(): void {
  const webpSelected = getImageFormat() === "webp";
  const copySelected = getActionType() === "copy";

  const pngActionButton = document.getElementById("png-action-button");
  if (pngActionButton === null) {
    throw new Error(
      "syncCopyAvailability: missing element #png-action-button",
    );
  }
  (pngActionButton as HTMLButtonElement).disabled = webpSelected &&
    copySelected;

  const infoButton = document.getElementById("button-action-info");
  if (infoButton === null) {
    throw new Error(
      "syncCopyAvailability: missing element #button-action-info",
    );
  }
  infoButton.hidden = !webpSelected;

  // Switching back to PNG while the hint is open must dismiss it, or the
  // explanation of a disabled button would float over an enabled one.
  const hint = document.getElementById("button-action-hint");
  if (hint === null) {
    throw new Error(
      "syncCopyAvailability: missing element #button-action-hint",
    );
  }
  if (!webpSelected && hint.matches(":popover-open")) {
    hint.hidePopover();
  }
}

function replaceButtonText(buttonAction: string, button: HTMLElement): void {
  if (button.id === "") {
    throw new Error("replaceButtonText: button without an id");
  }
  renderActionButton(
    button.id,
    buttonAction === "download" ? "download" : "copy",
  );
}

// SVG/画像ファイルサイズを ダウンロードボタンに 表示する関数
// `buttonId` は対象ボタンの id の接頭辞（'png' | 'svg'）、`label` は表示する形式名
function updateButtonText(
  buttonId: string,
  label: string,
  byteSize: number,
): void {
  // Get button element
  const actionButtonElementId = `${buttonId}-action-button`;
  const actionButtonElement = document.getElementById(actionButtonElementId);
  if (actionButtonElement === null) {
    throw new Error(
      `updateButtonText: missing element #${actionButtonElementId}`,
    );
  }

  // Convert number value from 'byte' to 'KB'
  const sizeAsKb = roundToOneDecimal(byteSize / 1024);
  const formattedLabel = displayFormatName(label);

  const sizeText = t("button.size", {
    kb: sizeAsKb,
    bytes: byteSize.toLocaleString(),
  });
  buttonStates.set(actionButtonElementId, {
    format: formattedLabel,
    sizeText,
  });
  renderActionButton(actionButtonElementId, getActionType());
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
