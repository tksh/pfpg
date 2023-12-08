// 10桁のhex を受け取り 省略して 5桁 に変換する関数
function hex10To5or3(hex) {
    // hexが10桁でない場合はエラーを返す
    if (hex.length !== 10) {
        return "Invalid hex code";
    }

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

    // 省略形に変換できた場合はresultを返す前に、以下の処理を行う
    // 4,5 桁目 の透明度情報が 両方とも 'f' ならば 削除して 色情報の3桁のみに省略する
    if (canShorten) {
        // resultの長さが5であり
        // かつ resultの 5桁目[4] と 5桁目[4]が
        // ともに f または F であるかどうか をチェックする
        if (result.length === 5
            && result[3].toLowerCase() === "f"
            && result[4].toLowerCase() === "f"
        ) {
            // もしそうであれば、resultの 4,5桁目を 削除する
            result = result.slice(0, -2);
        }
        // resultを返す
        return result;
    } else {
        // 省略形に変換できなかった場合は元のhexを#付きで返す
        return hex;
    }
}


// Test
// console.log(hex10To5or3("AABBCCFF99")); // ABCF9
// console.log(hex10To5or3("AABBCCFFff")); // ABC
// console.log(hex10To5or3("112233ff88")); // 123f8
// console.log(hex10To5or3("112233eeee")); // 123ee
// console.log(hex10To5or3("123456ffff")); // 123456ffff
// console.log(hex10To5or3("AABBCCabcd")); // AABBCCabcd
// console.log(hex10To5or3("1122334455")); // 12345
// console.log(hex10To5or3("112233FFFF")); // 123



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
