import { getInputSvg
       , countSvgSize }       from 'download'
import { updateState
        , getState }          from 'init/state'


export
    { initSvgOptModal
    , initSvgOptCheckbox
    , getSvgIndentation
    , removeOpacity
    , removeNewlines
    , removeSpaces
    , optimizeSvg
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
            svg = removeOpacity(svg)
            updateState('removeOpacity', true)
        } else {
            // チェックを外したときの処理
            svg = restoreOpacity(svg);
            updateState('removeOpacity', false);
        }

        if (document.getElementById('remove-newlines').checked) {
            svg = removeNewlines(svg);
            updateState('removeNewlines', true)
        } else {
            svg = restoreNewlines(svg);
            updateState('removeNewlines', false)
        }

        if (document.getElementById('remove-spaces').checked) {
            svg = removeSpaces(svg);
            updateState('removeSpaces', true);
        } else {
            // スペースを復元する処理
            svg = restoreSpaces(svg);
            updateState('removeSpaces', false);
        }

        // Update the textarea
        svgInputElement.value = svg;

        // Count the size of new svg string siz and indicate it to download button
        countSvgSize(svg)
    }
};


// Remove and restore functions

function removeOpacity(svg) {
    return svg.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '');
}

function restoreOpacity(svg) {
    return svg.replace(/(<[^>]*\bstroke="[^"]*")([^>]*>)/g, function(match, p1, p2) {
        if (!/\bopacity=/.test(match) && !/\bstroke-opacity=/.test(match)) {
            return p1 + ' opacity="1.0" stroke-opacity="1.0"' + p2;
        } else if (!/\bopacity=/.test(match)) {
            return p1 + ' opacity="1.0"' + p2;
        } else if (!/\bstroke-opacity=/.test(match)) {
            return match.replace(/\bopacity="[^"]*"/, '$& stroke-opacity="1.0"');
        }
        return match;
    })
}


function removeNewlines(svg) {
    return svg.replace(/>\s+</g, '><')
}

function restoreNewlines(svg) {
    const indentCounts = getState('indentByRow');
    let formattedSvg = svg.replace(/></g, '>\n<');
    const lines = formattedSvg.split('\n');

    const indentedLines = lines.map((line, index) => {
        const indentCount = indentCounts[index] || 0;
        return '    '.repeat(indentCount) + line.trim();
    });

    return indentedLines.join('\n');
}

// Save the indentation as number in array

function getSvgIndentation(svg) {
    const lines = svg.split('\n');
    return lines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? Math.floor(match[1].length / 4) : 0;
    });
}


function removeSpaces(svg) {
    return svg
        // 数値と大文字の M|L のあいだの スペースを削除
        .replace(/(\d)\s+([ML])/g, '$1$2')
        // ダブルクォートとスラッシュ のあいだの スペースを削除
        .replace(/"\s+(\/)/g, '"$1')
}

function restoreSpaces(svg) {
    return svg
        // 数値と大文字の M|L のあいだに スペースを挿入
        .replace(/(\d)([ML])/g, '$1 $2')
        // ダブルクォートとスラッシュ のあいだに スペースを挿入
        .replace(/"(\/)/g, '" $1')
}



// Apply optimizations based on state
function optimizeSvg(svg, state) {
    let optimizedSvg = svg;
    for (const [functionName, isEnabled] of state) {
        if (isEnabled && typeof optimizeFunctions[functionName] === 'function') {
            optimizedSvg = optimizeFunctions[functionName](optimizedSvg);
        }
    }
    return optimizedSvg
}

const optimizeFunctions = {
    removeOpacity,
    removeNewlines,
    removeSpaces
};