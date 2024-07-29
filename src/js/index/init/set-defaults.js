import { getInitialOpacitySteps } from './get-initial-opacity-steps.js'
import { getInputSvg }            from '../download.js'

export async function setDefaultValueOfOptions() {
    console.log('setDefaultValueOfOptions() executed')

    // SVGのテキストを取得
    const inputSvg = getInputSvg()

    // Get each attrs values, then set it as default
    setDefaultOfPathMode(inputSvg)  // Path mode selector
    setDefaultOfBaseColor(inputSvg) // Base color picker
    setDefaultOfAntiAlias(inputSvg) // Anti-alias selector
    setDefaultOfOpacitySteps()      // Opacity steps

    // Selector: Path mode
    function setDefaultOfPathMode(inputSvg) {

        // Find the '<path d= ... M ... L ... >' to detect as 'absolute'
        const pattern = /<path[^>]*d="[^"]*M[^"]*L[^"]*"[^>]*>/g;
        const isAbsolute = pattern.test(inputSvg);

        // Set the 'Path mode' input element value
        if (isAbsolute === true) {
            document.getElementById("path-mode").value = 'absoluteSeparated'
            console.log("Default 'Path mode' is 'Absolute and separated'");
        } else {
            document.getElementById("path-mode").value = 'Relative and merged'
            console.log("Default 'Path mode' is 'relativeMerged'");
        }

    }

    // Color-picker: Base color (base rect fill color)
    function setDefaultOfBaseColor(inputSvg) {

        // Get the base color (rect fill) hex code

        const pattern = /<rect width="[^"]+" height="[^"]+" fill="([^"]+)"/g; // e.g.: <<rect width="255" height="255" fill="#fff9">
        const matches = pattern.exec(inputSvg);                               // exec メソッドでマッチする部分を探す
        console.log('matches(rect fill): ', matches)
        // Array
        // 0: '<rect width="255" height="255" fill="#ccc"'
        // 1: "#ccc"

        // [1]の hex-code部分を 透明度を補完して 8桁のフォーマットに直す
        const eightDigitsHexWithHash = '#' + hexExpandToEight(matches[1])


        // Set as new value for <input>

        // Base color picker の input要素を 取得
        const inputElement = document.getElementById("base-rect-color-picker");

        // Creating new picker instance
        new JSColor('#base-rect-color-picker', {format:'hexa'}); // Force to visible the alpha slider even if value hasn't it.

        // input要素のvalue属性に新しい値を設定
        inputElement.value = eightDigitsHexWithHash;

        console.log(`Default 'Base color' value is "${eightDigitsHexWithHash}"`)
    }


    // Selector: Anti-aliasing (On (geometricPrecision) or Off (crispEdges))
    function setDefaultOfAntiAlias(inputSvg) {

        // Get the 'shape-rendering' attr value
        const pattern = /shape-rendering="(.*)">/; // target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="geometricPrecision">
        const matches = pattern.exec(inputSvg); // exec メソッドでマッチする部分を探す
        console.log('matches(for shape-rendering): ', matches)
        // Array [ 'shape-rendering="geometricPrecision">', "geometricPrecision" ]
        const defaultShapeRendering = matches[1]

        // <select> 要素を取得
        const selectElement = document.getElementById("shape-rendering");

        // <option> 要素の selected 属性を設定する
        for (let i = 0; i < selectElement.options.length; i++) { // <option> 要素をループ
            if (selectElement.options[i].value === defaultShapeRendering) {
                selectElement.options[i].selected = true; // value が 変更したい値 defaultShapeRendering と 同じならば selected を 付ける
            } else {
                selectElement.options[i].selected = false; // value が 変更したい値 defaultShapeRendering と 違うならば selected を 付けない
            }
        }

        console.log(`Default 'shape-rendering' value is "${defaultShapeRendering}"`)
    }


    // Number and Range input: Width pixel size
    function setDefaultOfOpacitySteps() {

        // Get initial opacity steps detected from original decoded SVG
        const steps = getInitialOpacitySteps() // Number, 0.2 | 0.1 | 0.04

        // Set as default value
        document.getElementById("opacity-steps").value = steps

        console.log(`Default 'Opacity steps' value is "${steps}"`)
    }

}