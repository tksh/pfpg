export function getActualCodebookSize(maxCodebookSize, freqDiffArr) {let actualCodebookSize
if (freqDiffArr.length >= maxCodebookSize) {actualCodebookSize = maxCodebookSize} else {actualCodebookSize = freqDiffArr.length}
return actualCodebookSize}