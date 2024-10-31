import { updateButtonWithSvgSize, updateButtonWithPngSize } from 'button/update-button-text'
import { extractViewboxValues } from 'tab-canvas/crop-side-margins'
export
{ executeSvg2png, measureSvg2pngTime, svg2png}
async function executeSvg2png(event, resvgOption) {const renderingStatusElements = new Map([['pngActionButton', document.getElementById("png-action-button")],['lastRenderingTimeP', document.getElementById("last-rendering-time")]])
const svgString = event.target.value.trim()
measureSvg2pngTime(svgString, resvgOption, renderingStatusElements)
.then((result) => {})
.catch((error) => {console.error('An error occurred during the processing of svg2png:', error)})
updateButtonWithSvgSize(svgString)}
async function svg2png(svgString, resvgOption) {const resvgJS = new resvg.Resvg(svgString, resvgOption)
const pngData = resvgJS.render()
const pngBuffer = pngData.asPng()
document.querySelector('#output img').src = URL.createObjectURL(new Blob([pngBuffer], { type: 'image/png' }))
updateButtonWithPngSize(pngBuffer)
updatePngInfo(pngData)
updateSvgInfo(svgString)}
function updatePngInfo(pngData) {document.querySelector('#png-info').textContent = `Rendered PNG pixel size: ${pngData.width} x ${pngData.height}`}
function updateSvgInfo(svgString) {const viewboxValues = extractViewboxValues(svgString)
document.querySelector('#svg-info').textContent = 'Source SVG viewBox size: ' + viewboxValues.get('w') + ' x ' + viewboxValues.get('h')}
async function measureSvg2pngTime(svgString, resvgOption, renderingStatusElements) {try {await updateRenderingStatus("Now rendering ...<br> Please wait a moment :)", renderingStatusElements.get('pngActionButton'));
const startTime = performance.now();
const result = await svg2png(svgString, resvgOption);
const endTime = performance.now();
const elapsedTime = Math.floor(endTime - startTime);
await updateRenderingStatus(`Last rendering time: ${elapsedTime} milliseconds`, renderingStatusElements.get('lastRenderingTimeP'));
return result;} catch (error) {console.error('An error occurred during the processing of svg2png:', error);
await updateRenderingStatus("An error occurred", renderingStatusElements.get('pngActionButton'));
throw error;}}
async function updateRenderingStatus(text, element) {return new Promise((resolve) => {element.innerHTML = text
requestAnimationFrame(() => {resolve()})})}