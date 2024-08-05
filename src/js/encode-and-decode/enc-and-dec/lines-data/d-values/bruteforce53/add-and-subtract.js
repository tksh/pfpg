import { getUintNFromUrlParams } from 'enc-and-dec/lines-data/d-values/bruteforce53/uint-n-from-urlparam'
import { parseBasicData }        from 'enc-and-dec/basic-data/basic-data-enc'

export
    { addToEliminateNegativeBeforeEncode
    , subtractToRestoreOriginalAfterDecode
    , addNumBeforeEncode
    , subtractNumAfterDecode
    , getHalfOfBaseXRange
    }

// For base52 encoding for reference dict

// Shift the entire range of reference dictionary (frequent diff values) to the positive side,
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
    return num + Math.abs(getMinimumPossibleDiffForEnc());
}

/**
 * Subtracts the added value to restore the original values after decoding.
 *
 * @param {number} num The decoded value.
 * @returns {number} The original value after subtracting the added value.
 */
function subtractToRestoreOriginalAfterDecode(num) {
    return num - Math.abs(getMinimumPossibleDiffForDec());
}

// Get the minimum possible diff value
// When diff value has made from relative d value
function calculateMinimumPossibleDiffValueFromUintN(uintN) {
    // Relative d value
    const maximumRelativeDValue = (2 ** uintN) - 1           //  255 (if uintNPortray = 8)
    const minimumRelativeDValue = 0 - maximumRelativeDValue  // -255
    //const rangeOfRelativeDValue = maximumRelativeDValue + Math.abs(minimumRelativeDValue)  // 255 + 255 = 510
                                                                                             // 510 (-255 to 255)
    // Diff value
    //const maximumDiffValue = maximumRelativeDValue - minimumRelativeDValue  //  510: 255 - (-255) = 510
    const minimumDiffValue = minimumRelativeDValue - maximumRelativeDValue    // -510: -255 - 255 = -510
    //const rangeOfDiffValue = maximumDiffValue + Math.abs(minimumDiffValue)  // 1020: 510 + 510 = 1020

    return minimumDiffValue * 2
}


// For encode
function getMinimumPossibleDiffForEnc() {
    const uintN = parseBasicData().uintN   // Get uintN from *textarea* at data-manipulator
    return calculateMinimumPossibleDiffValueFromUintN(uintN)
}
// For decode
function getMinimumPossibleDiffForDec() {
    const uintN = getUintNFromUrlParams()  // Get uintN from *url params* at index.html, data-manipulator
    // or from *hidden sample text* at index.html when there is no url params.
    return calculateMinimumPossibleDiffValueFromUintN(uintN)
}





// For baseX encoding for diff

// Get the half of the range that can be encoded in baseX with 2 digits
function getHalfOfBaseXRange(baseX) {
    return Math.trunc(baseX**2/2)
}


// Get the two numbers for add it before encoding and subtract it after decoding, as an array
function getTwoNumbersToAddOrSub(baseX) {
    const halfOfBase64Range = getHalfOfBaseXRange(baseX)

    const numberToAddAndSubForAfter9  = halfOfBase64Range - 10
    const numberToAddAndSubForBefore0 = halfOfBase64Range

    return [numberToAddAndSubForBefore0, numberToAddAndSubForAfter9]
}


// Add (baseXNumber**2/2) or (baseXNumber**2/2 -10) for the values that will be baseX encoded
function addNumBeforeEncode(num, baseX) {
    const numForBefore0 = getTwoNumbersToAddOrSub(baseX)[0]
    const numForAfter9  = getTwoNumbersToAddOrSub(baseX)[1]
    //console.log('numForBefore0: ', numForBefore0)
    //console.log('numForAfter9: ', numForAfter9)

    const halfOfBase64Range = getHalfOfBaseXRange(baseX)
    //console.log('halfOfBase64Range: ', halfOfBase64Range)
    const startOfBaseXEncTargetBefore0 = 0 - halfOfBase64Range
    const   endOfBaseXEncTargetBefore0 = -1
    const startOfBaseXEncTargetAfter9  = 10
    const   endOfBaseXEncTargetAfter9  = halfOfBase64Range + 9

    if (startOfBaseXEncTargetBefore0 <= num && num <= endOfBaseXEncTargetBefore0) {
        return num + numForBefore0
    } else if (startOfBaseXEncTargetAfter9 <= num && num <= endOfBaseXEncTargetAfter9) {
        return num + numForAfter9
    }
}

// Subtract (baseXNumber**2/2) or (baseXNumber**2/2 -10) for the values that after baseX decoded
function subtractNumAfterDecode(num, baseX) {
    const numForBefore0 = getTwoNumbersToAddOrSub(baseX)[0]
    const numForAfter9  = getTwoNumbersToAddOrSub(baseX)[1]

    const halfOfBase64Range = getHalfOfBaseXRange(baseX)
    const startOfBaseXDecodedForBefore0 = numForBefore0 + (0 - halfOfBase64Range)
    const   endOfBaseXDecodedForBefore0 = numForBefore0 + (-1)
    const startOfBaseXDecodedForAfter9  = numForAfter9  + 10
    const   endOfBaseXDecodedForAfter9  = numForAfter9  + halfOfBase64Range + 9

    if (startOfBaseXDecodedForBefore0 <= num && num <= endOfBaseXDecodedForBefore0) {
        return num - numForBefore0
    } else if (startOfBaseXDecodedForAfter9 <= num && num <= endOfBaseXDecodedForAfter9) {
        return num - numForAfter9
    }
}
