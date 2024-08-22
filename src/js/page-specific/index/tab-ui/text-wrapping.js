export function initTextWrappingCheckbox() {
    const svgInputElement = document.querySelector('#input-svg')
    const checkbox = document.querySelector('#text-wrapping');
    console.log("checkbox: ", checkbox)

    checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
            svgInputElement.classList.remove('no-wrap');
       } else {
            svgInputElement.classList.add('no-wrap');
        }
    });
}