import { getBase64UrlCharacters } from 'enc-and-dec/base-n/get-chars'
export function base64UrlEnc(num) {const alphabet = getBase64UrlCharacters()
let base = BigInt(alphabet.length)
let encoded = ''
if (num === 0n) {return alphabet[0]}
while (num) {let remainder = num % base
num = num / base
encoded = alphabet[Number(remainder)] + encoded}
return encoded}