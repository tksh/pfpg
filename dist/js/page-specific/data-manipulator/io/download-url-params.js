import { isNonEmpty } from 'common-utils/is-non-empty'
import { outputToTextarea } from 'common-utils/output-to-textarea'
import { readTextarea } from 'common-utils/read-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { tryDecompress } from 'decode/try-decompress'
export { mergeBasicDataAndLinesData }
import Zstd from 'https://cdn.skypack.dev/numcodecs/zstd?min'
if (isOnDataManipulatorPage()) {document.getElementById('button-to-download-url-params-as-txt-zstd').onclick = function () {downloadUrlParamsAsTxtZstd('textarea-encoded-url-params')}}
async function downloadUrlParamsAsTxtZstd(textareaId) {const textContent = document.getElementById(textareaId).value
const blob = await compressStringToBlob(textContent)
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
const idAndSizeStr = getTitle()
link.download = `${idAndSizeStr}.txt.zst`
link.click()
URL.revokeObjectURL(url)}
async function compressStringToBlob(string) {const inputArray = new TextEncoder().encode(string)
const codec = new Zstd()
const encoded = await codec.encode(inputArray)
const blob = new Blob([encoded], { type: 'application/zstd' })
return blob}
if (isOnDataManipulatorPage()) {document.getElementById('button-to-download-url-params-as-txt').onclick = function () {downloadUrlParamsAsTxt('textarea-encoded-url-params')}}
function downloadUrlParamsAsTxt(textareaId) {const textContent = document.getElementById(textareaId).value
const blob = new Blob([textContent], { type: 'text/plain' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
const idAndSizeStr = getTitle()
link.download = `${idAndSizeStr}.txt`
link.click()}
function getTitle() {const rawJson = readTextarea('textarea-basic-data-uploaded')
const basicDataObj = JSON.parse(rawJson)
return tryDecompress(basicDataObj.title)}
async function mergeBasicDataAndLinesData(){const basicDataStr = readTextarea(`textarea-basic-data-encoded`)
const linesDataStr = readTextarea(`textarea-lines-data-encoded`)
if (isNonEmpty(basicDataStr) && isNonEmpty(linesDataStr)) {const urlParamsStr = basicDataStr + linesDataStr
outputToTextarea(urlParamsStr, 'textarea-encoded-url-params')
const blobSize = await getBlobSize(urlParamsStr)
const compRatio = blobSize / urlParamsStr.length
document.getElementById(`encoded-url-params-size`).innerHTML =
`Size of original url params string: <b>${urlParamsStr.length}</b> characters(bytes) (.txt)<br>
Size of after Zstandard compression: <b>${blobSize}</b> bytes (.txt.zst)<br>
Ratio: ${blobSize} / ${urlParamsStr.length} = <b>${compRatio}</b>`} else {const errorMessage = "Error: Both basic data and lines data must be provided."
outputToTextarea(errorMessage, 'textarea-encoded-url-params')}}
async function getBlobSize(string) {const blob = await compressStringToBlob(string)
return blob.size}