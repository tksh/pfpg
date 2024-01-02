//function generateSvgInStyleOfSelectedScope(selectedTransScope, inputSVG) {
//
//    // RegEx pattern to capture <g stroke="#000000" opacity="0.4" stroke-opacity="1"> or <g stroke="#000000" opacity="0.4"> or <g stroke="#000000">
//    // stroke属性, opacity属性, stroke-opacity属性 が有っても無くても <g>全体を抽出する
//    const pattern = /<g stroke=.*>/g;
//
//    // パターンにマッチする部分全てを配列に追加
//    const currentScopeGroupElem = inputSVG.match(pattern); // matchメソッドで配列を返す
//    console.log('currentScopeGroupElem: ', currentScopeGroupElem)
//    // opacity, stroke-opacity が有る場合:
//    //    0: "<g stroke=\"#000000\" opacity=\"1\" stroke-opacity=\"1\">"
//    //    1: "<g stroke=\"#000000\" opacity=\"1\" stroke-opacity=\"1\">"
//
//    const matches2 = currentScopeGroupElem.map((elem) => {
//        //console.log('elem: ', elem) // '<g stroke="#000">' or `<g stroke="#000" opacity="0.4">`
//        //const pattern2 = /stroke="([^"]+)"\s*(?:opacity="([^"]+)")?/g;
//        //const pattern2 = /<g stroke="([^"]+)"\s*(?:opacity="([^"]+)")?\s*>/g;
//        const pattern2 = /<g stroke="([^"]+)"\s*(?:opacity="([^"]+)")?\s*(?:stroke-opacity="([^"]+)")?\s*>/g;
//        const matches2 = pattern2.exec(elem); // exec メソッドでマッチする部分を探す
//        console.log(`matches2: `, matches2);
//        // opacityが無い場合: Array(3) [ 'stroke="#000"', "#000", undefined ]
//        // opacityが有る場合: Array(3) [ 'stroke="#000" opacity="0.4"', "#000", "0.4" ]
//        // opacityが有る場合も無い場合も インデックス[1] が 'stroke'のHexコード
//        // opacityが無い場合には インデックス[2] の 'opacity'の数値 が 'undefined' になる
//        return matches2
//    });
//    console.log(`matches2: `, matches2);
//    // matches2: [1]=stroke, [2]=opacity, [3]=stroke-opacity
//    // 0: (4) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '#000000', '1', '1', index: 0, input: '<g stroke="#000000" opacity="1" stroke-opacity="1">', groups: undefined]
//    // 1: (4) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '#000000', '1', '1', index: 0, input: '<g stroke="#000000" opacity="1" stroke-opacity="1">', groups: undefined]
//
//    // 選択された scope ('whole-group' or 'per-stroke') に合わせて それぞれの <g>タグを生成する
//    const newScopeGroupElemArray = matches2.map(
//        (eachColorMatches) => generateGroupElemInStyleOfSelectedScope(selectedTransScope, eachColorMatches)
//    )
//    console.log('newScopeGroupElemArray: ', newScopeGroupElemArray)
//    // whole-group selected: Array(3) [ '<g stroke="#000000" opacity="1.0">', '<g stroke="#EEEEEE" opacity="1.0">', '<g stroke="#FFFFFF" opacity="1.0">' ]
//    // per-stroke selected:  Array(3) [ '<g stroke="#000000FF">', '<g stroke="#EEEEEEFF">', '<g stroke="#FFFFFFFF">' ]
//
//    // 新しい Transparency scope の <g stroke ...> を 現在のSVG文字列全体から探して 置換する
//    const updatedSVG = replacePlaceholders(inputSVG, newScopeGroupElemArray);
//    //console.log('updatedSVG: ', updatedSVG);
//
//    return updatedSVG;
//}

//// 選択されたscope ('whole-group' or 'per-stroke') に合わせて それぞれの <g>タグを生成する
//function generateGroupElemInStyleOfSelectedScope(scope, matches) {
//    console.log('matches: ', matches) // Array(3) [ undefined, "#FF882A", 1, 1 ]
//
//    if (scope === 'whole-group') { // with 'opacity'
//
//        const color = splitOpacityAndExtended(matches[1], matches[2], matches[3]) // stroke, opacity, stroke-opacity
//        console.log('color: ', color)
//        // Array(3) [ undefined, (透明度の無い'#'付きのHex7文字), (opacity の数値 or undefined), (stroke-opacity の数値 or undefined) ]
//        //      (3) [undefined, '#000000', '1', '1']
//        const opacity = color[2] !== undefined ? color[2] : "1"; // opacity が明示的に指定されていない場合は1.0とみなす
//        const strokeOpacity = color[3] !== undefined ? color[3] : "1"; // strokeOpacity が明示的に指定されていない場合は1.0とみなす
//        const newScopeGroupElem = `<g stroke="${color[1]}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`
//        console.log('newScopeGroupElem: ', newScopeGroupElem) // <g stroke="#000000" opacity="1">
//        return newScopeGroupElem
//
//    } else if (scope === 'per-stroke') { // without 'opacity' but opacity values are convert into hex 7,8 chars
//
//        const color = mergeOpacityAndExtended(matches[1], matches[2])
//        //console.log('color; ', color)
//        const newScopeGroupElem = `<g stroke="${color}">`
//        //console.log('newScopeGroupElem: ', newScopeGroupElem) // <g stroke="#000000FF">
//        return newScopeGroupElem
//    }
//}


//// 新しい Transparency scope の <g stroke ...> を 現在のSVG文字列全体から探して 置換する
//function replacePlaceholders(input, replacements) {
//    let resultString = input;
//    let replacementIndex = 0;
//
//    // プレースホルダーを探す
//    const placeholderPattern = /<g stroke=.*>/g;
//    const placeholders = input.match(placeholderPattern);
//
//    if (placeholders) {
//        // プレースホルダーを置換
//        placeholders.forEach((placeholder) => {
//            if (replacementIndex < replacements.length) {
//                resultString = resultString.replace(placeholder, replacements[replacementIndex]);
//                replacementIndex++;
//            }
//        });
//    }
//
//    return resultString;
//}

// Convet the stroke color format

// For Converting from Per-stroke to whole-group
// '#'無しの hexを受け取って 'matches'の構造と同じ 3つの要素の配列 で返す

function splitHexAndOpacity(hexColor) {
    // 16進数から透明度情報を抽出し、10進数に変換
    const opacityHex = hexColor.slice(-2);
    const opacityDecimal = parseInt(opacityHex, 16);

    // 0から255の範囲を0から1の範囲に変換
    const opacityNormalized = opacityDecimal / 255;
    // 小数点以下2位までに丸める
    const opacityRounded = roundToTwoDecimals(opacityNormalized)

    // 透明度無しの 色情報のみの部分(6桁) を抽出
    const colorHex = hexColor.slice(0, 6)
    return [undefined, '#' + colorHex.toUpperCase(), opacityRounded];
}
// console.log(splitHexAndOpacity('ffffff')) // Array(3) [ undefined, "#FFFFFF", 1 ]
// console.log(splitHexAndOpacity('000000')) // Array(3) [ undefined, "#000000", 0 ]
// console.log(splitHexAndOpacity('ffffffff')) // Array(3) [ undefined, "#FFFFFF", 1 ]
// console.log(splitHexAndOpacity('00000000')) // Array(3) [ undefined, "#000000", 0 ]
// console.log(splitHexAndOpacity('12345678')) // Array(3) [ undefined, "#123456", 0.47 ]
// console.log(splitHexAndOpacity('00000001')) // Array(3) [ undefined, "#000000", 0 ]
// console.log(splitHexAndOpacity('00000001')) // Array(3) [ undefined, "#000000", 0.01 ]



// For Converting from whole-group to Per-stroke

// 0から1の範囲に正規化された数値を引数として受け取る関数
function normalizedToHex(num) {
    // 数値が0から1の範囲にあるかチェックする
    if (num < 0 || num > 1) {
        // 範囲外であればエラーを返す
        return "Invalid number";
    }
    // 数値を255倍して整数にする
    const int = Math.round(num * 255);
    // 整数を16進数に変換する
    const hex = int.toString(16);
    // 16進数が一桁の場合は先頭に0を付ける
    const padded = hex.length === 1 ? "0" + hex : hex;
    // 大文字に変換して返す
    return padded.toUpperCase();
}

// // テスト用の数値
// // 関数を呼び出して結果を表示する
// console.log(normalizedToHex(1)); // FF
// console.log(normalizedToHex(0.8)); // CC
// console.log(normalizedToHex(0.01)); // 03
// console.log(normalizedToHex(0)); // 00

