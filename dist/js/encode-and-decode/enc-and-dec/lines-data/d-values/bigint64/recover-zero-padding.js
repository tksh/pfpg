import { findNearestMultipleOfFourX } from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'
export function recoverOriginalZeroPadding(bigintAsStr, digitsPerChunk) {const originalPaddedLength = findNearestMultipleOfFourX(bigintAsStr.length, digitsPerChunk)
if (bigintAsStr.length === originalPaddedLength) {return bigintAsStr} else {return bigintAsStr.padStart(originalPaddedLength, '0')}}