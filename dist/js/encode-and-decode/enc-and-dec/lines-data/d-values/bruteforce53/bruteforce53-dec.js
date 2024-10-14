import { base53Dec } from 'enc-and-dec/base-n/base-53-dec'
import { getActualCodebookSize } from 'enc-and-dec/lines-data/d-values/bruteforce53/actual-codebook-size'
import { createCodebookToDec } from 'enc-and-dec/lines-data/d-values/bruteforce53/create-codebook-to-dec'
import { decodeDiff } from 'enc-and-dec/lines-data/d-values/bruteforce53/decode-diff'
import { decodeFreqDiff } from 'enc-and-dec/lines-data/d-values/bruteforce53/decode-freq-diff'
export function bruteforce53Dec(encodedDvalsStr) {const baseX = base53Dec(encodedDvalsStr[0])
const maxCodebookSize = 52 - baseX
const freqDiffAndDiff = encodedDvalsStr.slice(1).split('-')
const { freqDiffByCoords, diffByCoords } = freqDiffAndDiff.reduce((acc, val, index) => {if (index % 2 === 0) {acc.freqDiffByCoords.push(val)} else {acc.diffByCoords.push(val)}
return acc}, { freqDiffByCoords: [], diffByCoords: [] })
let decodedDiffCoords = []
for (let i = 0; i < 4; i++) {const freqDiffEncodedStr = freqDiffByCoords[i]
const freqDiffDecodedArr = decodeFreqDiff(freqDiffEncodedStr)
const actualCodebookSize = getActualCodebookSize(maxCodebookSize, freqDiffDecodedArr)
const codebook = createCodebookToDec(freqDiffDecodedArr, actualCodebookSize)
const decodedDiffArr = decodeDiff(diffByCoords[i],codebook,baseX,)
decodedDiffCoords.push(decodedDiffArr)}
return decodedDiffCoords}