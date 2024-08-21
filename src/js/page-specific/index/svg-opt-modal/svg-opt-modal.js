import { getInputSvg } from 'download'

export
    { initSvgOptModal
    , initSvgOptCheckbox
    }

function initSvgOptModal() {
    const textarea = document.getElementById('input-svg');
    const modal    = document.getElementById('svg-opt-modal');
    const closeBtn = document.getElementById('close-svg-opt-modal');

    textarea.addEventListener('click', function () {
        modal.style.display = "block";
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = "none";
    });

    window.addEventListener('click', function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
};


function initSvgOptCheckbox() {
    const svgInputElement = document.querySelector('#input-svg')
    const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSvg);
    });

    function updateSvg() {
        let svg = getInputSvg();

        if (document.getElementById('remove-opacity').checked) {
            svg = svg.replace(/(opacity|stroke-opacity)="1(\.0)?"/g, '');
        }

        if (document.getElementById('remove-newlines').checked) {
            svg = svg.replace(/>\s+</g, '><');
        }

        if (document.getElementById('remove-spaces').checked) {
            svg = svg.replace(/\s+/g, ' ').replace(/"\s+/g, '"').replace(/\s+"/g, '"');
        }

        svgInputElement.value = svg;
    }
};