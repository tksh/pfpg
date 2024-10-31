import { getSvgString } from 'button/download-as-file'
import { resvgOption } from 'state/resvg-option'
import { getState, updateState } from 'state/url-state-manager'
import { updateSvgAsNewColorFormat } from 'tab-lines/update-svg-color-format'
import { generateGroupColorsHtmlElements } from 'tab-lines/group-colors-generator'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
export function initColorFormatSelect() {document.getElementById("color-format").addEventListener("change", (event) => {const colorFormat = event.target.value
updateState('colorFormat', colorFormat)
const svgString = getSvgString()
generateGroupColorsHtmlElements(svgString, colorFormat, getState('opacitySteps'))
const numberOfGroups = getNumberOfGroups(svgString)
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')
const updatedSvg = updateSvgAsNewColorFormat(colorFormat)
document.querySelector('#svg-string').value = updatedSvg})}