import { base52Enc } from 'enc-and-dec/base-n/base-52-enc'
import { getHalfOfBaseXRange } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { baseXEnc } from 'enc-and-dec/lines-data/d-values/bruteforce53/base-x-enc'
export
{ handleSingleDigit, handleFrequencyDiff, calculateLimitsForBaseXSkipRange, handleBase52EncodingWithPrefix, handleBaseXEncoding}
function handleSingleDigit(diff) {if (diff >= 0 && diff <= 9) {return diff}}
function handleFrequencyDiff(diff, codebookToEncodeFreqDiff) {if (codebookToEncodeFreqDiff.has(diff)) {return codebookToEncodeFreqDiff.get(diff)}}
function getNumberOfUnderscorePrefix(str, isPositive) {const lengthBasedValue = (str.length - 1) * 2
if (isPositive) {return lengthBasedValue - 1} else {return lengthBasedValue}}
function prependUnderscores(str, isPositive) {const numberOfUnderscores = getNumberOfUnderscorePrefix(str, isPositive)
const underscorePrefix = '_'.repeat(numberOfUnderscores)
return underscorePrefix + str}
function calculateLimitsForBaseXSkipRange(baseXNumber, diffValueRange) {const baseXTargetRangeStart = 0 - getHalfOfBaseXRange(baseXNumber)
const baseXTargetRangeEnd = getHalfOfBaseXRange(baseXNumber) + 9
const baseXSkipRangeLowerLimit = baseXTargetRangeStart - 1
const baseXSkipRangeUpperLimit = baseXTargetRangeEnd + 1
return {baseXSkipRangeLowerLimit,baseXSkipRangeUpperLimit}}
function handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits) {if (diff <= baseXRangeLimits.baseXSkipRangeLowerLimit || baseXRangeLimits.baseXSkipRangeUpperLimit <= diff) {const diffEncoded = base52Enc(Math.abs(diff)).padStart(2, 'a')
const diffEncodedWithUnderscorePrefix = prependUnderscores(diffEncoded, diff > 0)
return diffEncodedWithUnderscorePrefix}}
function handleBaseXEncoding(diff, baseXNumber) {const baseXEncoded = baseXEnc(diff, baseXNumber)
return baseXEncoded}