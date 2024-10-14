import { base52Dec } from 'enc-and-dec/base-n/base-52-dec'
import { baseXDec } from 'enc-and-dec/lines-data/d-values/bruteforce53/base-x-dec'
export function decodeDiff(diffStr, codebook, baseX) {let decodedDiffArr = []
let i = 0
while (i < diffStr.length) {if (isInFreqDiff(diffStr[i], codebook)) {decodedDiffArr.push(codebook.get(diffStr[i]))
i++} else if (isNumber(diffStr[i])) {decodedDiffArr.push(parseInt(diffStr[i], 10))
i++} else if (diffStr[i] === '_') {let underscoreCount = 0
while (diffStr[i] === '_' && i < diffStr.length) {underscoreCount++
i++}
let decodedValue
let encodedChunk
let encodedLength
if (underscoreCount % 2 === 1) {encodedLength = Math.floor(underscoreCount / 2) + 2
encodedChunk = diffStr.slice(i, i + encodedLength)
decodedValue = base52Dec(encodedChunk)} else {encodedLength = (underscoreCount / 2) + 1
encodedChunk = diffStr.slice(i, i + encodedLength)
decodedValue = -base52Dec(encodedChunk)}
decodedDiffArr.push(decodedValue)
i += encodedLength} else {const toBaseXDecode = diffStr.slice(i, i + 2)
decodedDiffArr.push(baseXDec(toBaseXDecode, baseX))
i += 2}}
return decodedDiffArr}
function isInFreqDiff(char, codebook) {const freqDiffStr = [...codebook.keys()].join('')
const bool = freqDiffStr.indexOf(char) !== -1
return bool}
function isNumber(char) {return /^[0-9]+$/g.test(char)}