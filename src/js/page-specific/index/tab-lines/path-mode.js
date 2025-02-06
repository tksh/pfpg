import { getSvgString }            from 'button/download-as-file'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }          from 'decode/decode'
import { optimizeSvg}              from 'modal/optimize-svg'
import { resvgOption }             from 'state/resvg-option'
import { getState
       , updateState }             from 'state/url-state-manager'
import { executeSvg2png }          from 'svg-to-png'
import { replaceAtIndex }          from 'utils/replace-at-index'

export
    { initPathModeSelect
    , decodeAsSelectedPathMode
    }


function initPathModeSelect() {

    //  Event listeners for 'Path mode' selection changes
    document.getElementById("path-mode").addEventListener("change", async (event) => {

        // 現在の設定の値を保存しておく

        // Get the SVG string value
        const currentPathModeSvg = getSvgString()


        // Lines tab

        // Group colors
        const patternGroupColors = /<g[^>]*stroke=[^>]*>/g
        const matchOfGroupColors = currentPathModeSvg.match(patternGroupColors)
        console.log('matchOfGroupColors: ', matchOfGroupColors)
        // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="# ...


        // Opacity steps の選択肢の値は svgのコンテンツではなく UIのみに関わるので 保存しておいて元に戻す 必要はない


        // Canvas tab

        // Shape to trim
        const patternShapeToTrim = /<clipPath id="shape-to-trim">[^>]*>/g
        const matchOfShapeToTrim = currentPathModeSvg.match(patternShapeToTrim)
        const valueOfShapeToTrim = matchOfShapeToTrim[0]   // 'square' | 'circle' | 'squircle' | 'squircle, slimmed'
        // viewBox (for 'Crop side margins' checked.)
        const patternViewbox = /viewBox="[^"]*"/
        const matchOfViewbox = currentPathModeSvg.match(patternViewbox)
        const valueOfViewbox = matchOfViewbox[0]           // e.g.: viewBox="1.55 0 27.9 31"


        // Render tab

        // Anti-aliasing (shape-rendering)
        const patternShapeRendering = /shape-rendering="[^"]*"/g
        const matchOfShapeRendering = currentPathModeSvg.match(patternShapeRendering)
        const valueOfShapeRendering = matchOfShapeRendering[0]  // 'shape-rendering="geometricPrecision"' | 'shape-rendering="crispEdges"'



        // 選択された 'Path mode'の値を 取得
        const pathMode = event.target.value  // 'relativeMerged' | 'absoluteSeparated'
        console.log(`"${pathMode}" selected.`)

        // Re-decode as new 'Path mode' styled svg string from url params
        const newPathModeSvg = decodeAsSelectedPathMode(pathMode)

        // レンダリングし直す前に 保存しておいた 設定の値を 元に戻す

        // Anti-alias, Base color, Shape to trim, viewBox
        const recoverShapeRendering = recoverCurrentOptionValue(newPathModeSvg, patternShapeRendering, valueOfShapeRendering)
        const recoverShapeToTrim    = recoverCurrentOptionValue(recoverShapeRendering, patternShapeToTrim, valueOfShapeToTrim)
        const recoverViewbox        = recoverCurrentOptionValue(recoverShapeToTrim, patternViewbox, valueOfViewbox)
        const updatedSvg            = recoverCurrentGroupColorsValues(recoverViewbox, patternGroupColors, matchOfGroupColors)
        console.log('updatedSvg: ', updatedSvg)

        // Update the state
        updateState('pathMode', pathMode)

        // 保存しておいた設定の値を 全て元に戻した 新しいSVG文字列 を
        // SVG最適化モーダルウィンドウでの 3つのチェックボックスの状態に応じた形にしてから
        // <textarea>のvalue属性に 挿入する

        // Optimize the SVG string using current three checkboxes status
        const svgOptState = new Map([
            ['removeOpacity',  getState('removeOpacity') ],      // SVG optimization modal
            ['removeLineBreaks', getState('removeLineBreaks')],  // SVG optimization modal
            ['removeSpaces',   getState('removeSpaces')  ],      // SVG optimization modal
        ])
        const optimizedSvg = optimizeSvg(updatedSvg, svgOptState)

        // Update the textarea content
        document.querySelector('#svg-string').value = optimizedSvg

        // // Rendering the PNG with updated SVG
        executeSvg2png({ target: { value: updatedSvg } }, resvgOption)
    })

}


// 選択された path-mode で url params から デコードし直す
function decodeAsSelectedPathMode(pathMode) {
    if (pathMode === 'relativeMerged') {
        console.log('Path mode: Relative and merged')
        const isRelative = true
        return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    } else { // (pathMode === 'absoluteSeparated')
        console.log('Path mode: Absolute and separated')
        const isRelative = false
        return decodeUrlToSvg(isRelative, isOnDataManipulatorPage())
    }
}

// Recover the option values like
//  - Anti-aliasing
//  - Base color
//  - Shape to trim

function recoverCurrentOptionValue(svgString, regexPattern, valueString) {
    return svgString.replace(regexPattern, valueString)
}


// Recover the group colors values like
//   - stroke
//   - opacity
//   - stroke-opacity

function recoverCurrentGroupColorsValues(svgString, regexPattern, regexMatches) {
    let recoveredSvgString = svgString
    for (let gId = 0; gId < regexMatches.length; gId++) {
        const colorsValues = regexMatches[gId]
        recoveredSvgString = replaceAtIndex(recoveredSvgString, regexPattern, colorsValues, gId)
    }
    return recoveredSvgString
}
