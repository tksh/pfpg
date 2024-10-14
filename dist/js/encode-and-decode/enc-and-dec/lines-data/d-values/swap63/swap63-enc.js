import { outputToTextarea } from 'common-utils/output-to-textarea'
import { createCodebook, get63Characters, get63Numbers} from 'enc-and-dec/lines-data/d-values/swap63/create-codebook'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { jsonToMapObj } from 'encode/json-to-map-obj'
import { showResult } from 'encode/show-result'
import { convertResultsFromStrToArray } from 'encode/transform-encoded-result'
import { tryCompress } from 'encode/try-compress'
export async function swap63Enc() {const startTime = performance.now()
const encodingMethodName = 'swap63'
const configValue = undefined
const codebookForEncoding = createCodebook(get63Numbers(), get63Characters())
const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
const encodedDval = swapToEncode(codebookForEncoding, linesDataMap)
const { compressedByGroups, _ } = await tryCompress(encodedDval, encodingMethodName, configValue)
const wholeGroupJoined = joinWithAmpersand(compressedByGroups)
const encodedArrByGroups = convertResultsFromStrToArray(compressedByGroups, encodingMethodName, configValue)
showResult(encodingMethodName,startTime,wholeGroupJoined, encodedArrByGroups)
return encodedArrByGroups}
function swapToEncode(dictMap, linesDataMap) {const encodedDvals = new Map()
for (const linesData of linesDataMap.values()) {let encodedDval = ""
const relDvals = linesData.d.relative
const numberOfPath = (linesData.d.relative.x1).length
for (let key in relDvals) {const dval = relDvals[key]
try {encodedDval += swapFromNumberToCharacter(dval, numberOfPath, dictMap)} catch (error) {const errorMessage = `Error encoding dval for key ${key}: ${error.message}`
console.error(errorMessage)
outputToTextarea(errorMessage, 'textarea-lines-data-encoded')
return}}
encodedDvals.set(linesData.g_id, encodedDval)}
return encodedDvals}
function swapFromNumberToCharacter(dval, numberOfPath, dictMap) {let dvalEncoded = ''
for (let i = 0; i < numberOfPath; i++) {const originalNumber = dval[i]
if (originalNumber < -31 || originalNumber > 31) {throw new Error(`Value out of range: ${originalNumber}. Must be between -31 and 31.`)}
const encodedChar = dictMap.get(originalNumber)
dvalEncoded += encodedChar}
return dvalEncoded}