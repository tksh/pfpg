// 10桁のhex を受け取り 省略して 6|5|3|1桁 に変換する関数

// Format and index number: stroke[0-5]
//                          opacity[6-7]
//                          stroke-opacity[8-9]

// To 6: Delete the opacity and stroke-opacity if both are ff|FF
// To 5: If same chars at odd and even number index in all [0-9], reduce into one
// To 3: After to 5, Delete the opacity and stroke-opacity if both are ff|FF
// To 1: After to 3, If three chars are same, reduce into one


function hex10To6or5or3or1(hex) {
    // hexが10桁でない場合はエラーを返す
    if (hex.length !== 10) {
        return "Invalid hex code";
    }

    // To 5:
    // 省略形に変換できるかどうかを判定するフラグ
    let canShorten = true;
    // 省略形に変換した結果を格納する変数
    let result = "";
    // hexの各2桁ごとにループ
    for (let i = 0; i < hex.length; i += 2) {
        // 2桁が同じであれば、1桁だけresultに追加する
        if (hex[i] === hex[i + 1]) {
            result += hex[i];
        } else {
            // 2桁が異なれば、省略形に変換できないと判定し、ループを抜ける
            canShorten = false;
            break;
        }
    }

    // To 3:
    // 省略形に変換できた場合はresultを返す前に、以下の処理を行う
    // 4,5 桁目 の透明度情報が 両方とも 'f' ならば 削除して 色情報の3桁目までのみに 省略する
    if (canShorten) {
        // resultの 4桁目[3] と 5桁目[4]が
        // ともに f または F であるかどうか をチェックする
        if (result[3].toLowerCase() === "f"
            && result[4].toLowerCase() === "f"
        ) {
            // もしそうであれば、resultの 4,5桁目を 削除する
            result = result.slice(0, -2);

            // TO 1:
            // さらに もし 色情報の3桁全てが同じならば 1桁だけに 省略する
            if (result[0] === result[1] && result[1] === result[2]) {
                result = result[0]
            }
        }
        // resultを返す
        return result;
    }

    // To 6:
    if (!canShorten) {
        if (hex[6].toLowerCase() === "f"
            && hex[7].toLowerCase() === "f"
            && hex[8].toLowerCase() === "f"
            && hex[9].toLowerCase() === "f"
        ) {
            // もしそうであれば、resultの 7,8,9,10桁目を 削除する
            result = hex.slice(0, -4);
            return result;
        } else {
            // 省略形に変換できず 二つの透明度情報も省略できなかった場合は 元のhexを返す
            return hex;
        }
    }
}


// Test
//console.log(hex10To6or5or3or1("AABBCCFF99")); // ABCF9
//console.log(hex10To6or5or3or1("AABBCCFFff")); // ABC
//console.log(hex10To6or5or3or1("112233ff88")); // 123f8
//console.log(hex10To6or5or3or1("112233eeee")); // 123ee
//console.log(hex10To6or5or3or1("123456ffff")); // 123456
//console.log(hex10To6or5or3or1("AABBCCabcd")); // AABBCCabcd
//console.log(hex10To6or5or3or1("1122334455")); // 12345
//console.log(hex10To6or5or3or1("112233FFFF")); // 123
//console.log(hex10To6or5or3or1("111111ffFF")); // 1
//console.log(hex10To6or5or3or1("AAAAAAFFFF")); // A
//console.log(hex10To6or5or3or1("aaaaaaffff")); // a



// 引数に省略された16進数の文字列を受け取る
function expandHex(hex) {
    // 文字列の長さが 6 or 10 ならば そのまま 返す
    if (hex.length === 6 || hex.length === 10) {
        return hex;
    }
    // 文字列の長さが 3 or 5 ならば 各要素を 2回繰り返す
    else if (hex.length === 3 || hex.length === 5) {
        // 文字列を1文字ずつ分割して配列にする
        let chars = hex.split("");
        // 配列の各要素を2回繰り返して結合する
        let expanded = chars.map(char => char.repeat(2)).join("");
        // 結果を返す
        return expanded;
    }
    // 文字列の長さが 3,5,6,10 以外の場合は error
    else {
        return new Error("Invalid hex string");
    }
}


// Test

// // 3 => 6
// console.log(expandHex("fff"));    // "ffffff"
// console.log(expandHex("abc"));    // "aabbcc"
// console.log(expandHex("123"));    // "112233"
// console.log(expandHex("f0f"));    // "ff00ff"
// console.log(expandHex("ff"));     // Error: Invalid hex string
// // 5 => 10
// console.log(expandHex("fffff"));  // "ffffffffff"
// console.log(expandHex("abcde"));  // "aabbccddee"
// console.log(expandHex("12345"));  // "1122334455"
// console.log(expandHex("f0f0f"));  // "ff00ff00ff"

// // 6 => 6
// console.log(expandHex("ffffff"));     // ffffff
// // 10 => 10
// console.log(expandHex("ffffffeedd")); // ffffffeedd
