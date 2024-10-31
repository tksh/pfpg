import { getSvgString } from 'button/download-as-file'
import { resvgOption } from 'state/resvg-option'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
export
{ initShapeRenderingSelect, replaceShapeRendering}
function initShapeRenderingSelect() {document.getElementById("shape-rendering").addEventListener("change", (event) => {const shapeRendering = event.target.value
updateState('shapeRendering', shapeRendering)
const svgString = getSvgString()
const updatedSvg = replaceShapeRendering(svgString, shapeRendering)
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function replaceShapeRendering(svgString, shapeRendering) {const patternForShapeRendering = /shape-rendering="[^"]*"/g
return svgString.replace(patternForShapeRendering, `shape-rendering="${shapeRendering}"`)}