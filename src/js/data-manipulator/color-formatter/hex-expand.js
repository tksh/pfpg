// 6|5|3|1桁 に変換されたhexを 10桁に戻す関数

function hexExpandTo10(hex) {
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
// console.log(hexExpandTo10("a"));          // "aaaaaaffff"
// // 3 => 10
// console.log(hexExpandTo10("123"));        // "112233ffff"
// // 5 => 10
// console.log(hexExpandTo10("abcde"));      // "aabbccddee"
// // 6 => 10
// console.log(hexExpandTo10("ffffff"));     // ffffffffff
// // 10 => 10
// console.log(hexExpandTo10("ffffffeedd")); // ffffffeedd
// // Invalid
// console.log(hexExpandTo10("ff"));         // Error: Invalid hex string
// console.log(hexExpandTo10(""))            // Error: Invalid hex string



function hexExpandTo6(hex) {
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