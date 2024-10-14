import { outputToTextarea } from 'common-utils/output-to-textarea'
import { decodeUrlParams } from 'common-utils/read-url-params'
import { selectOutputTextareaId } from 'common-utils/select-output-textarea'
import { calculateArtworkId } from 'decode/calc-artwork-id'
import { relToAbs } from 'decode/rel-to-abs'
import { generateSvg } from 'decode/generate-svg'
import { showProcessingTime } from 'common-utils/show-processing-time'
import { absToRel } from 'enc-and-dec/lines-data/d-values/bigint64/abs-to-rel'
import { bigint64Dec } from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-dec'
import { bruteforce53Dec } from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-dec'
import { diffToRel } from 'enc-and-dec/lines-data/d-values/bruteforce53/diff-to-rel'
import { four16Dec } from 'enc-and-dec/lines-data/d-values/four16/four16-dec'
import { swap63Dec } from 'enc-and-dec/lines-data/d-values/swap63/swap63-dec'
export
{ decodeUrlToSvg, decodeDvals}
function decodeUrlToSvg(isRelative, isDataManipulatorPage) {const startTime = performance.now()
const decodedParams = decodeUrlParams()
if (decodedParams != null) {const svgString = generateSvg(isRelative, decodedParams)
const outputTextareaId = selectOutputTextareaId(isRelative, isDataManipulatorPage)
outputToTextarea(svgString, outputTextareaId)
const queryString = window.location.search
const compRatio = queryString.length / svgString.length
const postfix = isRelative ? 'rel' : 'abs'
if (isDataManipulatorPage) {const resultTextElem = document.getElementById(`encoded-size-compare-for-${postfix}`)
const text = `Size of url params: <b>${queryString.length}</b> characters (bytes)<br>
Size of SVG string: <b>${svgString.length}</b> characters (bytes)<br>
Ratio: ${queryString.length} / ${svgString.length} = <b>${compRatio}</b>`
resultTextElem.innerHTML = text}
const endTime = performance.now()
const elapsedTime = Math.floor(endTime - startTime)
showProcessingTime('SVG decoding', elapsedTime, `encoded-lines-data-time-for-${postfix}`, isDataManipulatorPage)
return svgString} else {}}
function decodeDvals(linesDataMap) {let decodedAbsDvalsObj = {}
let decodedRelDvalsObj = {}
for (const [gId, v] of linesDataMap) {let decodedAbsDvals = []
let decodedRelDvals = []
if (v.encodingMethodFlag === '0') {const decodedDiffDvals = bruteforce53Dec(v.encodedDvals)
decodedRelDvals = decodedDiffDvals.map(coord => diffToRel(coord))
decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)} else if (v.encodingMethodFlag === '1') {decodedAbsDvals = bigint64Dec(v.encodedDvals)
decodedRelDvals = absToRel(decodedAbsDvals, v.widthsAndCounts)} else if (v.encodingMethodFlag === '2') {decodedRelDvals = swap63Dec(v.encodedDvals)
decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)} else if (v.encodingMethodFlag === '3') {decodedRelDvals = four16Dec(v.encodedDvals)
decodedAbsDvals = relToAbs(decodedRelDvals, v.widthsAndCounts)} else {}
decodedAbsDvalsObj = {x1: decodedAbsDvals[0],y1: decodedAbsDvals[1],x2: decodedAbsDvals[2],y2: decodedAbsDvals[3]}
decodedRelDvalsObj = {x1: decodedRelDvals[0],y1: decodedRelDvals[1],x2: decodedRelDvals[2],y2: decodedRelDvals[3]}}
return {absolute: decodedAbsDvalsObj,relative: decodedRelDvalsObj}}