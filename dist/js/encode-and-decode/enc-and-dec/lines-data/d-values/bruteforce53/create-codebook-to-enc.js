import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'
export function createCodebookToEnc(freqDiffArrActualCodebookSized) {const alphabetsActualCodebookSized = getAlphabetsForCodebook(freqDiffArrActualCodebookSized.length)
const codebookToEncodeFreqDiff = new Map()
for (let i = 0; i < freqDiffArrActualCodebookSized.length; i++) {codebookToEncodeFreqDiff.set(freqDiffArrActualCodebookSized[i], alphabetsActualCodebookSized[i])}
return codebookToEncodeFreqDiff}