import { getSvgString } from 'button/download-as-file'
import { initDownloadButtons } from 'button/init-download-buttons'
import { initButtonActionSelect } from 'button/update-button-text'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg } from 'decode/decode'
import { adjustBox } from 'init/adjust-output-boxes-size'
import { initTabs } from 'init/tab-setup'
import { initSvgOptimizationModalToggle, initResetSettingsModalToggle } from 'modal/modal-toggle'
import { initSvgOptimization, optimizeSvg} from 'modal/optimize-svg'
import { initResetSettings } from 'modal/reset-settings'
import { applyImageCustomization, applyUiConfiguration, applySvgOptimization } from 'state/apply-url-state'
import { resvgOption } from 'state/resvg-option'
import { getState, updateState } from 'state/url-state-manager'
import { executeSvg2png, svg2png} from 'svg-to-png'
import { cropSideMargins, resetSideMargins } from 'tab-canvas/crop-side-margins'
import { toggleDisplay, updateSvgWithSelectedShapePath } from 'tab-canvas/shape-to-trim'
import { updateSvgAsNewColorFormat } from 'tab-lines/update-svg-color-format'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { generateGroupColorsHtmlElements } from 'tab-lines/group-colors'
import { changeOpacitySelectOptionsAsNewStep, updateSvgForNewStep } from 'tab-lines/opacity-steps'
import { decodeAsSelectedPathMode, recoverCurrentGroupColorsValues, recoverCurrentOptionValue } from 'tab-lines/path-mode'
import { adjustWidthNum, syncWidthNum } from 'tab-render/sync-number-and-range'
import { replaceShapeRendering } from 'tab-render/shape-rendering'
import { initWidthValidatorListener } from 'tab-render/width-pixel-size'
import { initCheckerboardBgCheckbox } from 'tab-ui/checkerboard-bg'
import { initTextWrappingCheckbox } from 'tab-ui/text-wrapping'
import { initThemeColorSelect } from 'tab-ui/theme-color'
import { initViewScalingSelect } from 'tab-ui/view-scaling'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
(async function () {if (!window.location.search) {const sampleUrlParamsStr = document.getElementById("sample-artwork-encoded-string").textContent
window.history.pushState({}, '', window.location.pathname + sampleUrlParamsStr)}
const isRelative = getState('pathMode') === 'relativeMerged'
document.getElementById("path-mode").value = isRelative ? 'relativeMerged' : 'absoluteSeparated'
const initialDecodedSvgString = decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
const svgString = applyImageCustomization(initialDecodedSvgString, resvgOption)
const svgStringElement = document.querySelector('#svg-string')
svgStringElement.value = svgString
await resvg.initWasm(fetch('./wasm/index_bg.2.6.2.wasm'))
executeSvg2png({ target: { value: svgString } }, resvgOption)
const optimizedSvg = applySvgOptimization(svgString)
svgStringElement.value = optimizedSvg
const numberOfGroups = getNumberOfGroups(getSvgString())
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')
document.getElementById("path-mode").addEventListener("change", async (event) => {const currentPathModeSvg = getSvgString()
const patternGroupColors = /<g stroke=[^>]*>/g
const matchOfGroupColors = currentPathModeSvg.match(patternGroupColors)
const patternShapeToTrim = /<clipPath id="shape-to-trim">[^>]*>/g
const matchOfShapeToTrim = currentPathModeSvg.match(patternShapeToTrim)
const valueOfShapeToTrim = matchOfShapeToTrim[0]
const patternViewbox = /viewBox="[^"]*"/
const matchOfViewbox = currentPathModeSvg.match(patternViewbox)
const valueOfViewbox = matchOfViewbox[0]
const patternShapeRendering = /shape-rendering="[^"]*"/g
const matchOfShapeRendering = currentPathModeSvg.match(patternShapeRendering)
const valueOfShapeRendering = matchOfShapeRendering[0]
const pathMode = event.target.value
const newPathModeSvg = decodeAsSelectedPathMode(pathMode)
const recoverShapeRendering = recoverCurrentOptionValue(newPathModeSvg, patternShapeRendering, valueOfShapeRendering)
const recoverShapeToTrim = recoverCurrentOptionValue(recoverShapeRendering, patternShapeToTrim, valueOfShapeToTrim)
const recoverViewbox = recoverCurrentOptionValue(recoverShapeToTrim, patternViewbox, valueOfViewbox)
const updatedSvg = recoverCurrentGroupColorsValues(recoverViewbox, patternGroupColors, matchOfGroupColors)
updateState('pathMode', pathMode)
const svgOptState = new Map([['removeOpacity', getState('removeOpacity') ],['removeLineBreaks', getState('removeLineBreaks')],['removeSpaces', getState('removeSpaces') ],])
const optimizedSvg = optimizeSvg(updatedSvg, svgOptState)
svgStringElement.value = optimizedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
document.getElementById("opacity-steps").addEventListener("change", (event) => {const opacitySteps = Number(event.target.value)
updateState('opacitySteps', opacitySteps)
changeOpacitySelectOptionsAsNewStep(getSvgString(), opacitySteps)
const updatedSvg = updateSvgForNewStep(getSvgString())
svgStringElement.value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
document.getElementById("color-format").addEventListener("change", (event) => {const colorFormat = event.target.value
updateState('colorFormat', colorFormat)
generateGroupColorsHtmlElements(getSvgString(), colorFormat, getState('opacitySteps'))
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')
const updatedSvg = updateSvgAsNewColorFormat(colorFormat)
svgStringElement.value = updatedSvg})
document.getElementById('width-narrowness').addEventListener('change', (event) => {const widthNarrowness = event.target.value
updateState('widthNarrowness', widthNarrowness)
const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
svgStringElement.value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
document.getElementById('top-heavy-ratio').addEventListener('change', (event) => {const topHeavyRatio = event.target.value
updateState('topHeavyRatio', topHeavyRatio)
const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
svgStringElement.value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
document.getElementById('shape-to-trim').addEventListener("change", (event) => {const shapeToTrim = event.target.value
updateState('shapeToTrim', shapeToTrim)
const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']
if (shapeToTrim === 'squircleSlimmed') {toggleDisplay(elementsToToggle, 'inline')} else {toggleDisplay(elementsToToggle, 'none')}
const inputSvg = getSvgString()
const updatedSvg = updateSvgWithSelectedShapePath(shapeToTrim, inputSvg)
svgStringElement.value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
document.getElementById('crop-side-margins').addEventListener('change', (event) => {const svgString = getSvgString()
event.target.checked ? cropSideMargins(svgString) : resetSideMargins(svgString)})
document.getElementById("shape-rendering").addEventListener("change", (event) => {const shapeRendering = event.target.value
updateState('shapeRendering', shapeRendering)
const svgString = svgStringElement.value
const updatedSvg = replaceShapeRendering(svgString, shapeRendering)
svgStringElement.value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})
const updateAndConvert = (value) => {updateState('widthPixelSize', value)
resvgOption.fitTo.value = parseInt(value, 10)
executeSvg2png({ target: { value: getSvgString() } }, resvgOption)}
const pngSizeElement = (event) => {syncWidthNum(event.target)
updateAndConvert(event.target.value)}
const handleButtonClick = (step) => {const value = adjustWidthNum(step)
if (value !== null) {updateAndConvert(value)}}
document.querySelector('#png-size-number').addEventListener('change', pngSizeElement)
document.querySelector('#png-size-range').addEventListener('change', pngSizeElement)
document.querySelector('#width-size-dec').addEventListener('click', () => handleButtonClick(-1))
document.querySelector('#width-size-inc').addEventListener('click', () => handleButtonClick(1))
const cropElement = document.querySelector('#crop-by-bbox')
cropElement.addEventListener('change', function (event) {const hasCrop = event.target.checked
svg2png(null, resvgOption, hasCrop)})
const initLayout = async () => {await adjustBox()}
initLayout()})()
document.addEventListener('DOMContentLoaded', () => {initDownloadButtons()
initViewScalingSelect()
initCheckerboardBgCheckbox()
initTextWrappingCheckbox()
initButtonActionSelect()
initThemeColorSelect()
applyUiConfiguration()
initWidthValidatorListener()
initTabs()
initSvgOptimizationModalToggle()
initSvgOptimization()
initResetSettingsModalToggle()
initResetSettings()})