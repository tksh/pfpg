export function initSvgOptModal() {
    const textarea = document.getElementById('svg-string')
    const modal    = document.getElementById('svg-opt-modal')
    const closeIcon = document.getElementById('svg-opt-close-icon')

    textarea.addEventListener('click', function () {
        modal.style.display = "block"
    })

    closeIcon.addEventListener('click', function () {
        modal.style.display = "none"
    })

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    })
}


export function initSettingsResetModal() {
    const button = document.getElementById('reset-icon')
    const modal    = document.getElementById('settings-reset-modal')
    const closeIcon = document.getElementById('settings-reset-close-icon')

    button.addEventListener('click', function () {
        modal.style.display = "block"
    })

    closeIcon.addEventListener('click', function () {
        modal.style.display = "none"
    })

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    })
}