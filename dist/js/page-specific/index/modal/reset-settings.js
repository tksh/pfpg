import { removeUrlParams, getStateUrlsOfImageCustomization, getStateUrlsOfSvgOptimization, getStateUrlsOfUiConfiguration} from 'state/url-state-manager'
export function initResetSettings() {const modal = document.getElementById('reset-settings-modal')
const resetButton = document.getElementById('reset-settings')
const imageCustomCheckbox = document.getElementById('image-custom')
const uiConfigCheckbox = document.getElementById('ui-config')
const svgOptimizeCheckbox = document.getElementById('svg-optimize')
resetButton.addEventListener('click', function () {const paramsToReset = []
if (imageCustomCheckbox.checked) {paramsToReset.push(...Array.from(getStateUrlsOfImageCustomization().keys()))}
if (uiConfigCheckbox.checked) {paramsToReset.push(...Array.from(getStateUrlsOfUiConfiguration().keys()))}
if (svgOptimizeCheckbox.checked) {paramsToReset.push(...Array.from(getStateUrlsOfSvgOptimization().keys()))}
removeUrlParams(paramsToReset)
modal.style.display = "none"
window.location.reload()})}