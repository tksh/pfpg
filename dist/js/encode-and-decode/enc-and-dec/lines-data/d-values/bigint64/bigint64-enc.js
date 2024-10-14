import { tryDecompress } from 'decode/try-decompress'
import { base64UrlEnc } from 'enc-and-dec/base-n/base-64url-enc'
import { parseBasicData } from 'enc-and-dec/basic-data/basic-data-enc'
import { getDigitsPerChunk } from 'enc-and-dec/lines-data/d-values/bigint64/digits-per-chunk'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { jsonToMapObj } from 'encode/json-to-map-obj'
import { showResult } from 'encode/show-result'
import { convertResultsFromStrToArray } from 'encode/transform-encoded-result'
import { tryCompress } from 'encode/try-compress'
export async function bigint64Enc() {const startTime = performance.now()
const encodingMethodName = 'bigint64'
const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
const digitsPerChunk = getDigitsPerChunk(Number(tryDecompress(parseBasicData().n)))
const encodedDvals = base64UrlEncAfterJoinAsBigint(linesDataMap, digitsPerChunk)
const { compressedByGroups, _ } = await tryCompress(encodedDvals, encodingMethodName, digitsPerChunk)
const wholeGroupJoined = joinWithAmpersand(compressedByGroups)
const encodedArrByGroups = convertResultsFromStrToArray(compressedByGroups, encodingMethodName, digitsPerChunk)
showResult(encodingMethodName,startTime,wholeGroupJoined, encodedArrByGroups)
return encodedArrByGroups}
function padZero(number, targetLength) {return String(number).padStart(targetLength, '0')}
function base64UrlEncAfterJoinAsBigint(linesDataMap, digitsPerChunk) {const encodedDvals = new Map()
for (const linesData of linesDataMap.values()) {const absDvals = linesData.d.absolute
let joinedDvalsStr = ""
for (const key in absDvals) {const dval = absDvals[key]
const paddedDval = dval.map(number => padZero(number, digitsPerChunk))
const joinedDval = paddedDval.join('')
joinedDvalsStr = joinedDvalsStr + joinedDval}
const joinedDvalsBigInt = BigInt(joinedDvalsStr)
const base64EncodedDvalsStr = base64UrlEnc(joinedDvalsBigInt)
encodedDvals.set(linesData.g_id, base64EncodedDvalsStr)}
return encodedDvals}