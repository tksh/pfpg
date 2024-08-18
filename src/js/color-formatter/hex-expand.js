import { normalizedToHex }      from 'color-formatter/normalized-to-hex'


export
    { hexExpandToTen
    , hexExpandToEight
    , hexExpandToSix
    }

// 6|5|3|1桁 に変換された hex を 10桁に戻す関数

function hexExpandToTen(hex) {
    // 文字列の長さが 10 ならば そのまま 返す
    if (hex.length === 10) {
        return hex;
        // 文字列の長さが 6 ならば 2種類の透明度を それぞれ ff(1.0) として 返す
    } else if (hex.length === 6) {
        return hex + 'ffff'
    }

    // 文字列の長さが 3 or 5 ならば 各要素を 2回繰り返す
    // 結果の長さが 6 ならば 2種類の透明度を それぞれ ff(1.0) として 返す
    else if (hex.length === 3 || hex.length === 5) {
        // 文字列を1文字ずつ分割して配列にする
        let chars = hex.split("");
        // 配列の各要素を2回繰り返して結合する
        let expanded = chars.map(char => char.repeat(2)).join("");
        // 結果を返す
        if (expanded.length === 6) {
            return expanded + 'ffff'
        } else { // length = 10
            return expanded;
        }
    }

    // 文字列の長さが 1 ならば 6回繰り返してから
    // 2種類の透明度を それぞれ ff(1.0) として 返す
    else if (hex.length === 1) {
        return hex.repeat(6) + 'ffff'
    }

    // 文字列の長さが 1,3,5,6,10 以外の場合は error
    else {
        return new Error("Invalid hex code");
    }

}

// Test
// // 1 => 10
// console.log(hexExpandToTen("a"));          // "aaaaaaffff"
// // 3 => 10
// console.log(hexExpandToTen("123"));        // "112233ffff"
// // 5 => 10
// console.log(hexExpandToTen("abcde"));      // "aabbccddee"
// // 6 => 10
// console.log(hexExpandToTen("ffffff"));     // ffffffffff
// // 10 => 10
// console.log(hexExpandToTen("ffffffeedd")); // ffffffeedd
// // Invalid
// console.log(hexExpandToTen("ff"));         // Error: Invalid hex string
// console.log(hexExpandToTen(""))            // Error: Invalid hex string



// For canvas-base color ([0]-indexed lines-group color)
// Extend to 8 digits hex if in short style or no hex-code (value = 1)
// Add opacity value '1' as 'FF' (7th and 8th chars)
// Input with "#" but and output without "#"
function hexExpandToEight(hexWithHash, opacity) {

    let hex = hexWithHash.slice(1)                              // `#`記号 を除く文字列を取得
    //console.log('hex.length: ', hex.length)                        // 3 | 4 | 6 | 8
    hex = hexExpandToSix(hex)                      // 6 digits
    const opacityAsHex = normalizedToHex(opacity)  // 2 digits

    return hex + opacityAsHex
//    // Input hex has no opacity
//    if (hex.length === 3) {
//        hex = hex.split("").map((char) => char.repeat(2)).join("")   // RGB の各文字を2回繰り返す  3 => 6
//        return hex + 'FF'                                            // Add opacity value 'FF' 6 => 8
//    } else if (hex.length === 6) {
//        return hex + 'FF'                                            // Add opacity value 'FF' 6 => 8
//
//    // Input hex has opacity
//    } else if (hex.length === 4) {
//        return hex.split("").map((char) => char.repeat(2)).join("")  // RGBA の各文字を2回繰り返す 4 => 8
//    } else {
//        return hex                                                   // 8 => 8
//    }
}
// console.log(hexExpandToEight('#000'))    // 000000FF
// console.log(hexExpandToEight('#000000', 1.0)) // 000000FF
// console.log(hexExpandToEight('#000000', 1.0)) // 000000FF



function hexExpandToSix(hex) {
    if (hex.length === 6) {
        // 文字列の長さが 6 ならば そのまま 返す
        return hex;

    } else if (hex.length === 3) {
        // 文字列の長さが 3 ならば 各要素を 2回繰り返す

        // 文字列を1文字ずつ分割して配列にする
        let chars = hex.split("");
        // 配列の各要素を2回繰り返して結合する
        let expanded = chars.map(char => char.repeat(2)).join("");
        // 結果を返す
        return expanded;
    } else {
        return new Error("Invalid hex code");
    }
}