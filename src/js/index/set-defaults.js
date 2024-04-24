setDefaultsForPreference()

function setDefaultsForPreference() {
    console.log('setDefaultsForPreference() executed')

    // SVGのテキストを取得
    const inputSVG = getInputSvg()

    setDefaultForBaseColorPicker(inputSVG)
    setDefaultForAntiAliasSelector(inputSVG)
    setDefaultForWidth(inputSVG)

    // Color-picker: Base color (base rect fill color)
    function setDefaultForBaseColorPicker(inputSVG) {

        // Get the base color hex code
        const pattern = /<rect width="100%" height="100%" fill="(.*)"/g; // <<rect width="100%" height="100%" fill="#fff9"> is default base rect color
        const matches = pattern.exec(inputSVG); // exec メソッドでマッチする部分を探す
        console.log('matches(rect fill): ', matches)
        // Array
        // 0: '<rect width="100%" height="100%" fill="#ccc"'
        // 1: "#ccc"
        // [1]の hexcode部分を 透明度を加えて 8桁のフォーマットに直して 新しい値 として設定
        const eightDigitsHex = mergeOpacityAndExtended(matches[1])
        console.log('eightDigitsHex: ', eightDigitsHex)

        // Set as new value for <input>

        // Base color picker の input要素を 取得
        const inputElement = document.getElementById("base-rect-color-picker");
        // input要素のvalue属性に新しい値を設定
        inputElement.value = eightDigitsHex;
        // The specified value "#99999999" does not conform to the required format.  The format is "#rrggbb" where rr, gg, bb are two-digit hexadecimal numbers.

        console.log(`Default base color value is "${eightDigitsHex}"`)
    }


    // Selector: Anti-aliasing (On (geometricPrecision) or Off (crispEdges))
    function setDefaultForAntiAliasSelector(inputSVG) {

        // Get the 'shape-rendering' attr value
        const pattern = /shape-rendering="(.*)">/; // target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="geometricPrecision">
        const matches = pattern.exec(inputSVG); // exec メソッドでマッチする部分を探す
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

        console.log(`Default shape-rendering value is "${defaultShapeRendering}"`)
    }


    // Number and Range: Width to render
    function setDefaultForWidth(inputSVG) {

        // viewBox属性の値から最後の数字を抽出する正規表現
        const pattern = /viewBox="\d+\s+\d+\s+\d+\s+(\d+)"/;
        const matches = pattern.exec(inputSVG); // exec メソッドでマッチする部分を探す
        console.log('matches(for width): ', matches[1]) // e.g: 255
        const gridSize = matches[1]

        // `Width:` の初期設定サイズを グリッドサイズ にする
        const sizeInputElement = document.getElementById("png-size-number");
        sizeInputElement.value = gridSize
        console.log(`Default grid size value is "${gridSize}"`)
    }

}