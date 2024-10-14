import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg } from 'decode/decode'
import { bestMixEnc } from 'encode/best-mix-enc'
import { updateEncodingMethodsCheckboxStates } from 'encode/best-mix-enc'
import { encodeBasicData, parseBasicData, updateBasicDataKeysCheckboxStates} from 'enc-and-dec/basic-data/basic-data-enc'
import { bruteforce53Enc } from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { bigint64Enc } from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { swap63Enc } from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'
import { four16Enc } from 'enc-and-dec/lines-data/d-values/four16/four16-enc'
import { mergeBasicDataAndLinesData } from 'io/download-url-params'
import { setupCopyButtons } from 'io/copy-textarea'
const isDataManipulatorPage = isOnDataManipulatorPage()
if (window.location.search) {for (const boolean of [true, false]) {const isRelative = boolean
decodeUrlToSvg(isRelative, isDataManipulatorPage)}}
function initButtons(buttonId, functionName) {const buttonElem = document.getElementById(`${buttonId}`)
buttonElem.addEventListener('click', functionName)}
function initBasicDataTextarea() {document.getElementById('textarea-basic-data-uploaded').addEventListener('input', () => {const basicData = parseBasicData()
updateBasicDataKeysCheckboxStates(basicData)
updateEncodingMethodsCheckboxStates(basicData)})}
document.addEventListener('DOMContentLoaded', () => {initButtons('encode-basic-data', encodeBasicData)
initButtons('encode-lines-data-via-bruteforce53', bruteforce53Enc)
initButtons('encode-lines-data-via-bigint64', bigint64Enc)
initButtons('encode-lines-data-via-swap63', swap63Enc)
initButtons('encode-lines-data-via-four16', four16Enc)
initButtons('encode-lines-data-via-best-mix', bestMixEnc)
initButtons('button-to-merge-as-url-params', mergeBasicDataAndLinesData)
setupCopyButtons()
const basicData = parseBasicData()
updateBasicDataKeysCheckboxStates(basicData)
updateEncodingMethodsCheckboxStates(basicData)
initBasicDataTextarea()})