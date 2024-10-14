import { getBase64UrlCharacters } from 'enc-and-dec/base-n/get-chars'
export function base64UrlDec(str) {const alphabet = getBase64UrlCharacters()
let base = BigInt(alphabet.length)
let num = 0n
for (let i = 0; i < str.length; i++) {let index = alphabet.indexOf(str[i])
if (index === -1) {throw new Error('Invalid character')}
num = num * base + BigInt(index)}
return num}