// To encode the number of freq dict values

function base52EncodeForFreqDictValue(num) {
    const encoded = base52Encode(addNumBeforeEncodeForBase52ForFreqDictValue(num));

    // base52エンコードした結果が3文字の場合、先頭にアンダースコアを追加
    if (encoded.length === 3) {
        return '_' + encoded;
    }

    // それ以外の場合、結果の文字列を二文字に揃える
    return encoded.padStart(2, 'a');
}


// Add and subtract functions for base52 to encode the freq dict diff values

// For encoding
function addNumBeforeEncodeForBase52ForFreqDictValue(num) {
    return num + getMostSmallDiffNumberAsAbsForEnc()
}
// For decoding
function subtractNumAfterDecodeForBase52ForFreqDictValue(num) {
    return num - getMostSmallDiffNumberAsAbsForDec()
}


function getMostSmallDiffNumberAsAbsForEnc() {
    const uintXPortray = getUintNPortrayForEnc()    // Get uintX from "textarea"
    const  startOfRelvalue = -(2**uintXPortray) + 1 // if uintXPortray = 8 =>  -255
    const startOfRelRange  = -(startOfRelvalue*2)   // if uintXPortray = 8 =>  -510
    const startOfDiffRange = -(startOfRelRange*2)   // if uintXPortray = 8 => -1020

    // This number should be add or subtract to freq dict diff values to reduce the minus numbers
    return Math.abs(startOfDiffRange)               // if uintXPortray = 8 =>  1020
}


function getMostSmallDiffNumberAsAbsForDec() {
    const uintXPortray = getUintNPortrayForDec()    // Get uintX from "url params"
    const  startOfRelvalue = -(2**uintXPortray) + 1 // if uintXPortray = 8 =>  -255
    const startOfRelRange  = -(startOfRelvalue*2)   // if uintXPortray = 8 =>  -510
    const startOfDiffRange = -(startOfRelRange*2)   // if uintXPortray = 8 => -1020

    // This number should be add or subtract to freq dict diff values to reduce the minus numbers
    return Math.abs(startOfDiffRange)               // if uintXPortray = 8 =>  1020
}




// For baseX encoding for diff

// Get the half of the range that can be encoded in baseX with 2 digits
function getHalfOfBaseXRange(baseX) {
    return Math.trunc(baseX**2/2)
}


// Get the two numbers for add it before encoding and subtract it after decoding, as an array
function getTwoNumbersToAddOrSub(baseX) {
    const halfOfBase64Range = getHalfOfBaseXRange(baseX)

    numberToAddAndSubForBefore0 = halfOfBase64Range
    numberToAddAndSubForAfter9  = halfOfBase64Range - 10

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
