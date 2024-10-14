import { removeOpacity } from 'modal/optimize-svg'
import { getState } from 'state/url-state-manager'
import { convertColorFormatForArray } from 'tab-lines/color-format-converter'
import { getGroupColorsValues } from 'tab-lines/get-colors-from-svg'
import { numbersIncrementByStep } from 'tab-lines/opacity-steps'
export
{ generateGroupColorsHtmlElements, generateGroupColorsSvgTags}
function generateGroupColorsSvgTags(matches) {const stroke = matches[1]
const opacity = matches[2] !== undefined ? matches[2] : "1.0"
const strokeOpacity = matches[3] !== undefined ? matches[3] : "1.0"
const groupElem = `<g stroke="${stroke}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`
const isOpacityRemoved = getState('removeOpacity')
if (isOpacityRemoved) {return removeOpacity(groupElem)} else {return groupElem}}
function generateGroupColorsHtmlElements(inputSvg, colorFormat, opacitySteps) {const groupColorsValues = getGroupColorsValues(inputSvg)
const numberOfGroups = groupColorsValues.get('number_of_groups')
const stroke = convertColorFormatForArray(groupColorsValues.get('stroke_array'), colorFormat)
const opacity = groupColorsValues.get('opacity_array')
const strokeOpacity = groupColorsValues.get('stroke_opacity_array')
const groupColorsDiv = document.getElementById("group-colors-input-and-select")
while (groupColorsDiv.firstChild) {groupColorsDiv.removeChild(groupColorsDiv.firstChild)}
for (let i = 0; i < numberOfGroups; i++) {const optsCellDiv = document.createElement('div')
optsCellDiv.classList.add('opts-cell-for-group-colors')
const labelElement = document.createElement("label")
labelElement.setAttribute('for', `group-colors-stroke-${i}`)
labelElement.textContent = `${i}:`
labelElement.classList.add('stroke')
const inputElement = document.createElement("input")
if (colorFormat === "rgb") {inputElement.classList.add('stroke-rgb')} else {inputElement.classList.add('stroke-hex')}
inputElement.classList.add('stroke')
inputElement.autocomplete = "off"
inputElement.id = `group-colors-stroke-${i}`
inputElement.setAttribute('value', `${stroke[i]}`)
inputElement.setAttribute("data-jscolor", `{format:'${colorFormat}'}`)
new jscolor(inputElement)
optsCellDiv.appendChild(labelElement)
optsCellDiv.appendChild(inputElement)
const opacitySelectElem = generateOpacityElements(i, opacitySteps, 'opacity', opacity[i])
const strokeOpacitySelectElem = generateOpacityElements(i, opacitySteps, 'stroke-opacity', strokeOpacity[i])
optsCellDiv.appendChild(opacitySelectElem)
optsCellDiv.appendChild(strokeOpacitySelectElem)
groupColorsDiv.appendChild(optsCellDiv)}}
function generateOpacityElements(i, step, attrName, attrValue) {const values = numbersIncrementByStep(step)
let currentValue = attrValue
let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev)
let selectElement = document.createElement("select")
selectElement.name = `group-colors-${attrName}-${i}`
selectElement.id = `group-colors-${attrName}-${i}`
selectElement.classList.add('opacity')
values.forEach((value) => {let optionElement = document.createElement("option")
optionElement.value = value
optionElement.text = value
if (value === closestValue) {optionElement.setAttribute('selected', 'selected')}
selectElement.appendChild(optionElement)})
return selectElement}