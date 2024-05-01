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



// Extend to 8 digits hex if in short style or no hex-code (value = 1)
// Add opacity value '1' as 'FF' (7th and 8th chars)
// Input with "#" but and output without "#"
function expandToEightDigitsHex(hexInputWithHash) {

    let hex = hexInputWithHash.slice(1)                              // `#`記号 を除く文字列を取得
    //console.log('hex.length: ', hex.length)                        // 3 | 4 | 6 | 8

    // Input hex has no opacity
    if (hex.length === 3) {
        hex = hex.split("").map((char) => char.repeat(2)).join("")   // RGB の各文字を2回繰り返す  3 => 6
        return hex + 'FF'                                            // Add opacity value 'FF' 6 => 8
    } else if (hex.length === 6) {
        return hex + 'FF'                                            // Add opacity value 'FF' 6 => 8

    // Input hex has opacity
    } else if (hex.length === 4) {
        return hex.split("").map((char) => char.repeat(2)).join("")  // RGBA の各文字を2回繰り返す 4 => 8
    } else {
        return hex                                                   // 8 => 8
    }
}
// console.log(expandToEightDigitsHex('#000'))    // 000000FF
// console.log(expandToEightDigitsHex('#000000')) // 000000FF
// console.log(expandToEightDigitsHex('#000000')) // 000000FF
