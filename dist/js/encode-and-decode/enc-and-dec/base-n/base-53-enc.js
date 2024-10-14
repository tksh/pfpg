import { getBase53Characters } from 'enc-and-dec/base-n/get-chars'
export function base53Enc(num) {const alphabet = getBase53Characters()
let base = alphabet.length
let encoded = ''
if (num === 0) {return alphabet[0]}
while (num) {let remainder = num % base
num = Math.floor(num / base)
encoded = alphabet[remainder] + encoded}
return encoded}