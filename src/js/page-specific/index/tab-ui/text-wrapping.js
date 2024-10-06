import { updateState } from 'state/state-as-map-obj'

export function initTextWrappingCheckbox() {
    const checkbox = document.querySelector('#text-wrapping')
    const svgStringElement = document.querySelector('#svg-string')

    //  checkbox.checked => remove 'no-wrap' class => set url param as 'textWrapping=true'
    // !checkbox.checked =>    add 'no-wrap' class => set url param as 'textWrapping=false'
    checkbox.addEventListener('change', () => {
        svgStringElement.classList.toggle('no-wrap', !checkbox.checked)
        updateState('textWrapping', checkbox.checked)
    })

}