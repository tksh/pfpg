import { getSvgString } from 'button/download-as-file'
import { formatAsFloatString } from 'common-utils/format-as-float'
import { resvgOption } from 'state/resvg-option'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { getGroupColorsValues } from 'tab-lines/get-colors-from-svg'
import { generateGroupColorsSvgTags } from 'tab-lines/group-colors-generator'
import { getNumberOfGroups } from 'utils/get-number-of-groups'
import { replaceAtIndex } from 'utils/replace-at-index'
export
{ initOpacityStepsSelect, changeOpacitySelectOptionsAsNewStep, updateSvgForNewStep, getElementValueById, numbersIncrementByStep}
function initOpacityStepsSelect() {document.getElementById("opacity-steps").addEventListener("change", (event) => {const opacitySteps = Number(event.target.value)
updateState('opacitySteps', opacitySteps)
changeOpacitySelectOptionsAsNewStep(getSvgString(), opacitySteps)
const updatedSvg = updateSvgForNewStep(getSvgString())
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function changeOpacitySelectOptionsAsNewStep(svgString, opacitySteps) {const groupColorsValues = getGroupColorsValues(svgString)
const numberOfGroups = groupColorsValues.get('number_of_groups')
const opacity = groupColorsValues.get('opacity_array')
const strokeOpacity = groupColorsValues.get('stroke_opacity_array')
for (let i = 0; i < numberOfGroups; i++) {replaceToNewStepOptions(i, opacitySteps, 'opacity', opacity)
replaceToNewStepOptions(i, opacitySteps, 'stroke-opacity', strokeOpacity)}}
function replaceToNewStepOptions(i, opacitySteps, attrName, attrValueArray) {const selectElement = document.getElementById(`group-colors-${attrName}-${i}`)
while (selectElement.firstChild) {selectElement.removeChild(selectElement.firstChild)}
const values = numbersIncrementByStep(opacitySteps)
let currentValue = attrValueArray[i]
let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev)
values.forEach((value) => {let optionElement = document.createElement("option")
optionElement.value = value
optionElement.text = value
if (value === closestValue) {optionElement.setAttribute('selected', 'selected')}
selectElement.appendChild(optionElement)})}
function numbersIncrementByStep(step) {let numbers = []
for (let i = 0; i <= 100; i += step * 100) {numbers.push((i / 100))}
return formatAsFloatString(numbers.reverse())}
function updateSvgForNewStep(inputSvg) {const numberOfGroups = getNumberOfGroups(inputSvg)
const processGroup = (inputSvg, gId) => {const strokeElementId = `group-colors-stroke-${gId}`
const stroke = getElementValueById(strokeElementId)
const opacityElementId = `group-colors-opacity-${gId}`
const opacity = getElementValueById(opacityElementId)
const strokeOpacityElementId = `group-colors-stroke-opacity-${gId}`
const strokeOpacity = getElementValueById(strokeOpacityElementId)
const groupColorsArr = [undefined,stroke,opacity,strokeOpacity]
const changedGroupElem = generateGroupColorsSvgTags(groupColorsArr)
const pattern = /<g stroke=[^>]*>/g
return replaceAtIndex(inputSvg, pattern, changedGroupElem, gId)}
const updatedSvg = Array.from({ length: numberOfGroups }, (_, gId) => gId)
.reduce((acc, gId) => processGroup(acc, gId), inputSvg)
return updatedSvg}
function getElementValueById(id) {return document.getElementById(id).value}