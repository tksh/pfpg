import { adjustOutputBoxSize }                  from 'init/adjust-output-boxes-size'

export function initOptionDetailsToggleListener() {
    const details = document.getElementById('lines-option-details')
    details.addEventListener("toggle", () => {
        adjustOutputBoxSize('detailsOpened')
    })
}