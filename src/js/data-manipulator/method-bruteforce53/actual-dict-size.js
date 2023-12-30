function getActualDictSize(maxDictSize, freqDiffValueArr) {
    let actualDictSize
    if (freqDiffValueArr.length >= maxDictSize) {
        actualDictSize = maxDictSize
    } else {
        actualDictSize = freqDiffValueArr.length
    }
    return actualDictSize
}

// If there is no freq values([]), always return the '0'
// console.log(getActualDictSize(0, []))  // 0
// console.log(getActualDictSize(52, [])) // 0