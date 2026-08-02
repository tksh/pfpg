import { getSvgString }   from 'button/download-as-file'
import { svg2pngOption }  from 'state/resvg-option'
import { updateState }    from 'state/url-state-manager'
import { executeSvg2png } from 'svg-to-png'


export
    { initShapeRenderingSelect
    , replaceShapeRendering
    }

function initShapeRenderingSelect() {

    // Event listeners for 'shape-rendering' type changes
    document.getElementById("shape-rendering").addEventListener("change", (event) => {
        // 選択された値を 取得
        const shapeRendering = event.target.value // 'geometricPrecision' | 'crispEdges'
        console.log("Updated value of 'Anti-aliasing (shape-rendering)': ", shapeRendering)
        updateState('shapeRendering', shapeRendering)

        // <textarea>の value属性を 取得
        const svgString = getSvgString()

        // 選択された値に SVG文字列を 置き換える
        const updatedSvg = replaceShapeRendering(svgString, shapeRendering)

        // <textarea>の value属性を 更新する
        document.querySelector('#svg-string').value = updatedSvg

        // Rendering the PNG with updated SVG
        executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption)
    })

}

function replaceShapeRendering(svgString, shapeRendering) {
    // 正規表現パターンを作成
    const patternForShapeRendering = /shape-rendering="[^"]*"/g
    // 正規表現でマッチした部分を書き換える
    return svgString.replace(patternForShapeRendering, `shape-rendering="${shapeRendering}"`)
}
