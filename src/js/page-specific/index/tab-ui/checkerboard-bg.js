import { updateState } from 'state/settings-defaults'

export function initCheckerboardBgCheckbox() {
    const checkbox = document.getElementById('checkerboard-bg')
    const img = document.querySelector("img")

    checkbox.addEventListener('change', () => {
        img.classList.toggle("checker", checkbox.checked)
        updateState('checkerboard', checkbox.checked)
    })
}
