import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'
export function createCodebookToDec(freqDiffArr, actualCodebookSize) {const alphabets = getAlphabetsForCodebook(actualCodebookSize)
const codebook = new Map()
for (let i = 0; i < freqDiffArr.length; i++) {codebook.set(alphabets[i], freqDiffArr[i])}
return codebook}