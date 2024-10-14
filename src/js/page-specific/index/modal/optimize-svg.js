import { tabSpace }                 from 'constants'
import { getSvgString
       , countSvgSize}              from 'download'
import { updateState
       , getState}                  from 'state/url-state-manager'
import { decodeAsSelectedPathMode } from 'tab-lines/path-mode'

export
    { initSvgOptimization
    , getSvgIndentation
    , getCurrentPathModeIndentation
    , removeOpacity
    , removeLineBreaks
    , removeSpaces
    , optimizeSvg
    , tryRemoveOpacity
    , tryRemoveLineBreaks
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
function tryRemoveLineBreaks(svgString, isLineBreaksRemoved) {
    console.log('tryRemoveLineBreaks executed.')
    if (isLineBreaksRemoved) {
        return removeLineBreaks(svgString)
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
    { id: 'remove-line-breaks',
      stateKey: 'removeLineBreaks',
      removeFunction: removeLineBreaks,
      restoreFunction: restoreLineBreaks,
      needsPathMode: true },
    { id: 'remove-spaces',
      stateKey: 'removeSpaces',
      removeFunction: removeSpaces,
      restoreFunction: restoreSpaces }
  ]

function initSvgOptimization() {
    const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]')
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', updateSvg))
}

function updateSvg() {
    let svgString = getSvgString()

    svgOptions.forEach(option => {
        const checkbox = document.getElementById(option.id)

        // Update visual feedback in the modal
        const beforeElement = document.querySelector(`#before-${option.id}`)
        const afterElement = document.querySelector(`#after-${option.id}`)

        beforeElement.classList.toggle('option-applied', !checkbox.checked)
        afterElement.classList.toggle('option-applied', checkbox.checked)

        // Optimize the SVG text and update the state
        if (checkbox.checked) {
            svgString = option.removeFunction(svgString)
            updateState(option.stateKey, true)
        } else {
            if (option.needsPathMode) {
                const pathMode = getState('pathMode')
                svgString = option.restoreFunction(svgString, pathMode)
            } else {
                svgString = option.restoreFunction(svgString)
            }
            updateState(option.stateKey, false)
        }

        // Update the textarea with optimized text
        document.querySelector('#svg-string').value = svgString
        // Count the size of the updated SVG string and display it on the SVG download button
        countSvgSize(svgString)
    })
}



// Remove and restore functions

function removeOpacity(svgString) {
    return svgString.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '')
}

function restoreOpacity(svgString) {
    return svgString.replace(/<g\b([^>]*)>/g, function(match, attributes) {
        // stroke属性があるかチェック
        if (!/\bstroke="[^"]*"/.test(attributes)) {
            return match; // stroke属性がなければ変更しない
        }

        // 既存の属性を解析
        let attrs = attributes.split(/\s+/).filter(attr => attr.trim() !== '')
        let opacityValue = "1.0"
        let strokeOpacityValue = "1.0"
        let newAttrs = []

        // 既存の属性を処理し、opacity と stroke-opacity の値を取得
        for (let attr of attrs) {
            if (attr.startsWith('opacity="')) {
                opacityValue = attr.split('"')[1]
            } else if (attr.startsWith('stroke-opacity="')) {
                strokeOpacityValue = attr.split('"')[1]
            } else {
                newAttrs.push(attr)
            }
        }

        // opacity と stroke-opacity を追加
        newAttrs.push(`opacity="${opacityValue}"`)
        newAttrs.push(`stroke-opacity="${strokeOpacityValue}"`)

        return `<g ${newAttrs.join(' ')}>`
    })
}
// // テスト
// console.log(restoreOpacity('<g stroke="#FF7523">'))
// console.log(restoreOpacity('<g stroke="#FF7523" opacity="1.0">'))
// console.log(restoreOpacity('<g stroke="#FF7523" stroke-opacity="1.0">'))
// console.log(restoreOpacity('<g stroke="#FF7523" opacity="0.5" stroke-opacity="0.8">'))
// console.log(restoreOpacity('<g fill="#FF7523">'))  // stroke属性がない場合
//
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0"> debugger eval code:34:9
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0"> debugger eval code:35:9
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0"> debugger eval code:36:9
// <g stroke="#FF7523" opacity="0.5" stroke-opacity="0.8"> debugger eval code:37:9
// <g fill="#FF7523">



function removeLineBreaks(svgString) {
    return svgString.replace(/>\s+</g, '><')
}

function restoreLineBreaks(svgString, pathMode) {
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
    removeLineBreaks,
    removeSpaces
}