export {
    // getActualCodebookSizeForEnc,
    getActualCodebookSizeForDec
}


export function getActualCodebookSize(maxCodebookSize, freqDiffArr) {  // Second argument is Array
    let actualCodebookSize

    if (freqDiffArr.length >= maxCodebookSize) {
        actualCodebookSize = maxCodebookSize
    } else {
        actualCodebookSize = freqDiffArr.length
    }
    return actualCodebookSize
}

// If there is no freq values([]), always return the '0'
// console.log(getActualCodebookSize(0, []))  // 0
// console.log(getActualCodebookSize(52, [])) // 0



function getActualCodebookSizeForDec(maxCodebookSize, freqDiffStr) {  // Second argument is String
    let actualCodebookSize

    // Encoded freqDiff are always padded to 2 chars.
    // So, the number of freqDiff elements is the number of chars (.length) divided by 2
    const numberOfFreqDiff= freqDiffStr.length / 2

    if (freqDiffStr.length >= maxCodebookSize) {
        actualCodebookSize = maxCodebookSize
    } else {
        actualCodebookSize = freqDiffStr.length
    }
    return actualCodebookSize
}