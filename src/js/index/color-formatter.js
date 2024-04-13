// Convert the strokes group color format

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



// Merge the hex and opacity, and extended if in short style
// For: transparency-scope = per-stroke
// 'opacity' values are convert into hex 7,8 chars
function mergeOpacityAndExtended(hexCodeInput, opacityValueInput) {

    let hexcode = hexCodeInput.slice(1); // `#`記号 を除く文字列を取得
    console.log('hexcode.length(start): ', hexcode.length) // 3
    let hexForTransparency = ""; // Hex下二桁の透明度情報

    // 入力したhexがの長さが 3 or 6 で 且つ 'opacity' の値が 無い(undefined) なら 'FF' にする
    if (opacityValueInput === undefined) {
        hexForTransparency = 'FF'
    } else { // 'undefined'ではない 数値があった場合は それを hexに変換する
        hexForTransparency = normalizedToHex(opacityValueInput)
    }

    if (hexcode.length === 3) {
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        hexcode = hexcode + hexForTransparency
    } else if (hexcode.length === 6) {
        hexcode = hexcode + hexForTransparency
    } else if (hexcode.length === 4) { // hexcode has opacity, but in short style
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
    }
    console.log('hexcode.length(end): ', hexcode.length) // 10
    const hexWithHash = '#' + hexcode.toUpperCase()
    //    return eightToFourOrThree(hexWithHash) // shorten if could before return
    return hexWithHash // shorten if could before return
}
// console.log(mergeOpacityAndExtended('#000', 1))      // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1))   // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1.0)) // #000000FF


// Split the hex and opacity, and extended if in short style
// For: transparency-scope = whole-group
function splitOpacityAndExtended(hexCodeInput, opacityValueInput, strokeOpacityValueInput) {

    let hexcode = hexCodeInput.slice(1); // `#`記号 を除く文字列を取得

    if (hexcode.length === 3) {
        hexcode = '#' + hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        return [undefined, hexcode.toUpperCase(), opacityValueInput, strokeOpacityValueInput]
// 入力されるhex色情報は 3|6 だけでいい？ 下記のような透明度情報込みの 4|8 hex表現をサポートする必要があるかどうか 要検討

    } else if (hexcode.length === 8) {
        return splitHexAndOpacity(hexcode) // Hex6桁と 最後二桁の透明度情報を変換した数値[0-1]の 配列を返す
    } else if (hexcode.length === 4) { // hexcode has opacity, but in short style
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する (4 => 8)
        return splitHexAndOpacity(hexcode) // Hex6桁と 最後二桁の透明度情報を変換した数値[0-1]の 配列を返す
    }

    // 6桁のときは そのまま にする
    //console.log('hex code length is 6')
    const hexWithHash = '#' + hexcode.toUpperCase()
    //const hexcodeShorten = eightToFourOrThree(hexWithHash) // shorten if could before return
    return [undefined, hexWithHash, opacityValueInput, strokeOpacityValueInput]
}
// console.log(splitOpacityAndExtended('#fff'))      // Array(3) [ undefined, "#FFFFFF", undefined ]
// console.log(splitOpacityAndExtended('#ffffff'))   // Array(3) [ undefined, "#FFFFFF", undefined ]
// console.log(splitOpacityAndExtended('#ffffffff')) // Array(3) [ undefined, "#FFFFFF", 1 ]
// console.log(splitOpacityAndExtended('#000'))      // Array(3) [ undefined, "#000000", undefined ]
// console.log(splitOpacityAndExtended('#000000'))   // Array(3) [ undefined, "#000000", undefined ]
// console.log(splitOpacityAndExtended('#00000000')) // Array(3) [ undefined, "#000000", 0 ]

// console.log(splitOpacityAndExtended('#fff'))  // (3) [undefined, '#FFFFFF', undefined]
// console.log(splitOpacityAndExtended('#ffffff')) // (4) [undefined, '#FFFFFF', undefined, undefined]
