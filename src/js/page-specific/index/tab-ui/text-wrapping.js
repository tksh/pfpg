import { updateState } from 'state/url-state-manager'

export
    { initTextWrappingCheckbox
    , toggleTextWrapping
    }

function initTextWrappingCheckbox() {

    const checkbox = document.getElementById('text-wrapping')

    checkbox.addEventListener('change', () => {
        const isTextWrapping = checkbox.checked
        console.log('isTextWrapping: ', isTextWrapping)
        updateState('textWrapping', isTextWrapping)
        toggleTextWrapping(isTextWrapping)
    })

}

function toggleTextWrapping(isTextWrapping) {

    //  checkbox.checked => remove 'no-wrap' class => set url param as 'textWrapping(isTextWrapping)=true'
    // !checkbox.checked =>    add 'no-wrap' class => set url param as 'textWrapping(isTextWrapping)=false'
    const svgTextarea = document.querySelector('#svg-string')

    if (isTextWrapping === true) {
        svgTextarea.classList.remove('no-wrap')
    } else { // (isTextWrapping === false)
        svgTextarea.classList.add('no-wrap')
    }

}