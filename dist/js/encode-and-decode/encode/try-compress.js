import { compressToEncodedURIComponent } from 'common-utils/compression-stream'
import { flagsMap, resultInfo, encodingMethodAndConfig} from 'constants'
import { getEncodedAttrsExceptsDvals } from 'encode/get-attrs-excepts-dvals'
import { URLCompressor } from 'libs/url-comp-0-1-0/url-comp'
export async function tryCompress(encodedDval, encodingMethodName, encodingConfigValue) {const encodedWidthsAndCounts = getEncodedAttrsExceptsDvals().widthsAndCounts
const encodedGroupColors = getEncodedAttrsExceptsDvals().groupColors
const compressedByGroups = new Map()
let flagsArr = []
let lengthBeforeComp = []
let lengthAfterComp = []
const groupCount = encodedDval.size
const ampersandCount = groupCount - 1
let compressingResultArr = []
for (const [gId, dvalEncodedStr] of encodedDval) {const charOf2ndFlag = flagsMap.get('2nd').get(encodingMethodName)
const widthsAndCountsEncoded = encodedWidthsAndCounts.get(gId)
const uncompressed = charOf2ndFlag + widthsAndCountsEncoded + '-' + dvalEncodedStr
const { bestCompressedData, bestCompMethodName } = await compressAndSelectBest(uncompressed)
const charOf1stFlag = flagsMap.get('1st').get(bestCompMethodName)
const encodedWidthAndDvalsAsValue = charOf1stFlag + bestCompressedData
const encodedAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue)
compressedByGroups.set(gId, encodedAsKvPair)
flagsArr.push([charOf1stFlag, charOf2ndFlag])
lengthBeforeComp.push(uncompressed.length + 1)
lengthAfterComp.push(bestCompressedData.length + 1)
compressingResultArr.push([gId, uncompressed.length + 1, bestCompressedData.length + 1, bestCompMethodName])
const previousBaseXData = resultInfo.get(`${encodingMethodName} gId=${gId}`)
?? [['gId', `${encodingMethodAndConfig.get(encodingMethodName)}`, 'uncompressed', 'bestCompressed', 'bestCompMethodName']]
const currentBaseXDataAdded = [...previousBaseXData, [gId, encodingConfigValue, uncompressed.length + 1, bestCompressedData.length + 1, bestCompMethodName]]
resultInfo.set(`${encodingMethodName} gId=${gId}`, currentBaseXDataAdded)}
calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount)
resultInfo.set(`${encodingMethodName} Flags`, flagsArr)
return { compressedByGroups, compressingResultArr }}
async function compressAndSelectBest(inputString) {const compressionMethods = {'uncompressed' : async () => inputString,'URLCompressor': async () => URLCompressor.compress(inputString),'deflateRaw' : async () => compressToEncodedURIComponent(inputString, 'deflate-raw')}
const results = await Promise.all(Object.entries(compressionMethods).map(async ([method, compressFunc]) => {const compressedData = await compressFunc()
return { method, compressedData, length: compressedData.length }}))
let bestResult = results[0]
for (const result of results) {if (result.length < bestResult.length) {bestResult = result}}
return {bestCompressedData: bestResult.compressedData,bestCompMethodName: bestResult.method}}
function addColorAsKey(encodedColors, gId, shorterStrWithPrefix) {return `${encodedColors.get(gId)}=${shorterStrWithPrefix}`}
function calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount) {const totalLengthBefore = lengthBeforeComp.reduce((a, b) => a + b, ampersandCount)
const totalLengthAfter = lengthAfterComp.reduce((a, b) => a + b, ampersandCount)}