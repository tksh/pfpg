import { base52Enc } from 'enc-and-dec/base-n/base-52-enc'
import { addToEliminateNegativeBeforeEncode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
export function encodeFreqDiff(freqDiffArrActualCodebookSized) {const freqDiff = freqDiffArrActualCodebookSized.map((value) => base52EncodeForFreqDiff(value))
return freqDiff.join('')}
function base52EncodeForFreqDiff(num) {const encoded = base52Enc(addToEliminateNegativeBeforeEncode(num))
if (encoded.length > 2) {const numberOfUnderscores = encoded.length - 2
return '_'.repeat(numberOfUnderscores) + encoded}
return encoded.padStart(2, 'a')}