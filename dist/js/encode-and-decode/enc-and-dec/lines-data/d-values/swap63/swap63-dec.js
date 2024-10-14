import { createCodebook, get63Numbers, get63Characters} from 'enc-and-dec/lines-data/d-values/swap63/create-codebook'
export function swap63Dec(encodedDvalsStr) {const codebookForDecoding = createCodebook(get63Characters(), get63Numbers())
const dividedDvals = divideStringEqually(encodedDvalsStr, 4)
const decodedRelDvals = dividedDvals.map(dval => swapFromCharacterToNumber(dval, codebookForDecoding))
return decodedRelDvals}
function divideStringEqually(str, numberOfParts) {const totalLength = str.length
const lengthPerPart = Math.ceil(totalLength / numberOfParts)
const result = []
for (let i = 0; i < totalLength; i += lengthPerPart) {result.push(str.slice(i, i + lengthPerPart))}
return result}
function swapFromCharacterToNumber(encodedDval, codebookForDecoding) {let decodedDval = []
for (const char of encodedDval) {const decodedChar = codebookForDecoding.get(char)
decodedDval.push(decodedChar)}
return decodedDval}