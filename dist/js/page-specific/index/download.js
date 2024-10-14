import { extractViewboxValues } from 'tab-canvas/crop-side-margins'
import { getGroupColorsAsJoinedHex } from 'tab-lines/encode-colors-as-hex'
import { roundToOneDecimal } from 'utils/number-rounding'
export
{ countSvgSize, getSvgString, initDownloadButtons}
function getSvgString() {return document.querySelector('#svg-string').value.trim()}
function getArtworkId() {const inputSvg = getSvgString()
const patternForTitle = /<title>(.*?)<\/title>/g
const titleText = patternForTitle.exec(inputSvg)[1]
return titleText}
function getPixelSizeWxH() {const pngInfoElem = document.getElementById('png-info')
const pngInfoText = pngInfoElem.textContent
const patternForPngSize = /(\d+) x (\d+)/
const matchesPngSize = patternForPngSize.exec(pngInfoText)
const pngSizeWidth = matchesPngSize[1]
const pngSizeHeight = matchesPngSize[2]
const pngSizeWxH = `${pngSizeWidth}x${pngSizeHeight}`
return pngSizeWxH}
function getCurrentStatus() {const groupColorsHexString = getGroupColorsAsJoinedHex(getSvgString())
const pathModeSelect = document.getElementById('path-mode')
const pathMode = pathModeSelect.value
const antiAliasingSelect = document.getElementById('shape-rendering')
const shapeRendering = antiAliasingSelect.value
const shapeToTrimSelect = document.getElementById('shape-to-trim')
let shapeToTrim = shapeToTrimSelect.value
if (shapeToTrim === 'squircleSlimmed') {const selectWidthNarrowness = document.getElementById('width-narrowness')
const selectTopHeavyRatio = document.getElementById('top-heavy-ratio')
const widthNarrowness = selectWidthNarrowness.value
const topHeavyRatio = selectTopHeavyRatio.value
shapeToTrim = `squircleSlimmed_${widthNarrowness}_${topHeavyRatio}`}
return `g_${groupColorsHexString}-p_${pathMode}-t_${shapeToTrim}-r_${shapeRendering}`}
function initDownloadButtons() {const pngDownloadButton = document.getElementById('png-download-button')
if (pngDownloadButton) {pngDownloadButton.addEventListener('click', downloadPng)}
const svgDownloadButton = document.getElementById('svg-download-button')
if (svgDownloadButton) {svgDownloadButton.addEventListener('click', downloadSvg)}}
function downloadPng() {const imgElem = document.getElementById('img')
const url = imgElem.src
const link = document.createElement('a')
link.href = url
const artworkId = getArtworkId()
const pixelSize = getPixelSizeWxH()
const currentStatus = getCurrentStatus()
link.download = `${artworkId}-${pixelSize}px-${currentStatus}.png`
link.click()}
function downloadSvg() {const inputSvg = getSvgString()
const blob = new Blob([inputSvg], { type: 'image/svg+xml' })
const url = URL.createObjectURL(blob)
const link = document.createElement('a')
link.href = url
const artworkId = getArtworkId()
const viewboxValues = extractViewboxValues(inputSvg)
const viewboxValueDelimitedWithUnderscores = viewboxValues.get('x') + '_' +
viewboxValues.get('y') + '_' +
viewboxValues.get('w') + '_' +
viewboxValues.get('h')
const currentStatus = getCurrentStatus()
link.download = `${artworkId}-v_${viewboxValueDelimitedWithUnderscores}-${currentStatus}.svg`
link.click()}
function countSvgSize(svgString) {const svgDownloadButtonElement = document.getElementById("svg-download-button")
const svgSize = byteCount(svgString)
const svgSizeAsKb = roundToOneDecimal(svgSize / 1024)
svgDownloadButtonElement.innerHTML = `Download as SVG<br>(size: ${svgSizeAsKb} kb / ${svgSize} bytes)`}
function byteCount(s) {return new Blob([s]).size}