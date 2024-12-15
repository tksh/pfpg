import { TAB_SPACE }                 from 'constants'
import { getSvgString }              from 'button/download-as-file'
import { updateButtonWithSvgSize }   from 'button/update-button-text'
import { updateState
       , getState }                  from 'state/url-state-manager'
import { decodeAsSelectedPathMode }  from 'tab-lines/path-mode'

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



// Add event listeners to the three checkboxes in the modal

// Define an array of SVG optimization options
const svgOptions = [
    { id: 'remove-opacity',
      stateKey: 'removeOpacity',
      removeFunction: removeOpacity,
      restoreFunction: restoreOpacity },
    { id: 'remove-line-breaks',
      stateKey: 'removeLineBreaks',
      removeFunction: removeLineBreaks,
      restoreFunction: restoreLineBreaks,
      needsPathMode: true },               // This boolean is required only for restoration.
    { id: 'remove-spaces',
      stateKey: 'removeSpaces',
      removeFunction: removeSpaces,
      restoreFunction: restoreSpaces }
  ]

// Initialize event listeners for SVG optimization checkboxes
function initSvgOptimization() {
    const checkboxes = document.querySelectorAll('#svg-opt-modal input[type="checkbox"]')
    checkboxes.forEach(checkbox => checkbox.addEventListener('change', (event) => {
        updateSvg(event);
    }))
}

// Apply SVG optimizations based on checked/un-checked options
// Update the textarea content, URL parameters, and button text accordingly
function updateSvg(event) {
    let svgString = getSvgString()

    const isChecked = event.target.checked
    const optionId = event.target.id        // e.g.: 'remove-opacity'

    svgOptions.forEach(option => {

        if (optionId === option.id) {  // Identify the currently selected option
            if (isChecked) {
                svgString = option.removeFunction(svgString)
                updateState(option.stateKey, true)

                // Toggle classes for the <code> content text
                document.querySelector(`#before-${optionId}`).classList.toggle('option-applied', !isChecked)
                document.querySelector(`#after-${optionId}`).classList.toggle('option-applied', isChecked)

            } else {
                if (option.needsPathMode) {
                    const pathMode = getState('pathMode')
                    svgString = option.restoreFunction(svgString, pathMode)  // option.restoreFunction
                } else {
                    svgString = option.restoreFunction(svgString)
                }
                updateState(option.stateKey, false)

                // Toggle classes for the <code> content text
                document.querySelector(`#before-${optionId}`).classList.toggle('option-applied', !isChecked)
                document.querySelector(`#after-${optionId}`).classList.toggle('option-applied', isChecked)
            }
        }

        // Update the textarea with optimized SVG
        document.querySelector('#svg-string').value = svgString
        // Display the size of the updated SVG string on the action button
        updateButtonWithSvgSize(svgString)
    })
}


// Remove and restore functions

function removeOpacity(svgString) {
    return svgString.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, '')
}

function restoreOpacity(svgString) {
        return svgString.replace(/<g\b([^>]*)>/g, function(match, attributes) {
        console.log('match: ', match)            // e.g.:  <g stroke="rgb(255,255,255)" opacity="1.0" stroke-opacity="1.0">
        console.log('attributes: ', attributes)  // e.g.:   stroke="rgb(255,255,255)" opacity="1.0" stroke-opacity="1.0"

        // stroke属性があるかチェック
        if (!/\bstroke="[^"]*"/.test(attributes)) {
            return match; // stroke属性がなければ変更しない
        }

        // 既存の属性を解析
        let attrs = attributes.split(/\s+/).filter(attr => attr.trim() !== '')
        console.log('attrs: ', attrs)            // e.g.: (3) ['stroke="rgb(255,255,255)"', 'opacity="1.0"', 'stroke-opacity="1.0"']

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

        console.log('newAttrs: ', newAttrs)      // e.g.: (3) ['stroke="rgb(255,255,255)"', 'opacity="1.0"', 'stroke-opacity="1.0"']
        return `<g ${newAttrs.join(' ')}>`
    })
}
// // Test
// console.log(restoreOpacity('<g stroke="#FF7523">'))
// console.log(restoreOpacity('<g stroke="#FF7523" opacity="1.0">'))
// console.log(restoreOpacity('<g stroke="#FF7523" stroke-opacity="1.0">'))
// console.log(restoreOpacity('<g stroke="#FF7523" opacity="0.5" stroke-opacity="0.8">'))
// console.log(restoreOpacity('<g fill="#FF7523">'))  // 'stroke'属性がない場合 変更しない
//
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0">
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0">
// <g stroke="#FF7523" opacity="1.0" stroke-opacity="1.0">
// <g stroke="#FF7523" opacity="0.5" stroke-opacity="0.8">
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
        return TAB_SPACE.repeat(indentCount) + line.trim()
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
    return svgString.replace(/(\sd="[^>]+>)/g, (match, pathData) => {  // Use \sd= to skip id=

        const optimizedPath = pathData

            // コマンド後のスペース削除
            .replace(/([MLHVCSQTAZ])\s+/gi, '$1')
            // e.g.: <path d="M 12 34 L 56 78" /> => <path d="M12 34 L56 78" />

            // 数字 と コマンド のあいだのスペース削除
            .replace(/(\d)\s+([MLHVCSQTAZ])/gi, '$1$2')
            // e.g.: <path d="M12 34 L56 78" /> => <path d="M12 34L56 78" />

            // 数字 と 負の値の数字 のあいだのスペース削除 (for relative coordinates values)
            .replace(/ -/g, '-')
            // e.g.: <path d="d="m12 3 45 6m-7 89 -10 11"/> => <path d="d="m12 3 45 6m-7 89-10 11"/>

            // ダブルクォート と スラッシュ のあいだのスペース削除
            .replace(/"\s+(\/)/g, '"$1')
            // e.g.: <path d="M12 34L56 78" /> => <path d="M12 34L56 78"/>

        return optimizedPath
    })
}
// // Test
// console.log(removeSpaces('<path d="M 12 34 L 56 78" />'))  // Absolute
// // <path d="M36 61L33 68"/>
// console.log(removeSpaces('<path d="d="m 12 3 45 6 m -7 89 -10 11" />'))  // Relative
// // <path d="d="m12 3 45 6m-7 89-10 11"/>
// console.log(removeSpaces('<path d="M 6.35 63.5 Q 5.08 0 63.5 0 T 120.65 63.5 63.5 127 6.35 63.5" />'))  // Squircle, slimmed
// // <path d="M6.35 63.5Q5.08 0 63.5 0T120.65 63.5 63.5 127 6.35 63.5"/>

function restoreSpaces(svgString) {
    console.log('//// restorSpaces() executed.')
    return svgString.replace(/(\sd="[^>]+>)/g, (match, pathData) => {  // Use \sd= to skip id=

        const restoredPath = pathData

            // コマンド後にスペース挿入
            .replace(/([MLHVCSQTAZ])/gi, '$1 ')

            // 数字 と コマンド のあいだにスペース挿入
            .replace(/(\d)([MLHVCSQTAZ])/gi, '$1 $2')

            // 数字 と 負の値の数字 のあいだにスペース挿入 (for relative coordinates values)
            .replace(/(\d)-/g, '$1 -')

            // ダブルクォート と スラッシュ のあいだにスペース挿入
            .replace(/"(\/)/g, '" $1')

        return restoredPath
    })
}
// // Test
// console.log(restoreSpaces('<path d="M36 61L33 68"/>'))  // Absolute
// // <path d="M 36 61 L 33 68" />
// console.log(restoreSpaces('<path d="d="m12 3 45 6m-7 89-10 11"/>'))  // Relative
// // <path d="d="m 12 3 45 6 m -7 89 -10 11" />
// console.log(restoreSpaces('<path d="M6.35 63.5Q5.08 0 63.5 0T120.65 63.5 63.5 127 6.35 63.5"/>'))  // Squircle, slimmed
// // <path d="M 6.35 63.5 Q 5.08 0 63.5 0 T 120.65 63.5 63.5 127 6.35 63.5" />


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
