import { getAlphabets52 } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'
export function base52Enc(num) {const alphabet = getAlphabets52()
let base = alphabet.length
let encoded = ''
if (num === 0) {return alphabet[0]}
while (num) {let remainder = num % base
num = Math.floor(num / base)
encoded = alphabet[remainder] + encoded}
return encoded}