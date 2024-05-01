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

// // Test
// console.log(normalizedToHex(1));    // FF
// console.log(normalizedToHex(0.8));  // CC
// console.log(normalizedToHex(0.01)); // 03
// console.log(normalizedToHex(0));    // 00



// Merge the hex and opacity, and extended if in short style
// For: transparency-scope = per-stroke
// 'opacity' values are convert into hex 7,8 chars
function mergeOpacityAndExtended(hexInput, opacityValueInput) {

    let hex = hexInput.slice(1); // `#`記号 を除く文字列を取得
    console.log('hex.length(start): ', hex.length) // 3
    let hexForTransparency = ""; // Hex下二桁の透明度情報

    // 入力したhexがの長さが 3 or 6 で 且つ 'opacity' の値が 無い(undefined) なら 'FF' にする
    if (opacityValueInput === undefined) {
        hexForTransparency = 'FF'
    } else { // 'undefined'ではない 数値があった場合は それを hexに変換する
        hexForTransparency = normalizedToHex(opacityValueInput)
    }

    if (hex.length === 3) {
        hex = hex.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        hex = hex + hexForTransparency
    } else if (hex.length === 6) {
        hex = hex + hexForTransparency
    } else if (hex.length === 4) { // hex has opacity, but in short style
        hex = hex.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
    }
    console.log('hex.length(end): ', hex.length) // 10
    const hexWithHash = '#' + hex.toUpperCase()
    return hexWithHash
}
// console.log(mergeOpacityAndExtended('#000', 1))      // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1))   // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1.0)) // #000000FF
