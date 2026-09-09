import { downloadPngAsFile, downloadSvgAsFile } from "button/download-as-file";
import {
  copyPngToClipboard,
  copySvgToClipboard,
} from "button/copy-to-clipboard";

// Initialize download/copy button for SVG and PNG

export function initDownloadButtons(): void {
  const pngActionButton = document.getElementById("png-action-button");
  if (pngActionButton) {
    pngActionButton.addEventListener("click", executeActionForPng);
  }

  const svgActionButton = document.getElementById("svg-action-button");
  if (svgActionButton) {
    svgActionButton.addEventListener("click", executeActionForSvg);
  }
}

// 選択されているアクション を 実行する関数

function executeActionForSvg(): void {
  const actionSelect = document.getElementById("button-action") as
    | HTMLSelectElement
    | null;
  if (actionSelect === null) {
    throw new Error("executeActionForSvg: missing element #button-action");
  }
  const selectedAction = actionSelect.value;

  if (selectedAction === "download") {
    downloadSvgAsFile();
  } else if (selectedAction === "copy") {
    copySvgToClipboard();
  }
}

function executeActionForPng(): void {
  const actionSelect = document.getElementById("button-action") as
    | HTMLSelectElement
    | null;
  if (actionSelect === null) {
    throw new Error("executeActionForPng: missing element #button-action");
  }
  const selectedAction = actionSelect.value;

  if (selectedAction === "download") {
    downloadPngAsFile();
  } else if (selectedAction === "copy") {
    copyPngToClipboard();
  }
}
