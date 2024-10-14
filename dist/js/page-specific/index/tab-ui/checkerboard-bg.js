import { updateState } from 'state/url-state-manager'
export
{ initCheckerboardBgCheckbox, toggleCheckerboardBg}
function initCheckerboardBgCheckbox() {const checkbox = document.getElementById('checkerboard-bg')
checkbox.addEventListener('change', () => {const isCheckerboardBg = checkbox.checked
updateState('checkerboardBg', isCheckerboardBg)
toggleCheckerboardBg(isCheckerboardBg)})}
function toggleCheckerboardBg(isCheckerboardBg) {const img = document.querySelector('img')
img.classList.toggle('checker', isCheckerboardBg)}