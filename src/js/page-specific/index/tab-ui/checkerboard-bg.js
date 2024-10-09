import { updateState } from 'state/settings-defaults'

export
    { initCheckerboardBgCheckbox
    , toggleCheckerboardBg
    }

function initCheckerboardBgCheckbox() {

    const checkbox = document.getElementById('checkerboard-bg')

    checkbox.addEventListener('change', () => {
        const isCheckerboardBg = checkbox.checked
        console.log('isCheckerboardBg: ', isCheckerboardBg)
        updateState('checkerboardBg', isCheckerboardBg)
        toggleCheckerboardBg(isCheckerboardBg)
    })
}

function toggleCheckerboardBg(isCheckerboardBg) {

    const img = document.querySelector('img')
    img.classList.toggle('checker', isCheckerboardBg)

}