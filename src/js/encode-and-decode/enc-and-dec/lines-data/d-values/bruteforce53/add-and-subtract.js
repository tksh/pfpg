import { getUintNFromUrlParams } from 'decode/get-uint-n'
import { tryDecompress }         from 'decode/try-decompress'
import { parseBasicData }        from 'enc-and-dec/basic-data/basic-data-enc'


export
    { addToEliminateNegativeBeforeEncode
    , subtractToRestoreOriginalAfterDecode
    , addNumBeforeEncode
    , subtractNumAfterDecode
    , getHalfOfBaseXRange
    }

// For base52 encoding for reference dict

// Shift the entire range of frequent diff values to the positive side,
// as Base52 encoding cannot handle negative numbers.

// Before encoding:
//   Add the minimum possible value to the encoding target values to eliminate negative numbers.

// After decoding:
//   Subtract the value added above to restore the original values.

/**
 * Adds the minimum possible value to the encoding target values to eliminate negative numbers before encoding.
 *
 * @param {number} num The target number to encode.
 * @returns {number} The adjusted value after adding the **minimum** possible value.
 */
function addToEliminateNegativeBeforeEncode(num) {
    return num + Math.abs(getMinimumPossibleDiffForEnc())
}

/**
 * Subtracts the added value to restore the original values after decoding.
 *
 * @param {number} num The decoded value.
 * @returns {number} The original value after subtracting the added value.
 */
function subtractToRestoreOriginalAfterDecode(num) {
    return num - Math.abs(getMinimumPossibleDiffForDec())
}



// Get the minimum possible diff value
function calculateMinimumPossibleDiffValueFromUintN(uintN) {
    // e.g. uintN = 8

    // (2 ** 8) - 1 = 255
    // Absolute d value: 0 to 255

    // Relative d value: -255 to 255
    const maximumRelativeDValue = (2 ** uintN) - 1           //  255
    const minimumRelativeDValue = 0 - maximumRelativeDValue  // -255

    // Diff value
    //const maximumDiffValue = maximumRelativeDValue - minimumRelativeDValue  //  255 - (-255) =  510
    const minimumDiffValue = minimumRelativeDValue - maximumRelativeDValue    // -255 -   255  = -510

    return minimumDiffValue
}
//console.log(calculateMinimumPossibleDiffValueFromUintN(5))  //  -62
//console.log(calculateMinimumPossibleDiffValueFromUintN(6))  // -126
//console.log(calculateMinimumPossibleDiffValueFromUintN(7))  // -254
//console.log(calculateMinimumPossibleDiffValueFromUintN(8))  // -510


// For encoding
function getMinimumPossibleDiffForEnc() {
    // `uintN` via textarea
    const uintN = tryDecompress(parseBasicData().bits)
    return calculateMinimumPossibleDiffValueFromUintN(uintN)
}
// For decoding
function getMinimumPossibleDiffForDec() {
    // `uintN` via url params
    const uintN = getUintNFromUrlParams()
    return calculateMinimumPossibleDiffValueFromUintN(uintN)
}



// Shift the diff values for baseX encoding and decoding
// Skip the [0-9] range since these 10 numbers are not needed for encoding
// This optimizes the encoding process by reducing unnecessary characters

// Get the half of the range that can be encoded in baseX with 2 digits
function getHalfOfBaseXRange(baseX) {
    return Math.trunc(baseX**2/2)
}
// test
//console.log(getHalfOfBaseXRange(0))   //    0
//console.log(getHalfOfBaseXRange(1))   //    0
//console.log(getHalfOfBaseXRange(2))   //    2
//console.log(getHalfOfBaseXRange(3))   //    4
//console.log(getHalfOfBaseXRange(4))   //    8
//console.log(getHalfOfBaseXRange(51))  // 1300
//console.log(getHalfOfBaseXRange(52))  // 1352



// Get the two numbers for add it before encoding and subtract it after decoding, as an array
function getNumToShift(baseX) {
    const halfOfBaseXRange = getHalfOfBaseXRange(baseX)

    const numberToAddOrSubForAfter9  = halfOfBaseXRange - 10
    const numberToAddOrSubForBefore0 = halfOfBaseXRange

    return { forBefore0: numberToAddOrSubForBefore0, forAfter9: numberToAddOrSubForAfter9 }
}


// Add to shift the values before baseX encoding
function addNumBeforeEncode(num, baseX) {
    const numForBefore0 = getNumToShift(baseX).forBefore0
    const numForAfter9  = getNumToShift(baseX).forAfter9
    const halfOfBaseXRange = getHalfOfBaseXRange(baseX)

    const startOfBaseXEncTargetBefore0 = 0 - halfOfBaseXRange
    const   endOfBaseXEncTargetBefore0 = -1
    const startOfBaseXEncTargetAfter9  = 10
    const   endOfBaseXEncTargetAfter9  = halfOfBaseXRange + 9

    if (startOfBaseXEncTargetBefore0 <= num && num <= endOfBaseXEncTargetBefore0) {
        return num + numForBefore0
    } else if (startOfBaseXEncTargetAfter9 <= num && num <= endOfBaseXEncTargetAfter9) {
        return num + numForAfter9
    }
}

// Subtract to shift the values after baseX decoding
function subtractNumAfterDecode(num, baseX) {
    const numForBefore0 = getNumToShift(baseX).forBefore0
    const numForAfter9  = getNumToShift(baseX).forAfter9

    const halfOfBaseXRange = getHalfOfBaseXRange(baseX)
    const startOfBaseXDecodedForBefore0 = numForBefore0 + (0 - halfOfBaseXRange)
    const   endOfBaseXDecodedForBefore0 = numForBefore0 + (-1)
    const startOfBaseXDecodedForAfter9  = numForAfter9  + 10
    const   endOfBaseXDecodedForAfter9  = numForAfter9  + halfOfBaseXRange + 9

    if (startOfBaseXDecodedForBefore0 <= num && num <= endOfBaseXDecodedForBefore0) {
        return num - numForBefore0
    } else if (startOfBaseXDecodedForAfter9 <= num && num <= endOfBaseXDecodedForAfter9) {
        return num - numForAfter9
    }
}
