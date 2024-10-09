import { getSvgString
       , countSvgSize } from 'download'
import { updateState
       , getState }     from 'state/settings-defaults'
import { tabSpace }     from 'constants'
import { decodeAsSelectedPathMode }  from 'tab-lines/path-mode'

export
    { initSvgOptCheckbox
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


// For 'applySvgOptimization()' to init

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


// Add event listeners to checkboxes

function initSvgOptCheckbox() {
    const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]')

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSvg)
    })

    function updateSvg() {
        const svgStringElement = document.querySelector('#svg-string')
        let svg = getSvgString()

        if (document.getElementById('remove-opacity').checked) {
            svg = removeOpacity(svg)
            updateState('removeOpacity', true)
        } else {
            svg = restoreOpacity(svg)
            updateState('removeOpacity', false)
        }

        if (document.getElementById('remove-newlines').checked) {
            svg = removeNewlines(svg)
            updateState('removeNewlines', true)
        } else {
            const pathMode = getState('pathMode')
            svg = restoreNewlines(svg, pathMode)
            updateState('removeNewlines', false)
        }

        if (document.getElementById('remove-spaces').checked) {
            svg = removeSpaces(svg)
            updateState('removeSpaces', true)
        } else {
            svg = restoreSpaces(svg)
            updateState('removeSpaces', false)
        }

        // Update the textarea
        svgStringElement.value = svg

        // Count the size of the updated SVG string and display it on the SVG download button
        countSvgSize(svg)
    }
}


// Remove and restore functions

function removeOpacity(svg) {
    return svg.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '')
}

function restoreOpacity(svg) {
    return svg.replace(/(<[^>]*\bstroke="[^"]*")([^>]*>)/g, function(match, p1, p2) {
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


function removeNewlines(svg) {
    return svg.replace(/>\s+</g, '><')
}

function restoreNewlines(svg, pathMode) {
    const indentCounts = getCurrentPathModeIndentation(pathMode)
    let formattedSvg = svg.replace(/></g, '>\n<')
    const lines = formattedSvg.split('\n')

    const indentedLines = lines.map((line, index) => {
        const indentCount = indentCounts[index] || 0
        return tabSpace.repeat(indentCount) + line.trim()
    })

    return indentedLines.join('\n')
}

// Get the indentation as numbers in array

function getSvgIndentation(svg) {
    const lines = svg.split('\n')
    return lines.map(line => {
        const match = line.match(/^(\s*)/)
        return match ? Math.floor(match[1].length / 4) : 0
    })
}

function getCurrentPathModeIndentation(pathMode) {
    const svgString = decodeAsSelectedPathMode(pathMode)
    return getSvgIndentation(svgString)
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



// Bulk apply the optimizations based on current url params states, after 'pathMode' changes.
// It will restore the string to how it looked before the changes.
function optimizeSvg(svg, state) {
    let optimizedSvg = svg
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