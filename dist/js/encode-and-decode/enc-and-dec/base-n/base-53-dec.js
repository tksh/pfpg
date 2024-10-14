import { getBase53Characters } from 'enc-and-dec/base-n/get-chars'
export function base53Dec(str) {const alphabet = getBase53Characters()
let base = alphabet.length
let decoded = 0
for (let i = 0; i < str.length; i++) {let index = alphabet.indexOf(str[i])
decoded += index * Math.pow(base, str.length - i - 1)}
return decoded}