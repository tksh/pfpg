import { outputToTextarea } from 'common-utils/output-to-textarea'
import { tryDecompress } from 'decode/try-decompress'
import { showDetailsByGroups, showStringSize} from 'encode/show-result'
import { joinWithAmpersand } from 'encode/join-with-ampersand'
import { showBestMixResult } from 'encode/show-best-mix-result'
import { simplifyMap } from 'encode/simplify-map'
import { storeShortest } from 'encode/store-shortest'
import { bigint64Enc } from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { bruteforce53Enc } from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { swap63Enc } from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'
import { four16Enc } from 'enc-and-dec/lines-data/d-values/four16/four16-enc'
export
{ bestMixEnc, updateEncodingMethodsCheckboxStates}
const ENCODING_METHODS = {bruteforce53: bruteforce53Enc,bigint64 : bigint64Enc,swap63 : swap63Enc,four16 : four16Enc,}
function getCheckedEncodingMethodNames() {return Object.keys(ENCODING_METHODS)
.filter(id => document.getElementById(`apply-${id}`).checked)
.map(id => id.replace('apply-', ''))}
async function encodeWithSelectedMethods(methods) {return await Promise.all(methods.map((method) => method()))}
function processEncodedData(encodedMaps, methodNames) {const shortestArrByGroups = storeShortest(encodedMaps, methodNames)
const shortestStrByGroups = simplifyMap(shortestArrByGroups)
const shortestStrArr = [...shortestStrByGroups.values()]
return [shortestArrByGroups, shortestStrArr]}
function displayResults(shortestJoined, shortestArrByGroups, checkedMethodNames) {outputToTextarea(shortestJoined, 'textarea-lines-data-encoded')
const inputDataTitle = `Lines Data encoding via 'bestMixEnc()' includes ${checkedMethodNames.join(', ')}`
showStringSize(inputDataTitle, shortestJoined, 'encoded-lines-data-size')
const dataToShow = showDetailsByGroups(shortestArrByGroups, 'best-mix')
showBestMixResult(dataToShow, 'encoded-lines-data-size')
document.getElementById('encoded-lines-data-time').innerHTML = ''}
async function bestMixEnc() {const checkedMethodNames = getCheckedEncodingMethodNames()
const checkedMethodFunctions = checkedMethodNames.map((name) => ENCODING_METHODS[name])
const encodedMaps = await encodeWithSelectedMethods(checkedMethodFunctions)
const [shortestArrByGroups, shortestStrArr] = processEncodedData(encodedMaps, checkedMethodNames)
const shortestJoined = joinWithAmpersand(shortestStrArr)
displayResults(shortestJoined, shortestArrByGroups, checkedMethodNames)}
function updateEncodingMethodsCheckboxStates(basicData) {const uintN = tryDecompress(basicData.n)
const checkboxes = Object.keys(ENCODING_METHODS).reduce((acc, id) => {acc[id] = document.getElementById(`apply-${id}`)
return acc}, {})
const settings = {bruteforce53: { checked: true, disabled: false },bigint64: { checked: true, disabled: false },swap63: { checked: uintN <= 5, disabled: uintN > 5 },four16: { checked: uintN <= 8, disabled: uintN > 8 }}
Object.entries(settings).forEach(([id, state]) => {Object.assign(checkboxes[id], state)})}