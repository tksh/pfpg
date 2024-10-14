import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg } from 'decode/decode'
import { replaceAtIndex } from 'utils/replace-at-index'
export
{ decodeAsSelectedPathMode, recoverCurrentOptionValue, recoverCurrentGroupColorsValues}
function decodeAsSelectedPathMode(pathMode) {if (pathMode === 'relativeMerged') {const isRelative = true
return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())} else {const isRelative = false
return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())}}
function recoverCurrentOptionValue(svgString, regexPattern, valueString) {return svgString.replace(regexPattern, valueString)}
function recoverCurrentGroupColorsValues(svgString, regexPattern, regexMatches) {let recoveredSvgString = svgString
for (let gId = 0; gId < regexMatches.length; gId++) {const colorsValues = regexMatches[gId]
recoveredSvgString = replaceAtIndex(recoveredSvgString, regexPattern, colorsValues, gId)}
return recoveredSvgString}