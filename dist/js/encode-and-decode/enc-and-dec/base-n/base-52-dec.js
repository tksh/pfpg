import { subtractToRestoreOriginalAfterDecode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { getAlphabets52 } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'
export
{ base52Dec, base52DecodeForFreqDiff}
function base52Dec(str) {const alphabet = getAlphabets52()
let base = alphabet.length
let decoded = 0
for (let i = 0; i < str.length; i++) {let index = alphabet.indexOf(str[i])
decoded += index * Math.pow(base, str.length - i - 1)}
return decoded}
function base52DecodeForFreqDiff(chunk) {const rawDecoded = base52Dec(chunk)
const decoded = subtractToRestoreOriginalAfterDecode(rawDecoded)
return decoded}