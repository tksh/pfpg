setDefaultsForPreference()

function setDefaultsForPreference() {
    console.log('setDefaultsForPreference() executed')

    // SVGのテキストを取得
    const inpuSVG = getInputSvg()

    setDefaultForRectColorPicker(inpuSVG)
    setDefaultForAntialiasSelector(inpuSVG)
    setDefaultForWidth(inpuSVG)
//    setDefaultForTransparencyScopeSelector(inpuSVG)


    // Functions to set default value that detect from input svg

//    function setDefaultForTransparencyScopeSelector(inpuSVG) {
//
//        // Check first <g> element has 'opacity' or not
//        const pattern = /<g stroke="([^"]+)"\s*(?:opacity="([^"]+)")?\s*>/;
//        const matches = pattern.exec(inpuSVG); // exec メソッドでマッチする部分を探す
//        console.log(`matches: `, matches); // Array(3) [ '<g stroke="#000">', "#000", undefined ]
//
//        // Set default transparency scope
//        const transparencyScopeSelectorElement = document.getElementById('transparency-scope')
//        if (matches[2] === undefined) {
//            transparencyScopeSelectorElement.value = 'per-stroke'
//            console.log(`Default transparency scope value is "per-stroke"`)
//        } else {
//            transparencyScopeSelectorElement.value = 'whole-group'
//            console.log(`Default transparency scope value is "whole-group"`)
//        }
//    }

    // Color-picker: Background color (background rect color)
    function setDefaultForRectColorPicker(inpuSVG) {

        // Get the background color hex code
        // 正規表現パターンを作成
        const pattern = /<rect width="100%" height="100%" fill="(.*)"/g; // <<rect width="100%" height="100%" fill="#fff9"> is default background rect color
        // パターンにマッチする部分をすべて探す
        //const match = inpuSVG.match(pattern); // Array [ '<rect width="100%" height="100%" fill="#ccc"' ]
        const matches = pattern.exec(inpuSVG); // exec メソッドでマッチする部分を探す
        console.log('matches(rect fill): ', matches)
        // Array
        // 0: '<rect width="100%" height="100%" fill="#ccc"'
        // 1: "#ccc"
        // [1]の hexcode部分を 透明度を加えて 8桁のフォーマットに直して 新しい値 として設定
        const eightDigitsHex = mergeOpacityAndExtended(matches[1])
        console.log('eightDigitsHex: ', eightDigitsHex)

        // Set as new value for <input>

        // Background color picker の input要素を 取得
        const inputElement = document.getElementById("rect-color-picker");
        // input要素のvalue属性に新しい値を設定
        inputElement.value = eightDigitsHex;

        console.log(`Default background color value is "${eightDigitsHex}"`)
    }


    // Selector: Anti-aliasing (On (geometricPrecision) or Off (crispEdges))
    function setDefaultForAntialiasSelector(inpuSVG) {

        // Get the 'shape-rendering' attr value
        // 正規表現パターンを作成
        const pattern = /shape-rendering="(.*)">/; // target: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="geometricPrecision">
        const matches = pattern.exec(inpuSVG); // exec メソッドでマッチする部分を探す
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
    function setDefaultForWidth(inpuSVG) {

        // 正規表現パターンを作成
        // viewBox属性の値から最後の数字を抽出する正規表現
        const pattern = /viewBox="\d+\s+\d+\s+\d+\s+(\d+)"/;
        const matches = pattern.exec(inpuSVG); // exec メソッドでマッチする部分を探す
        console.log('matches(for width): ', matches[1]) //  255
        const gridSize = matches[1]

        // `Width:` の初期設定サイズを グリッドサイズ にする
        const sizeInputElement = document.getElementById("png-size-number");
        sizeInputElement.value = gridSize
        console.log(`Default grid size value is "${gridSize}"`)
    }

}