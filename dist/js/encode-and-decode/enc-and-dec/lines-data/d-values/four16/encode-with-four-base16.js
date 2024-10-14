export function encodeCoordsWithFourBase16(coords, charsSets) {let encodedCoordsStr = ''
Object.values(coords).map((numArr) => {const encodedArr = numArr.map((num) => {let result
result = handlePositiveToBeSingleDigit(num, charsSets.p1)
if (result !== undefined) return result
result = handleNegativeToBeSingleDigit(num, charsSets.n1)
if (result !== undefined) return result
result = handlePositiveToBeDoubleDigits(num, charsSets.p2)
if (result !== undefined) return result
result = handleNegativeToBeDoubleDigits(num, charsSets.n2)
if (result !== undefined) return result})
encodedCoordsStr += encodedArr.join('')})
return encodedCoordsStr}
export function customBase16Enc(num, charsSet) {let base = 16
let encoded = ''
if (num === 0) {return charsSet[0]}
while (num) {let remainder = num % base
num = Math.floor(num / base)
encoded = charsSet[remainder] + encoded}
return encoded}
function handlePositiveToBeSingleDigit(num, charsSet) {if (num >= 0 && num <= 15) {return customBase16Enc(num, charsSet)}}
function handleNegativeToBeSingleDigit(num, charsSet) {if (num >= -15 && num <= -1) {return customBase16Enc(Math.abs(num), charsSet)}}
function handlePositiveToBeDoubleDigits(num, charsSet) {if (num >= 16 && num <= 255) {return customBase16Enc(num, charsSet)}}
function handleNegativeToBeDoubleDigits(num, charsSet) {if (num >= -255 && num <= -16) {return customBase16Enc(Math.abs(num), charsSet)}}