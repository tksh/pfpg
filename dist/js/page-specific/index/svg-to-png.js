import { countSvgSize } from 'download'
import { extractViewboxValues } from 'tab-canvas/crop-side-margins'
import { roundToOneDecimal } from 'utils/number-rounding'
export
{ executeSvg2png, measureSvg2pngTime, svg2png}
async function executeSvg2png(event, resvgOption) {const renderingStatusElements = new Map([['pngDownloadButton', document.getElementById("png-download-button")],['lastRenderingTimeP', document.getElementById("last-rendering-time")]])
const svgString = event.target.value.trim()
const hasCrop = document.querySelector('#crop-by-bbox').checked
measureSvg2pngTime(svgString, resvgOption, hasCrop, renderingStatusElements)
.then((result) => {})
.catch((error) => {console.error('An error occurred during the processing of svg2png:', error)})
countSvgSize(svgString)}
async function svg2png(svgString, resvgOption, hasCrop) {const resvgJS = new resvg.Resvg(svgString, resvgOption)
const resolved = await Promise.all(resvgJS.imagesToResolve().map(async (url) => {const img = await fetch(url)
const buffer = await img.arrayBuffer()
return {url,buffer: new Uint8Array(buffer),}}),)
if (resolved.length > 0) {for (const result of resolved) {const { url, buffer } = result
resvgJS.resolveImage(url, buffer)}}
const innerBBox = resvgJS.innerBBox()
const bbox = resvgJS.getBBox()
if (hasCrop && bbox) resvgJS.cropByBBox(bbox)
const pngData = resvgJS.render()
const pngBuffer = pngData.asPng()
document.querySelector('#output img').src = URL.createObjectURL(new Blob([pngBuffer], { type: 'image/png' }))
const pngSize = pngBuffer.length
const pngSizeAsKb = roundToOneDecimal(pngSize / 1024)
document.querySelector('#png-info').textContent = `Rendered PNG pixel size: ${pngData.width} x ${pngData.height}`
const pngDownloadSizeText = `Download as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`
document.getElementById("png-download-button").innerHTML = pngDownloadSizeText
const viewboxValues = extractViewboxValues(svgString)
document.querySelector('#svg-info').textContent = 'Source SVG viewBox size: ' + viewboxValues.get('w') + ' x ' + viewboxValues.get('h')}
async function measureSvg2pngTime(svgString, resvgOption, hasCrop, renderingStatusElements) {await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngDownloadButton'))
return new Promise((resolve, reject) => {setTimeout(async () => {const startTime = performance.now()
try {const result = await svg2png(svgString, resvgOption, hasCrop)
const endTime = performance.now()
const elapsedTime = Math.floor(endTime - startTime)
await updateRenderingStatus(`Last rendering time: ${elapsedTime} milliseconds`, renderingStatusElements.get('lastRenderingTimeP'))
resolve(result)} catch (error) {console.error('An error occurred during the processing of svg2png:', error)
await updateRenderingStatus("An error occurred", pngDownloadButtonElement)
reject(error)}}, 0)})}
async function updateRenderingStatus(text, element) {return new Promise((resolve) => {element.innerHTML = text
requestAnimationFrame(() => {resolve()})})}