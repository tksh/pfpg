import { initDownloadButtons } from 'button/init-download-buttons'
import { initButtonActionSelect } from 'button/update-button-text'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg } from 'decode/decode'
import { initLayout } from 'init/adjust-output-boxes-size'
import { initTabs } from 'init/tab-setup'
import { initSvgOptimizationModalToggle, initResetSettingsModalToggle } from 'modal/modal-toggle'
import { initSvgOptimization } from 'modal/optimize-svg'
import { initResetSettings } from 'modal/reset-settings'
import { applyImageCustomization, applyUiConfiguration, applySvgOptimization } from 'state/apply-url-state'
import { resvgOption } from 'state/resvg-option'
import { getState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { initShapeToTrimSelect, initWidthNarrownessSelect, initTopHeavyRatioSelect, initCropSideMarginsCheckbox } from 'tab-canvas/shape-to-trim-listener'
import { initColorFormatSelect } from 'tab-lines/color-format'
import { initGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { initOpacityStepsSelect } from 'tab-lines/opacity-steps'
import { initPathModeSelect } from 'tab-lines/path-mode'
import { initWidthPixelSizeInputElements, initWidthValidatorListener } from 'tab-render/width-pixel-size'
import { initShapeRenderingSelect } from 'tab-render/shape-rendering'
import { initCheckerboardBgCheckbox } from 'tab-ui/checkerboard-bg'
import { initTextWrappingCheckbox } from 'tab-ui/text-wrapping'
import { initThemeColorSelect } from 'tab-ui/theme-color'
import { initViewScalingSelect } from 'tab-ui/view-scaling'
(async function () {if (!window.location.search) {const sampleUrlParamsStr = document.getElementById("sample-artwork-encoded-string").textContent
window.history.pushState({}, '', window.location.pathname + sampleUrlParamsStr)}
const isRelative = getState('pathMode') === 'relativeMerged'
document.getElementById("path-mode").value = isRelative ? 'relativeMerged' : 'absoluteSeparated'
const initialDecodedSvgString = decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
const svgString = applyImageCustomization(initialDecodedSvgString, resvgOption)
await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm'))
executeSvg2png({ target: { value: svgString } }, resvgOption)
const optimizedSvg = applySvgOptimization(svgString)
const svgTextarea = document.querySelector('#svg-string')
svgTextarea.value = optimizedSvg
initLayout()})()
document.addEventListener('DOMContentLoaded', () => {initTabs()
initGroupColorsInputs()
initPathModeSelect()
initOpacityStepsSelect()
initColorFormatSelect()
initShapeToTrimSelect()
initWidthNarrownessSelect()
initTopHeavyRatioSelect()
initCropSideMarginsCheckbox()
initShapeRenderingSelect()
initWidthPixelSizeInputElements()
initWidthValidatorListener()
initViewScalingSelect()
initCheckerboardBgCheckbox()
initTextWrappingCheckbox()
initButtonActionSelect()
initThemeColorSelect()
applyUiConfiguration()
initDownloadButtons()
initSvgOptimizationModalToggle()
initSvgOptimization()
initResetSettingsModalToggle()
initResetSettings()})