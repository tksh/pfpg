import { getSvgString } from 'button/download-as-file'
import { resvgOption } from 'state/resvg-option'
import { adjustWidthNum, syncWidthNum } from 'tab-render/sync-number-and-range'
import { updateState } from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'
export
{ initWidthPixelSizeInputElements, initWidthValidatorListener}
function initWidthPixelSizeInputElements() {document.querySelector('#png-size-number').addEventListener('change', pngSizeElement)
document.querySelector('#png-size-range').addEventListener('change', pngSizeElement)
document.querySelector('#width-size-dec').addEventListener('click', () => handleButtonClick(-1))
document.querySelector('#width-size-inc').addEventListener('click', () => handleButtonClick(1))}
function initWidthValidatorListener() {const numberInput = document.getElementById("png-size-number")
numberInput.addEventListener("change", numberInput.reportValidity)}
function updateAndConvert(value) {updateState('widthPixelSize', value);
resvgOption.fitTo.value = parseInt(value, 10);
executeSvg2png({ target: { value: getSvgString() } }, resvgOption);}
function pngSizeElement(event) {syncWidthNum(event.target);
updateAndConvert(event.target.value);}
function handleButtonClick(step) {const value = adjustWidthNum(step);
if (value !== null) {updateAndConvert(value);}}