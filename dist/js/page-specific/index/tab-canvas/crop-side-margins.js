import { decodeUrlParams } from 'common-utils/read-url-params'
import { resvgOption } from 'state/resvg-option'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
import { toFixedTrimmed } from 'utils/number-rounding'
export
{ viewboxSlimmed, viewboxUnSlimmed, extractViewboxValues, cropSideMargins, resetSideMargins}
function cropSideMargins(inputSvg) {updateState('cropSideMargins', true)
return updateSvg(inputSvg, true)}
function resetSideMargins(inputSvg) {updateState('cropSideMargins', false)
return updateSvg(inputSvg, false)}
function updateSvg(inputSvg, isCropped) {const updatedSvg = isCropped ? viewboxSlimmed(inputSvg) : viewboxUnSlimmed(inputSvg)
document.querySelector('#svg-string').value = updatedSvg
executeSvg2png({ target: { value: updatedSvg } }, resvgOption)
return updatedSvg}
function viewboxSlimmed(inputSvg) {const slimmedXW = getSlimmedViewboxXW(inputSvg)
const viewboxValues = extractViewboxValues(inputSvg)
const newViewboxString = `viewBox="${slimmedXW.get('x')} ${viewboxValues.get('y')} ${slimmedXW.get('w')} ${viewboxValues.get('h')}"`
const patternForViewboxStr = /viewBox="[^"]+"/
return inputSvg.replace(patternForViewboxStr, newViewboxString)}
function getSlimmedViewboxXW(inputSvg) {const patternToGetSquircleSlimmedPathStr = /path d="M\s*(\d+(?:\.\d+)?)\s.*T\s*(\d+(?:\.\d+)?)/
const matches = patternToGetSquircleSlimmedPathStr.exec(inputSvg)
return new Map([['x', toFixedTrimmed(parseFloat(matches[1])) ],['w', toFixedTrimmed(parseFloat(matches[2] - matches[1]))]])}
function extractViewboxValues(inputSvg) {const match = inputSvg.match(/viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/)
if (match && match.length === 5) {return new Map([['x', parseFloat(match[1])],['y', parseFloat(match[2])],['w', parseFloat(match[3])],['h', parseFloat(match[4])]])} else {return null}}
function viewboxUnSlimmed(inputSvg) {const decodedParams = decodeUrlParams()
const sizeDataObj = decodedParams.sizeData
const originalViewboxString = sizeDataObj.viewbox
const patternForViewboxStr = /viewBox="([^"]+)"/
const matchesForViewboxStr = patternForViewboxStr.exec(inputSvg)
const matchForViewboxValueStr = matchesForViewboxStr[1]
return inputSvg.replace(matchForViewboxValueStr, originalViewboxString)}