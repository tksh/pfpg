import { tryDecompress } from 'decode/try-decompress'
import { getFour16CharsSets } from 'enc-and-dec/base-n/get-chars'
import { parseBasicData } from 'enc-and-dec/basic-data/basic-data-enc'
import { encodeCoordsWithFourBase16 } from 'enc-and-dec/lines-data/d-values/four16/encode-with-four-base16'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { jsonToMapObj } from 'encode/json-to-map-obj'
import { showResult } from 'encode/show-result'
import { convertResultsFromStrToArray } from 'encode/transform-encoded-result'
import { tryCompress } from 'encode/try-compress'
export async function four16Enc() {const startTime = performance.now()
const encodingMethodName = 'four16'
const configValue = undefined
const uintN = tryDecompress(parseBasicData().n)
const charsSets = getFour16CharsSets()
const encodedDvals = new Map()
if (uintN <= 7) {const aggDataByGroups = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)
const diffValues = aggDataByGroups.entries()
diffValues.forEach(([gId, values]) => {const coords = values.d.relative.diff_by_row
const encodedCoords = encodeCoordsWithFourBase16(coords, charsSets)
encodedDvals.set(Number(gId), encodedCoords)})} else if (uintN === 8) {const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
const relValues = linesDataMap.entries()
relValues.forEach(([gId, values]) => {const coords = values.d.relative
const encodedCoords = encodeCoordsWithFourBase16(coords, charsSets)
encodedDvals.set(Number(gId), encodedCoords)})} else {const errorMessage = `Error encoding via four16-enc, it must be up to UInt8Portray(255 x 255) rule-set`
console.error(errorMessage)}
const { compressedByGroups, _ } = await tryCompress(encodedDvals,encodingMethodName, configValue)
const wholeGroupJoined = joinWithAmpersand(compressedByGroups)
const encodedArrByGroups = convertResultsFromStrToArray(compressedByGroups, encodingMethodName, configValue)
showResult(encodingMethodName,startTime,wholeGroupJoined, encodedArrByGroups)
return encodedArrByGroups}