import { removeUrlParams
       , getStateUrlsOfImageCustomization
       , getStateUrlsOfSvgOptimization
       , getStateUrlsOfUiConfiguration } from 'state/state-as-url-params'

export function initResetSettings() {
    const modal = document.getElementById('reset-settings-modal')
    const resetButton = document.getElementById('reset-settings');
    const imageCustomCheckbox = document.getElementById('image-custom');
    const uiConfigCheckbox = document.getElementById('ui-config');
    const svgOptimizeCheckbox = document.getElementById('svg-optimize');

    // リセットボタンのイベントリスナー
    resetButton.addEventListener('click', function () {
        const paramsToReset = [];

        if (imageCustomCheckbox.checked) {
            paramsToReset.push(...Array.from(getStateUrlsOfImageCustomization().keys()));
        }

        if (uiConfigCheckbox.checked) {
            paramsToReset.push(...Array.from(getStateUrlsOfUiConfiguration().keys()));
        }

        if (svgOptimizeCheckbox.checked) {
            paramsToReset.push(...Array.from(getStateUrlsOfSvgOptimization().keys()));
        }

        //console.log("paramsToReset: ", paramsToReset)  // e.g.: (3) ['groupColors', 'shapeToTrim', 'themeColor']
        removeUrlParams(paramsToReset);

        // モーダルを閉じる
        modal.style.display = "none";

        // ページをリロード（オプション）
        window.location.reload();
    });
}