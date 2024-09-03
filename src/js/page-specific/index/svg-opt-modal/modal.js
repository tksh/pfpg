export function initSvgOptModal() {
    const textarea = document.getElementById('input-svg')
    const modal    = document.getElementById('svg-opt-modal')
    const closeBtn = document.getElementById('close-svg-opt-modal')

    textarea.addEventListener('click', function () {
        modal.style.display = "block"
    })

    closeBtn.addEventListener('click', function () {
        modal.style.display = "none"
    })

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    })
}