import { addNumBeforeEncode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { getAlphabetsForBaseX } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'
export function baseXEnc(numOriginal, baseX) {let numWithoutMinus = addNumBeforeEncode(numOriginal, baseX)
const alphabet = getAlphabetsForBaseX(baseX)
let base = alphabet.length
let encoded = ''
if (numWithoutMinus === 0) {return alphabet[0] + alphabet[0]}
while (numWithoutMinus) {let remainder = numWithoutMinus % base
numWithoutMinus = Math.floor(numWithoutMinus / base)
encoded = alphabet[remainder] + encoded}
if (encoded.length === 1) {encoded = encoded.padStart(2, 'a')}
return encoded}