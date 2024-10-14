import { tabSpace } from 'constants'
import { getState, updateState} from 'state/url-state-manager'
import { viewboxSlimmed, viewboxUnSlimmed, extractViewboxValues} from 'tab-canvas/crop-side-margins'
import { roundToTwoDecimals } from 'utils/number-rounding'
export
{ toggleDisplay, updateSvgWithSelectedShapePath}
function toggleDisplay(elements, display) {elements.forEach(element => {document.getElementById(element).style.display = display})}
function updateSvgWithSelectedShapePath(shape, inputSvg) {document.getElementById('shape-to-trim').value = shape
const gridSize = extractViewboxValues(inputSvg).get('h')
const center = roundToTwoDecimals(gridSize / 2)
const shapePath = shape === 'squircleSlimmed'
? generateClippathShapeOfSquircleSlimmed(inputSvg, getWidthNarrowness(), getTopHeavyRatio())
: shape === 'square'
? `<rect width="100%" height="100%" />`
: shape === 'circle'
? `<circle cx="50%" cy="50%" r="50%" />`
: `<path d="M 0,${center}Q 0,0 ${center},0T ${gridSize},${center} ${center},${gridSize} 0,${center}" />`
const patternForClippathShape = /<clipPath id="shape-to-trim">(\n?).*(\n?).*<\/clipPath>/g
const removeLineBreaks = getState('removeLineBreaks')
const newClippathSvg = removeLineBreaks
? inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">${shapePath}</clipPath>`)
: inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">\n${tabSpace.repeat(3)}${shapePath}\n${tabSpace.repeat(2)}</clipPath>`)
const clippathAndViewboxUpdatedSvg = shape === 'squircleSlimmed'
? isCropSideMargins()
? viewboxSlimmed(newClippathSvg)
: viewboxUnSlimmed(newClippathSvg)
: viewboxUnSlimmed(newClippathSvg)
return clippathAndViewboxUpdatedSvg}
function generateClippathShapeOfSquircleSlimmed(inputSvg, widthNarrowness, topHeavyRatio) {const gridSize = extractViewboxValues(inputSvg).get('h')
const center = getCenter(gridSize)
const eachSideWidthForNarrowing = ((gridSize / 100) * (widthNarrowness / 2))
const left = roundToTwoDecimals(0 + eachSideWidthForNarrowing)
const right = roundToTwoDecimals(gridSize - eachSideWidthForNarrowing)
const topInflationAmount = roundToTwoDecimals(left - ((gridSize / 100) * topHeavyRatio))
return `<path d="M ${left},${center}Q ${topInflationAmount},0 ${center},0T ${right},${center} ${center},${gridSize} ${left},${center}" />`}
function getCenter(gridSize) {const center = roundToTwoDecimals(gridSize / 2)
return center}
function getWidthNarrowness() {const widthNarrowness = getState('widthNarrowness')
if (widthNarrowness) {document.getElementById('width-narrowness').value = widthNarrowness
return widthNarrowness} else {const widthNarrowness = document.getElementById('width-narrowness').value
updateState('widthNarrowness', widthNarrowness)
return widthNarrowness}}
function getTopHeavyRatio() {const topHeavyRatio = getState('topHeavyRatio')
if (topHeavyRatio) {document.getElementById('top-heavy-ratio').value = topHeavyRatio
return topHeavyRatio} else {const topHeavyRatio = document.getElementById('top-heavy-ratio').value
updateState('topHeavyRatio', topHeavyRatio)
return topHeavyRatio}}
function isCropSideMargins() {const cropCheckbox = document.getElementById('crop-side-margins')
const isCropped = getState('cropSideMargins')
if (isCropped !== undefined && isCropped !== null) {cropCheckbox.checked = isCropped} else {updateState('cropSideMargins', cropCheckbox.checked)}
return cropCheckbox.checked}