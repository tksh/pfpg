import { getSvgString
       , countSvgSize } from 'download'
import { updateState
       , getState }     from 'state/settings-defaults'
import { tabSpace }     from 'constants'
import { decodeAsSelectedPathMode }  from 'tab-lines/path-mode'

export
    { initSvgOptCheckboxes
    , getSvgIndentation
    , getCurrentPathModeIndentation
    , removeOpacity
    , removeNewlines
    , removeSpaces
    , optimizeSvg
    , tryRemoveOpacity
    , tryRemoveNewlines
    , tryRemoveSpaces
    }


// Functions for 'applySvgOptimization()'
// Restore the states of optimization via ulr params

function tryRemoveOpacity(svgString, isOpacityRemoved) {
    console.log('tryRemoveOpacity executed.')
    if (isOpacityRemoved) {
        return removeOpacity(svgString)
    } else {
        return svgString
    }
}
function tryRemoveNewlines(svgString, isNewlinesRemoved) {
    console.log('tryRemoveNewlines executed.')
    if (isNewlinesRemoved) {
        return removeNewlines(svgString)
    } else {
        return svgString
    }
}
function tryRemoveSpaces(svgString, isSpacesRemoved) {
    console.log('tryRemoveSpaces executed.')
    if (isSpacesRemoved) {
        return removeSpaces(svgString)
    } else {
        return svgString
    }
}



// Add event listeners to three checkboxes in the modal

const svgOptions = [
    { id: 'remove-opacity',
      stateKey: 'removeOpacity',
      removeFunction: removeOpacity,
      restoreFunction: restoreOpacity },
    { id: 'remove-newlines',
      stateKey: 'removeNewlines',
      removeFunction: removeNewlines,
      restoreFunction: restoreNewlines,
      needsPathMode: true },
    { id: 'remove-spaces',
      stateKey: 'removeSpaces',
      removeFunction: removeSpaces,
      restoreFunction: restoreSpaces }
  ];

function initSvgOptCheckboxes() {
    const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateSvg));
}

function updateSvg() {
    let svgString = getSvgString();

    svgOptions.forEach(option => {
        const checkbox = document.getElementById(option.id);

        // Update visual feedback in the modal
        const beforeElement = document.querySelector(`#before-${option.id}`);
        const afterElement = document.querySelector(`#after-${option.id}`);

        beforeElement.classList.toggle('option-applied', !checkbox.checked);
        afterElement.classList.toggle('option-applied', checkbox.checked);

        // Optimize the SVG text and update the state
        if (checkbox.checked) {
            svgString = option.removeFunction(svgString);
            updateState(option.stateKey, true);
        } else {
            if (option.needsPathMode) {
                const pathMode = getState('pathMode');
                svgString = option.restoreFunction(svgString, pathMode);
            } else {
                svgString = option.restoreFunction(svgString);
            }
            updateState(option.stateKey, false);
        }

        // Update the textarea with optimized text
        document.querySelector('#svg-string').value = svgString
        // Count the size of the updated SVG string and display it on the SVG download button
        countSvgSize(svgString)
    });
}



// Remove and restore functions

function removeOpacity(svgString) {
    return svgString.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '')
}

function restoreOpacity(svgString) {
    return svgString.replace(/(<[^>]*\bstroke="[^"]*")([^>]*>)/g, function(match, p1, p2) {
        if (!/\bopacity=/.test(match) && !/\bstroke-opacity=/.test(match)) {
            return p1 + ' opacity="1.0" stroke-opacity="1.0"' + p2
        } else if (!/\bopacity=/.test(match)) {
            return p1 + ' opacity="1.0"' + p2
        } else if (!/\bstroke-opacity=/.test(match)) {
            return match.replace(/\bopacity="[^"]*"/, '$& stroke-opacity="1.0"')
        }
        return match
    })
}


function removeNewlines(svgString) {
    return svgString.replace(/>\s+</g, '><')
}

function restoreNewlines(svgString, pathMode) {
    const indentCounts = getCurrentPathModeIndentation(pathMode)
    let formattedSvg = svgString.replace(/></g, '>\n<')
    const lines = formattedSvg.split('\n')

    const indentedLines = lines.map((line, index) => {
        const indentCount = indentCounts[index] || 0
        return tabSpace.repeat(indentCount) + line.trim()
    })

    return indentedLines.join('\n')
}

// Get the indentation as numbers in array

function getSvgIndentation(svgString) {
    const lines = svgString.split('\n')
    return lines.map(line => {
        const match = line.match(/^(\s*)/)
        return match ? Math.floor(match[1].length / 4) : 0
    })
}

function getCurrentPathModeIndentation(pathMode) {
    const svgString = decodeAsSelectedPathMode(pathMode)
    return getSvgIndentation(svgString)
}


function removeSpaces(svgString) {
    return svgString
        // 数値と大文字の M|L のあいだの スペースを削除
        .replace(/(\d)\s+([ML])/g, '$1$2')
        // ダブルクォートとスラッシュ のあいだの スペースを削除
        .replace(/"\s+(\/)/g, '"$1')
}

function restoreSpaces(svgString) {
    return svgString
        // 数値と大文字の M|L のあいだに スペースを挿入
        .replace(/(\d)([ML])/g, '$1 $2')
        // ダブルクォートとスラッシュ のあいだに スペースを挿入
        .replace(/"(\/)/g, '" $1')
}



// Bulk apply the optimizations based on current url params states, after 'pathMode' changes.
// It will restore the string to how it looked before the changes.
function optimizeSvg(svgString, state) {
    let optimizedSvg = svgString
    for (const [functionName, isEnabled] of state) {
        if (isEnabled && typeof optimizeFunctions[functionName] === 'function') {
            optimizedSvg = optimizeFunctions[functionName](optimizedSvg)
        }
    }
    return optimizedSvg
}

const optimizeFunctions = {
    removeOpacity,
    removeNewlines,
    removeSpaces
}