import { getInputSvg } from 'download'
import { getInitialOpacitySteps } from 'init/get-initial-opacity-steps'
import { getState
    , updateState } from 'state/state-as-map-obj'


export async function setDefaultValueOfOptions() {
    console.log('setDefaultValueOfOptions(state) executed')

    // SVGのテキストを取得
    const inputSvg = getInputSvg()

    // Get each attrs values, then set it as default
    setDefaultOfPathMode(inputSvg)                              // Path mode
    setDefaultOfColorFormat()                              // Color format
    setDefaultOfAntiAliasing(inputSvg)                          // Anti-aliasing (shape-rendering)
    setDefaultOfOpacitySteps(getInitialOpacitySteps(inputSvg))  // Opacity steps
}


// Selector: Path mode
function setDefaultOfPathMode(inputSvg) {

    let isAbsolute

    // Get the value via svg string, if url param not exists
    if (!getState('pathMode')) {
        // Find the '<path d= ... M ... L ... >' to detect as 'absolute'
        const pattern = /<path[^>]*d="[^"]*M[^"]*L[^"]*"[^>]*>/g
        isAbsolute = pattern.test(inputSvg)
    } else {
        isAbsolute = getState('pathMode') === 'absoluteSeparated'
    }

    // Set the 'Path mode' input element value
    if (isAbsolute === true) {
        document.getElementById("path-mode").value = 'absoluteSeparated'
        console.log("Default 'Path mode' is 'Absolute and separated'")
        updateState('pathMode', 'absoluteSeparated')
    } else {
        document.getElementById("path-mode").value = 'relativeMerged'
        console.log("Default 'Path mode' is 'Relative and merged'")
        updateState('pathMode', 'relativeMerged')
    }
}

// Selector: Color-format
function setDefaultOfColorFormat() {
    const colorFormat = getState('colorFormat') ? getState('colorFormat') : 'rgb'
    document.getElementById("color-format").value = colorFormat
}

// Selector: Anti-aliasing (On (geometricPrecision) or Off (crispEdges))
function setDefaultOfAntiAliasing(inputSvg) {

    // Get the 'shape-rendering' attr value
    const pattern = /shape-rendering="(.*)">/  // target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="geometricPrecision">
    const matches = pattern.exec(inputSvg)     // exec メソッドでマッチする部分を探す
    //console.log('matches(for shape-rendering): ', matches)
    // Array [ 'shape-rendering="geometricPrecision">', "geometricPrecision" ]
    const shapeRendering = matches[1]

    // <select> 要素を取得
    const selectElement = document.getElementById("shape-rendering")

    // <option> 要素の selected 属性を設定する
    for (let i = 0; i < selectElement.options.length; i++) { // <option> 要素をループ
        if (selectElement.options[i].value === shapeRendering) {
            selectElement.options[i].selected = true  // value が 変更したい値 shapeRendering と 同じならば selected を 付ける
        } else {
            selectElement.options[i].selected = false // value が 変更したい値 shapeRendering と 違うならば selected を 付けない
        }
    }

    // Update the state as url params
    updateState('shapeRendering', shapeRendering)

    console.log(`Default 'shape-rendering' value is "${shapeRendering}"`)
}


// Number and Range input: Width pixel size
function setDefaultOfOpacitySteps(opacitySteps) {

    // Set the default value of html element
    document.getElementById("opacity-steps").value = opacitySteps

    // Update the state as url params
    updateState('opacitySteps', opacitySteps)

    console.log(`Default 'Opacity steps' value is "${opacitySteps}"`)
}
