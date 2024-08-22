export function initTextWrappingCheckbox() {
    const checkbox = document.querySelector('#text-wrapping');
    const svgInputElement = document.querySelector('#input-svg')

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            svgInputElement.classList.remove('no-wrap');
       } else {
            svgInputElement.classList.add('no-wrap');
        }
    });
}