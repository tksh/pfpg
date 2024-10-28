import { tabSpace } from 'constants'
import { getSvgString } from 'button/download-as-file'
import { updateButtonWithSvgSize} from 'button/update-button-text'
import { updateState, getState} from 'state/url-state-manager'
import { decodeAsSelectedPathMode } from 'tab-lines/path-mode'
export
{ initSvgOptimization, getSvgIndentation, getCurrentPathModeIndentation, removeOpacity, removeLineBreaks, removeSpaces, optimizeSvg, tryRemoveOpacity, tryRemoveLineBreaks, tryRemoveSpaces}
function tryRemoveOpacity(svgString, isOpacityRemoved) {if (isOpacityRemoved) {return removeOpacity(svgString)} else {return svgString}}
function tryRemoveLineBreaks(svgString, isLineBreaksRemoved) {if (isLineBreaksRemoved) {return removeLineBreaks(svgString)} else {return svgString}}
function tryRemoveSpaces(svgString, isSpacesRemoved) {if (isSpacesRemoved) {return removeSpaces(svgString)} else {return svgString}}
const svgOptions = [{ id: 'remove-opacity',stateKey: 'removeOpacity',removeFunction: removeOpacity,restoreFunction: restoreOpacity },{ id: 'remove-line-breaks',stateKey: 'removeLineBreaks',removeFunction: removeLineBreaks,restoreFunction: restoreLineBreaks,needsPathMode: true },{ id: 'remove-spaces',stateKey: 'removeSpaces',removeFunction: removeSpaces,restoreFunction: restoreSpaces }]
function initSvgOptimization() {const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]')
checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateSvg))}
function updateSvg() {let svgString = getSvgString()
svgOptions.forEach(option => {const checkbox = document.getElementById(option.id)
const beforeElement = document.querySelector(`#before-${option.id}`)
const afterElement = document.querySelector(`#after-${option.id}`)
beforeElement.classList.toggle('option-applied', !checkbox.checked)
afterElement.classList.toggle('option-applied', checkbox.checked)
if (checkbox.checked) {svgString = option.removeFunction(svgString)
updateState(option.stateKey, true)} else {if (option.needsPathMode) {const pathMode = getState('pathMode')
svgString = option.restoreFunction(svgString, pathMode)} else {svgString = option.restoreFunction(svgString)}
updateState(option.stateKey, false)}
document.querySelector('#svg-string').value = svgString
updateButtonWithSvgSize(svgString)})}
function removeOpacity(svgString) {return svgString.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '')}
function restoreOpacity(svgString) {return svgString.replace(/<g\b([^>]*)>/g, function(match, attributes) {if (!/\bstroke="[^"]*"/.test(attributes)) {return match;}
let attrs = attributes.split(/\s+/).filter(attr => attr.trim() !== '')
let opacityValue = "1.0"
let strokeOpacityValue = "1.0"
let newAttrs = []
for (let attr of attrs) {if (attr.startsWith('opacity="')) {opacityValue = attr.split('"')[1]} else if (attr.startsWith('stroke-opacity="')) {strokeOpacityValue = attr.split('"')[1]} else {newAttrs.push(attr)}}
newAttrs.push(`opacity="${opacityValue}"`)
newAttrs.push(`stroke-opacity="${strokeOpacityValue}"`)
return `<g ${newAttrs.join(' ')}>`})}
function removeLineBreaks(svgString) {return svgString.replace(/>\s+</g, '><')}
function restoreLineBreaks(svgString, pathMode) {const indentCounts = getCurrentPathModeIndentation(pathMode)
let formattedSvg = svgString.replace(/></g, '>\n<')
const lines = formattedSvg.split('\n')
const indentedLines = lines.map((line, index) => {const indentCount = indentCounts[index] || 0
return tabSpace.repeat(indentCount) + line.trim()})
return indentedLines.join('\n')}
function getSvgIndentation(svgString) {const lines = svgString.split('\n')
return lines.map(line => {const match = line.match(/^(\s*)/)
return match ? Math.floor(match[1].length / 4) : 0})}
function getCurrentPathModeIndentation(pathMode) {const svgString = decodeAsSelectedPathMode(pathMode)
return getSvgIndentation(svgString)}
function removeSpaces(svgString) {return svgString.replace(/(\sd="[^>]+>)/g, (match, pathData) => {const optimizedPath = pathData
.replace(/([MLHVCSQTAZ])\s+/gi, '$1')
.replace(/(\d)\s+([MLHVCSQTAZ])/gi, '$1$2')
.replace(/"\s+(\/)/g, '"$1')
return optimizedPath})}
function restoreSpaces(svgString) {return svgString.replace(/(\sd="[^>]+>)/g, (match, pathData) => {const restoredPath = pathData
.replace(/([MLHVCSQTAZ])/gi, '$1 ')
.replace(/(\d)([MLHVCSQTAZ])/gi, '$1 $2')
.replace(/"(\/)/g, '" $1')
return restoredPath})}
function optimizeSvg(svgString, state) {let optimizedSvg = svgString
for (const [functionName, isEnabled] of state) {if (isEnabled && typeof optimizeFunctions[functionName] === 'function') {optimizedSvg = optimizeFunctions[functionName](optimizedSvg)}}
return optimizedSvg}
const optimizeFunctions = {removeOpacity,removeLineBreaks,removeSpaces}