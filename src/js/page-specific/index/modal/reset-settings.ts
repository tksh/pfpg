import {
  getStateUrlsOfImageCustomization,
  getStateUrlsOfSvgOptimization,
  getStateUrlsOfUiConfiguration,
  removeUrlParams,
} from "state/url-state-manager";

export function initResetSettings(): void {
  const modal = document.getElementById("reset-settings-modal");
  if (modal === null) {
    throw new Error("initResetSettings: missing element #reset-settings-modal");
  }
  const resetButton = document.getElementById("reset-settings");
  if (resetButton === null) {
    throw new Error("initResetSettings: missing element #reset-settings");
  }
  const imageCustomCheckbox = document.getElementById("image-custom") as
    | HTMLInputElement
    | null;
  if (imageCustomCheckbox === null) {
    throw new Error("initResetSettings: missing element #image-custom");
  }
  const uiConfigCheckbox = document.getElementById("ui-config") as
    | HTMLInputElement
    | null;
  if (uiConfigCheckbox === null) {
    throw new Error("initResetSettings: missing element #ui-config");
  }
  const svgOptimizeCheckbox = document.getElementById("svg-optimize") as
    | HTMLInputElement
    | null;
  if (svgOptimizeCheckbox === null) {
    throw new Error("initResetSettings: missing element #svg-optimize");
  }

  // リセットボタンのイベントリスナー
  resetButton.addEventListener("click", function () {
    const paramsToReset: string[] = [];

    if (imageCustomCheckbox.checked) {
      paramsToReset.push(
        ...Array.from(getStateUrlsOfImageCustomization().keys()) as string[],
      );
    }

    if (uiConfigCheckbox.checked) {
      paramsToReset.push(
        ...Array.from(getStateUrlsOfUiConfiguration().keys()) as string[],
      );
    }

    if (svgOptimizeCheckbox.checked) {
      paramsToReset.push(
        ...Array.from(getStateUrlsOfSvgOptimization().keys()) as string[],
      );
    }

    //console.log("paramsToReset: ", paramsToReset)  // e.g.: (3) ['groupColors', 'shapeToTrim', 'themeColor']
    removeUrlParams(paramsToReset);

    // モーダルを閉じる
    modal.style.display = "none";

    // ページをリロード
    globalThis.location.reload();
  });
}
