import { getUintNFromUrlParams } from 'decode/get-uint-n'
import { tryDecompress } from 'decode/try-decompress'
import { parseBasicData } from 'enc-and-dec/basic-data/basic-data-enc'
export
{ addToEliminateNegativeBeforeEncode, subtractToRestoreOriginalAfterDecode, addNumBeforeEncode, subtractNumAfterDecode, getHalfOfBaseXRange}
function addToEliminateNegativeBeforeEncode(num) {return num + Math.abs(getMinimumPossibleDiffForEnc())}
function subtractToRestoreOriginalAfterDecode(num) {return num - Math.abs(getMinimumPossibleDiffForDec())}
function calculateMinimumPossibleDiffValueFromUintN(uintN) {const maximumRelativeDValue = (2 ** uintN) - 1
const minimumRelativeDValue = 0 - maximumRelativeDValue
const minimumDiffValue = minimumRelativeDValue - maximumRelativeDValue
return minimumDiffValue}
function getMinimumPossibleDiffForEnc() {const uintN = tryDecompress(parseBasicData().n)
return calculateMinimumPossibleDiffValueFromUintN(uintN)}
function getMinimumPossibleDiffForDec() {const uintN = getUintNFromUrlParams()
return calculateMinimumPossibleDiffValueFromUintN(uintN)}
function getHalfOfBaseXRange(baseX) {return Math.trunc(baseX**2/2)}
function getNumToShift(baseX) {const halfOfBaseXRange = getHalfOfBaseXRange(baseX)
const numberToAddOrSubForAfter9 = halfOfBaseXRange - 10
const numberToAddOrSubForBefore0 = halfOfBaseXRange
return { forBefore0: numberToAddOrSubForBefore0, forAfter9: numberToAddOrSubForAfter9 }}
function addNumBeforeEncode(num, baseX) {const numForBefore0 = getNumToShift(baseX).forBefore0
const numForAfter9 = getNumToShift(baseX).forAfter9
const halfOfBaseXRange = getHalfOfBaseXRange(baseX)
const startOfBaseXEncTargetBefore0 = 0 - halfOfBaseXRange
const endOfBaseXEncTargetBefore0 = -1
const startOfBaseXEncTargetAfter9 = 10
const endOfBaseXEncTargetAfter9 = halfOfBaseXRange + 9
if (startOfBaseXEncTargetBefore0 <= num && num <= endOfBaseXEncTargetBefore0) {return num + numForBefore0} else if (startOfBaseXEncTargetAfter9 <= num && num <= endOfBaseXEncTargetAfter9) {return num + numForAfter9}}
function subtractNumAfterDecode(num, baseX) {const numForBefore0 = getNumToShift(baseX).forBefore0
const numForAfter9 = getNumToShift(baseX).forAfter9
const halfOfBaseXRange = getHalfOfBaseXRange(baseX)
const startOfBaseXDecodedForBefore0 = numForBefore0 + (0 - halfOfBaseXRange)
const endOfBaseXDecodedForBefore0 = numForBefore0 + (-1)
const startOfBaseXDecodedForAfter9 = numForAfter9 + 10
const endOfBaseXDecodedForAfter9 = numForAfter9 + halfOfBaseXRange + 9
if (startOfBaseXDecodedForBefore0 <= num && num <= endOfBaseXDecodedForBefore0) {return num - numForBefore0} else if (startOfBaseXDecodedForAfter9 <= num && num <= endOfBaseXDecodedForAfter9) {return num - numForAfter9}}