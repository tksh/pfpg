import { hexExpandToTen } from 'color-formatter/hex-expand'
import { BASIC_DATA_KEYS, SETTINGS_DEFAULTS } from 'constants'
import { decodeDvals } from 'decode/decode'
import { sizeDataDec } from 'decode/size-data-dec'
import { tryDecompress } from 'decode/try-decompress'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'
import { decodeGroupColors } from 'enc-and-dec/lines-data/group-colors/group-colors-dec'
import { decodeWidthsAndCounts } from 'enc-and-dec/lines-data/widths-and-counts/widths-and-counts-dec'
export
{ decodeUrlParams, getUrlParamsExceptsStates}
function decodeUrlParams() {const urlParams = getUrlParamsExceptsStates()
const urlParamsExists = urlParams.toString() !== ''
if (urlParamsExists) {return decodeAsThreeData(urlParams)} else {}}
function getUrlParamsExceptsStates() {const urlParams = new URLSearchParams(window.location.search)
const stateKeys = Array.from(SETTINGS_DEFAULTS.keys())
const filteredParams = new Map([...urlParams.entries()].filter(([key]) => !stateKeys.includes(key)))
return filteredParams}
function decodeAsThreeData(urlSearchParams) {const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
const linesDataKvArray = []
for (const [key, value] of urlSearchParams.entries()) {if (!BASIC_DATA_KEYS.includes(key)) {linesDataKvArray.push([key, value])}}
const linesDataMap = new Map()
for (let i = 0; i < linesDataKvArray.length; ++i) {const hex10Chars = hexExpandToTen(linesDataKvArray[i][0])
const decodedGroupColorsObj = decodeGroupColors(hex10Chars)
const linesData = tryDecompress(linesDataKvArray[i][1])
const decodedEncodingMethodFlagChar = linesData[0]
const encodedWidthsAndCounts = extractBeforeFirstHyphen(linesData.slice(1))
const decodedWidthsAndCountsMap = decodeWidthsAndCounts(encodedWidthsAndCounts)
const encodedDvalsStr = extractAfterFirstHyphen(linesData)
linesDataMap.set(i,{groupColors: decodedGroupColorsObj,encodingMethodFlag: decodedEncodingMethodFlagChar,widthsAndCounts: decodedWidthsAndCountsMap,encodedDvals: encodedDvalsStr})
const decodedAbsAndRelDvals = decodeDvals(linesDataMap)
const decodedRelDvalsObj = decodedAbsAndRelDvals.relative
const decodedAbsDvalsObj = decodedAbsAndRelDvals.absolute
linesDataMap.set(i,{groupColors: decodedGroupColorsObj,encodingMethodFlag: decodedEncodingMethodFlagChar,widthsAndCounts: decodedWidthsAndCountsMap,encodedDvals: encodedDvalsStr,relDvalsObj: decodedRelDvalsObj,absDvalsObj: decodedAbsDvalsObj})}
const sizeDataObj = sizeDataDec(linesDataMap.get(0))
return { basicData: basicDataObj, linesData: linesDataMap, sizeData: sizeDataObj }}
function extractBeforeFirstHyphen(str) {const indexOfHyphen = str.indexOf("-")
return str.slice(0, indexOfHyphen)}
function extractAfterFirstHyphen(str) {const indexOfHyphen = str.indexOf("-")
return str.slice(indexOfHyphen + 1)}