import { getInitialOpacitySteps } from 'init/get-initial-opacity-steps'
import { updateState }            from 'init/state'
import { getInputSvg }            from 'download'
import { getSvgIndentation }      from 'svg-opt-modal/svg-opt-modal'


export async function setDefaultValueOfOptions() {
    console.log('setDefaultValueOfOptions(state) executed')

    // SVGのテキストを取得
    const inputSvg = getInputSvg()

    // Get each attrs values, then set it as default
    setDefaultOfPathMode(inputSvg)                      // Path mode selector
    setDefaultOfAntiAlias(inputSvg)                     // Anti-alias selector
    setDefaultOfOpacitySteps(getInitialOpacitySteps())  // Opacity steps selector

}


// Selector: Path mode
function setDefaultOfPathMode(inputSvg) {

    // Find the '<path d= ... M ... L ... >' to detect as 'absolute'
    const pattern = /<path[^>]*d="[^"]*M[^"]*L[^"]*"[^>]*>/g;
    const isAbsolute = pattern.test(inputSvg);

    // Set the 'Path mode' input element value
    if (isAbsolute === true) {
        document.getElementById("path-mode").value = 'absoluteSeparated'
        console.log("Default 'Path mode' is 'Absolute and separated'");
        updateState('pathMode', 'absoluteSeparated')
    } else {
        document.getElementById("path-mode").value = 'relativeMerged'
        console.log("Default 'Path mode' is 'Relative and merged'");
        updateState('pathMode', 'relativeMerged')
    }

    // Save indentation
    updateState('indentByRow', getSvgIndentation(inputSvg))
}


// Selector: Anti-aliasing (On (geometricPrecision) or Off (crispEdges))
function setDefaultOfAntiAlias(inputSvg) {

    // Get the 'shape-rendering' attr value
    const pattern = /shape-rendering="(.*)">/;  // target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="geometricPrecision">
    const matches = pattern.exec(inputSvg);     // exec メソッドでマッチする部分を探す
    console.log('matches(for shape-rendering): ', matches)
    // Array [ 'shape-rendering="geometricPrecision">', "geometricPrecision" ]
    const defaultShapeRendering = matches[1]

    // <select> 要素を取得
    const selectElement = document.getElementById("shape-rendering");

    // <option> 要素の selected 属性を設定する
    for (let i = 0; i < selectElement.options.length; i++) { // <option> 要素をループ
        if (selectElement.options[i].value === defaultShapeRendering) {
            selectElement.options[i].selected = true;  // value が 変更したい値 defaultShapeRendering と 同じならば selected を 付ける
        } else {
            selectElement.options[i].selected = false; // value が 変更したい値 defaultShapeRendering と 違うならば selected を 付けない
        }
    }

    console.log(`Default 'shape-rendering' value is "${defaultShapeRendering}"`)
}


// Number and Range input: Width pixel size
function setDefaultOfOpacitySteps(opacitySteps) {

    // Set as default value
    document.getElementById("opacity-steps").value = opacitySteps

    // Update the global state Map object
    updateState('opacitySteps', opacitySteps)

    console.log(`Default 'Opacity steps' value is "${opacitySteps}"`)
}
