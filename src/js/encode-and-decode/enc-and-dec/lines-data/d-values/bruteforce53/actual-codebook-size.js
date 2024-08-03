export function getActualCodebookSize(maxCodebookSize, freqDiffArr) {
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