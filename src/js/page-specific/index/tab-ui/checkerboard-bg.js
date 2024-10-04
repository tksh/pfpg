import { updateState } from 'state/state-as-map-obj'

export function initCheckerboardBgCheckbox() {
    const checkbox = document.getElementById('checkerboard-bg')
    const img = document.querySelector("img")

    checkbox.addEventListener('change', () => {
        img.classList.toggle("checker", checkbox.checked)
        updateState('checkerboard', checkbox.checked)
    })
}
