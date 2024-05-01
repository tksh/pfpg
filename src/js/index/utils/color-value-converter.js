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
