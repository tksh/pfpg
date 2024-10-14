import { tryDecompress } from 'decode/try-decompress'
import { base53Enc } from 'enc-and-dec/base-n/base-53-enc'
import { parseBasicData } from 'enc-and-dec/basic-data/basic-data-enc'
import { getActualCodebookSize } from 'enc-and-dec/lines-data/d-values/bruteforce53/actual-codebook-size'
import { createCodebookToEnc } from 'enc-and-dec/lines-data/d-values/bruteforce53/create-codebook-to-enc'
import { calculateLimitsForBaseXSkipRange, handleBase52EncodingWithPrefix, handleBaseXEncoding, handleFrequencyDiff, handleSingleDigit} from 'enc-and-dec/lines-data/d-values/bruteforce53/encode-diff'
import { encodeFreqDiff } from 'enc-and-dec/lines-data/d-values/bruteforce53/encode-freq-diff'
import { storeShorter } from 'enc-and-dec/lines-data/d-values/bruteforce53/store-shorter'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { jsonToMapObj } from 'encode/json-to-map-obj'
import { showResult } from 'encode/show-result'
import { simplifyMap } from 'encode/simplify-map'
import { tryCompress } from 'encode/try-compress'
import { resultInfo } from 'constants'
const MAX_CODEBOOK_SIZE_START = 0
const MAX_CODEBOOK_SIZE_END = 52
const COORDINATES = ['x1', 'y1', 'x2', 'y2']
export async function bruteforce53Enc() {const startTime = performance.now()
const encodingMethodName = 'bruteforce53'
let currentShortestByGroups = new Map()
const uintN = tryDecompress(parseBasicData().n)
const diffValueRange = calculateDiffLimits(uintN)
for (let maxCodebookSize = MAX_CODEBOOK_SIZE_START; maxCodebookSize <= MAX_CODEBOOK_SIZE_END; maxCodebookSize++) {const baseXNumber = 52 - maxCodebookSize
const encodedDvals = processGroups(baseXNumber, diffValueRange)
const compressResult = await compressAndStore(encodedDvals, encodingMethodName, baseXNumber)
currentShortestByGroups = updateShortestByGroups(currentShortestByGroups, compressResult.compressedByGroups, baseXNumber, maxCodebookSize)}
mergeFlagsArr(resultInfo)
return finalizeResults(currentShortestByGroups, encodingMethodName, startTime)}
function processGroups(baseXNumber, diffValueRange) {const aggDataByGroups = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)
const baseXRangeLimits = calculateLimitsForBaseXSkipRange(baseXNumber, diffValueRange)
return new Map(Array.from(aggDataByGroups.values()).map(aggData => {const freqDiffAndDiffFourCoords = processCoordinates(aggData, baseXNumber, baseXRangeLimits)
const encodedDvalStr = encodeGroupData(freqDiffAndDiffFourCoords, baseXNumber)
return [aggData.g_id, encodedDvalStr]}))}
function processCoordinates(aggData, baseXNumber, baseXRangeLimits) {return COORDINATES.map(coord => {const diffArr = aggData.d.relative.diff_by_row[coord]
const freqDiffArr = aggData.d.relative.frequent_diff_values_sorted[coord]
const actualCodebookSize = getActualCodebookSize(baseXNumber, freqDiffArr)
const codebookToEncodeFreqDiff = createCodebookToEnc(freqDiffArr.slice(0, actualCodebookSize), actualCodebookSize)
const freqDiffEncoded = encodeFreqDiff(freqDiffArr.slice(0, actualCodebookSize))
const diffArrEncoded = encodeDiffArray(diffArr, codebookToEncodeFreqDiff, baseXNumber, baseXRangeLimits)
return `${freqDiffEncoded}-${diffArrEncoded.join('')}`})}
function encodeDiffArray(diffArr, codebook, baseXNumber, baseXRangeLimits) {return diffArr.map(diff =>
handleSingleDigit(diff) ??
handleFrequencyDiff(diff, codebook) ??
handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits) ??
handleBaseXEncoding(diff, baseXNumber))}
function encodeGroupData(freqDiffAndDiffFourCoords, baseXNumber) {const joined = freqDiffAndDiffFourCoords.join('-')
const baseXEncoded = base53Enc(baseXNumber)
return baseXEncoded + joined}
async function compressAndStore(encodedDvals, encodingMethodName, baseXNumber) {const { compressedByGroups, compressingResultArr } = await tryCompress(encodedDvals, encodingMethodName, baseXNumber)
return { compressedByGroups, compressingResultArr }}
function updateShortestByGroups(currentShortestByGroups, compressedByGroups, baseXNumber, maxCodebookSize) {const transformedMap = transformMap(compressedByGroups, baseXNumber)
return maxCodebookSize === MAX_CODEBOOK_SIZE_START
? transformedMap
: storeShorter(currentShortestByGroups, transformedMap, baseXNumber)}
function finalizeResults(currentShortestByGroups, encodingMethodName, startTime) {const shortestStrByGroups = simplifyMap(currentShortestByGroups)
const wholeGroupJoined = joinWithAmpersand(shortestStrByGroups)
showResult(encodingMethodName, startTime, wholeGroupJoined, currentShortestByGroups)
return currentShortestByGroups}
function transformMap(map, baseXNumber) {return new Map(Array.from(map.entries()).map(([key, value]) => [key, [value, 'encodingMethodName', { baseXNumber }]]))}
function calculateDiffLimits(uintN) {return {min: 0 - (2 ** uintN - 1) * 4,max: (2 ** uintN - 1) * 4}}
function mergeFlagsArr(resultInfo) {const flagsByGroupsArr = Array.from(resultInfo.entries())
.filter(([key]) => key.startsWith('bruteforce53FlagsOfGroupId'))
.map(([, value]) => value)
resultInfo.set('bruteforce53 Flags', flagsByGroupsArr)
resultInfo.forEach((_, key) => {if (key.startsWith('bruteforce53FlagsOfGroupId')) {resultInfo.delete(key)}})}