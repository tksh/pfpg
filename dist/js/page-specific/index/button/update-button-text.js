import { updateState } from 'state/url-state-manager'
import { roundToOneDecimal } from 'utils/number-rounding'
export
{ initButtonActionSelect, updateButtonText, updateButtonWithSvgSize, updateButtonWithPngSize}
function initButtonActionSelect() {document.getElementById('button-action').addEventListener('change', (event) => {const buttonAction = event.target.value
updateState('buttonAction', buttonAction)
const pngActionButton = document.getElementById('png-action-button');
const svgActionButton = document.getElementById('svg-action-button');
updateButtonText(buttonAction, pngActionButton)
updateButtonText(buttonAction, svgActionButton)})}
function updateButtonText(buttonAction, button) {const buttonText = button.innerHTML;
const regex = /(Download|Copy)/i;
const match = buttonText.match(regex);
if (match) {const replacement = buttonAction === 'download' ? 'Download' : 'Copy';
button.innerHTML = buttonText.replace(match[0], replacement);}}
function getActionText() {const actionSelect = document.getElementById('button-action');
const buttonAction = actionSelect.value;
if (buttonAction === 'download') {return 'Download';} else if (buttonAction === 'copy') {return 'Copy';}}
function byteCount(s) {return new Blob([s]).size}
function updateButtonWithSvgSize(svgString) {const svgActionButtonElement = document.getElementById("svg-action-button")
const svgSize = byteCount(svgString)
const svgSizeAsKb = roundToOneDecimal(svgSize / 1024)
const actionText = getActionText()
svgActionButtonElement.innerHTML = `${actionText} as SVG<br>(size: ${svgSizeAsKb} kb / ${svgSize} bytes)`;}
function updateButtonWithPngSize(pngBuffer) {const pngActionButtonElement = document.getElementById("png-action-button")
const pngSize = pngBuffer.length
const pngSizeAsKb = roundToOneDecimal(pngSize / 1024)
const actionText = getActionText()
pngActionButtonElement.innerHTML = `${actionText} as PNG<br>(size: ${pngSizeAsKb} kb / ${pngSize} bytes)`;}