import { showProcessingTime } from 'common-utils/show-processing-time'
import { BASIC_DATA_KEYS } from 'constants'
import { isNonEmpty } from 'common-utils/is-non-empty'
import { outputToTextarea } from 'common-utils/output-to-textarea'
import { readTextarea } from 'common-utils/read-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { showStringSize } from 'encode/show-result'
import { URLCompressor } from 'libs/url-comp-0-1-0/url-comp'
export
{ encodeBasicData, parseBasicData, updateBasicDataKeysCheckboxStates}
function encodeBasicData() {const startTime = performance.now()
const functionName = 'encodeBasicData()'
const data = parseBasicData()
let dataAsUrlParams = "?"
const selectedFields = Array.from(document.querySelectorAll('#basic-data-options input[type="checkbox"]:checked')).map(cb => cb.id.replace('include-', ''))
selectedFields.forEach(prop => {if (prop in data && isNonEmpty(data[prop])) {dataAsUrlParams += processProperty(prop, data[prop])} else {}})
outputToTextarea(dataAsUrlParams, 'textarea-basic-data-encoded')
showStringSize(functionName, dataAsUrlParams, 'encoded-basic-data-size')
const endTime = performance.now()
const elapsedTime = Math.floor(endTime - startTime)
showProcessingTime(functionName, elapsedTime, 'encoded-basic-data-time', isOnDataManipulatorPage())}
function updateBasicDataKeysCheckboxStates(basicData) {BASIC_DATA_KEYS.forEach(key => {if (key !== 'n') {const checkbox = document.getElementById(`include-${key}`)
const label = checkbox.nextElementSibling
if (!(key in basicData) || basicData[key] === '') {checkbox.checked = false
checkbox.disabled = true
label.textContent = `${key} (value not found in JSON)`} else {checkbox.checked = true
checkbox.disabled = false
label.textContent = key}}})}
function parseBasicData() {const rawStr = readTextarea('textarea-basic-data-uploaded')
const json = JSON.parse(rawStr)
const result = {}
BASIC_DATA_KEYS.forEach(key => {if (key in json && json[key] !== '') {result[key] = json[key]}})
return result}
function isValidStringAsUri(str) {const regex = /^[0-9a-zA-Z_\-\.~]+$/
return regex.test(str)}
function processProperty(propertyName, value) {const isValidAsUri = isValidStringAsUri(value)
if (isValidAsUri) {return `${propertyName}=${value}&`} else {return `${propertyName}=~${URLCompressor.compress(value)}&`}}