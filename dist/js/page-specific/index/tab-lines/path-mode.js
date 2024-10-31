import { getSvgString } from 'button/download-as-file'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg } from 'decode/decode'
import { optimizeSvg} from 'modal/optimize-svg'
import { resvgOption } from 'state/resvg-option'
import { getState, updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { replaceAtIndex } from 'utils/replace-at-index'
export
{ initPathModeSelect, decodeAsSelectedPathMode}
function initPathModeSelect() {document.getElementById("path-mode").addEventListener("change", async (event) => {const currentPathModeSvg = getSvgString()
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
document.querySelector('#svg-string').value = optimizedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)})}
function decodeAsSelectedPathMode(pathMode) {if (pathMode === 'relativeMerged') {const isRelative = true
return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())} else {const isRelative = false
return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())}}
function recoverCurrentOptionValue(svgString, regexPattern, valueString) {return svgString.replace(regexPattern, valueString)}
function recoverCurrentGroupColorsValues(svgString, regexPattern, regexMatches) {let recoveredSvgString = svgString
for (let gId = 0; gId < regexMatches.length; gId++) {const colorsValues = regexMatches[gId]
recoveredSvgString = replaceAtIndex(recoveredSvgString, regexPattern, colorsValues, gId)}
return recoveredSvgString}