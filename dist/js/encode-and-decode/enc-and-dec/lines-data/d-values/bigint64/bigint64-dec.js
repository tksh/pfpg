import { getUintNFromUrlParams } from 'decode/get-uint-n'
import { base64UrlDec } from 'enc-and-dec/base-n/base-64url-dec'
import { getDigitsPerChunk } from 'enc-and-dec/lines-data/d-values/bigint64/digits-per-chunk'
import { recoverOriginalZeroPadding } from 'enc-and-dec/lines-data/d-values/bigint64/recover-zero-padding'
import { chunk } from 'libs/deno-std/chunk'
export
{ bigint64Dec, chunk, findNearestMultipleOfFourX}
function bigint64Dec(encodedDvalsStr) {const decodedDvalsBigint = base64UrlDec(encodedDvalsStr)
const bigintAsStr = String(decodedDvalsBigint)
const digitsPerChunk = getDigitsPerChunk(getUintNFromUrlParams())
const originalZeroPaddedStr = recoverOriginalZeroPadding(bigintAsStr, digitsPerChunk)
const splittedDvalsStr = splitStringIntoFour(originalZeroPaddedStr)
const chunkedDvalsStr = splittedDvalsStr.map(str => chunk(str, digitsPerChunk))
const decodedAbsDvals = chunkedDvalsStr.map(subArray => subArray.map(Number))
return decodedAbsDvals}
function findNearestMultipleOfFourX(number, multiple) {return Math.ceil(number / (multiple * 4)) * (multiple * 4)}
function splitStringIntoFour(str) {const len = str.length
const part = len / 4
const x1 = str.substring(0, part)
const y1 = str.substring(part, part * 2)
const x2 = str.substring(part * 2, part * 3)
const y2 = str.substring(part * 3, part * 4)
return [x1, y1, x2, y2]}