function getActualDictSize(maxDictSize, freqDiffValueArr) {
    let actualDictSize
    if (freqDiffValueArr.length >= maxDictSize) {
        actualDictSize = maxDictSize
    } else {
        actualDictSize = freqDiffValueArr.length
    }
    return actualDictSize
}