import { updateState } from 'state/url-state-manager'
export
{ initTextWrappingCheckbox, toggleTextWrapping}
function initTextWrappingCheckbox() {const checkbox = document.getElementById('text-wrapping')
checkbox.addEventListener('change', () => {const isTextWrapping = checkbox.checked
updateState('textWrapping', isTextWrapping)
toggleTextWrapping(isTextWrapping)})}
function toggleTextWrapping(isTextWrapping) {const svgTextarea = document.querySelector('#svg-string')
if (isTextWrapping === true) {svgTextarea.classList.remove('no-wrap')} else {svgTextarea.classList.add('no-wrap')}}