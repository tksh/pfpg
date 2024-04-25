// 8桁のhexコードを受け取り、省略形に変換する関数
function eightToFourOrThree(hex) {
    // hexが8桁でない場合はエラーを返す
    if (hex.length !== 8) {
        return "Invalid hex code";
    }
//    // hexの先頭の#を除く
//    hex = hex.slice(1);
    // 省略形に変換できるかどうかを判定するフラグ
    let canShorten = true;
    // 省略形に変換した結果を格納する変数
    let result = "";
//    let result = "#";
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
    if (canShorten) {
        // resultの長さが 4 であり かつresultの 4桁目[3]が fまたはF であるかどうかをチェックする
        if (result.length === 4 && result[3].toLowerCase() === "f") {
            // もしそうであれば、resultの 4桁目 を '.slice(0, -1)'で 削除する
//        // resultの長さが5であり、かつresultの5桁目[4]が fまたはF であるかどうかをチェックする
//        if (result.length === 5 && result[4].toLowerCase() === "f") {
//            // もしそうであれば、resultの5桁目を削除する
            result = result.slice(0, -1);
        }
        // resultを返す
        return result;
    } else {
        // 省略形に変換できなかった場合は 元のhexを返す
//        // 省略形に変換できなかった場合は元のhexを#付きで返す
        return hex;
//        return "#" + hex;
    }
}


// // 関数を呼び出して結果を表示する
// console.log(eightToFourOrThree("#AABBCCFF")); // #ABC
// console.log(eightToFourOrThree("#112233ff")); // #123
// console.log(eightToFourOrThree("#112233ee")); // #123e
// console.log(eightToFourOrThree("#123456ff")); // #123456ff
// console.log(eightToFourOrThree("#AABBCC")); // #ABC
// console.log(eightToFourOrThree("#112233")); // #123
// console.log(eightToFourOrThree("#123456")); // #123456



// For lines group attributes

// hexコードを受け取り、省略形に変換する関数
// 各2桁が同じであれば 1桁だけにする
function tryReduceHalf(hex) {
    return hex.replace(/(\w{2})\1+/g, '$1');
}

// console.log(tryReduceAsHalf("aabbccffff")) // abcff
// console.log(tryReduceAsHalf("AABBCCFFFF")) // ABCFF
// console.log(tryReduceAsHalf("112233ffff")) // 123ff
// console.log(tryReduceAsHalf("112233ee00")) // 123e0
// console.log(tryReduceAsHalf("123456ffff")) // 123456ffff

function tryDeleteFs(hex) { // Input 10 or 5 chars hex

    hex = hex.toUpperCase()

    // 10 => 6
    if (hex.length === 10) {
        if (hex.slice(-4) === "FFFF") {
            return hex.slice(0, 6)
        } else {
            return hex
        }
    }

    // 5 => 3 (hex.length === 5)
    else {
        if (hex.slice(-2) === "FF") {
            return hex.slice(0, 3)
        } else {
            return hex
        }
    }
}

// console.log(tryDeleteFs("abcff"))      // ABC
// console.log(tryDeleteFs("ABCFF"))      // ABC
// console.log(tryDeleteFs("abcde"))      // ABCDE
// console.log(tryDeleteFs("12345"))      // 12345
// console.log(tryDeleteFs("123456ffff")) // 123456
// console.log(tryDeleteFs("123456abff")) // 123456ABFF



// For 'Base color'
// but currently using 'eightToFourOrThree()' instead of this.

//function tryDeleteF(hex) { // Input 8 or 4 chars hex
//
//    hex = hex.toUpperCase()
//
//    // 8 => 6
//    if (hex.length === 8) {
//        if (hex.slice(-4) === "FF") {
//            return hex.slice(0, 6)
//        } else {
//            return hex
//        }
//    }
//
//    // 4 => 3  (hex.length === 4)
//    else {
//        if (hex.slice(-2) === "F") {
//            return hex.slice(0, 3)
//        } else {
//            return hex
//        }
//    }
//}
// console.log(tryDeleteFs("abcf"))     // ABCF
// console.log(tryDeleteFs("ABCF"))     // ABCF
// console.log(tryDeleteFs("abcd"))     // ABCD
// console.log(tryDeleteFs("123456ff")) // 123
// console.log(tryDeleteFs("123456ab")) // 123456AB





