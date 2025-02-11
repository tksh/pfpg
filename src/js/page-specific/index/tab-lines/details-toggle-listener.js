import { adjustLayoutIfNotMobile }                  from 'init/adjust-layout'

export function initOptionDetailsToggleListener() {
    const details = document.getElementById('lines-option-details')
    details.addEventListener("toggle", () => {
        adjustLayoutIfNotMobile('detailsOpened')
    })
}