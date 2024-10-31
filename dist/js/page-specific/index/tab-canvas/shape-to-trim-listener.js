import { getSvgString } from 'button/download-as-file'
import { resvgOption } from 'state/resvg-option'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { updateSvgWithSelectedShapePath } from 'tab-canvas/shape-to-trim'
import { cropSideMargins, resetSideMargins } from 'tab-canvas/crop-side-margins'
export
{ initShapeToTrimSelect, initWidthNarrownessSelect, initTopHeavyRatioSelect, initCropSideMarginsCheckbox, toggleDisplay}
function initShapeToTrimSelect() {document.getElementById('shape-to-trim').addEventListener("change", (event) => {const shapeToTrim = event.target.value
updateState('shapeToTrim', shapeToTrim)
const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']
if (shapeToTrim === 'squircleSlimmed') {toggleDisplay(elementsToToggle, 'inline')} else {toggleDisplay(elementsToToggle, 'none')}
const inputSvg = getSvgString()
const updatedSvg = updateSvgWithSelectedShapePath(shapeToTrim, inputSvg)
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function toggleDisplay(elements, display) {elements.forEach(element => {document.getElementById(element).style.display = display})}
function initWidthNarrownessSelect() {document.getElementById('width-narrowness').addEventListener('change', (event) => {const widthNarrowness = event.target.value
updateState('widthNarrowness', widthNarrowness)
const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function initTopHeavyRatioSelect() {document.getElementById('top-heavy-ratio').addEventListener('change', (event) => {const topHeavyRatio = event.target.value
updateState('topHeavyRatio', topHeavyRatio)
const updatedSvg = updateSvgWithSelectedShapePath('squircleSlimmed', getSvgString())
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function initCropSideMarginsCheckbox() {document.getElementById('crop-side-margins').addEventListener('change', (event) => {const svgString = getSvgString()
event.target.checked ? cropSideMargins(svgString) : resetSideMargins(svgString)})}