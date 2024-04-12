// Convert from 3|6 digits hex to 6 digits
function hexExpandTo6(hexcodeWithHash) {
    let hexcode = hexcodeWithHash.slice(1); // `#`記号 を除く文字列を取得
    if (hexcode.length === 3) {
        const repeatTo6 = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        return "#" + repeatTo6
    } else { // 6 digits
        return "#" + hexcode
    }
}



// 8桁のhexコードを受け取り、省略形に変換する関数
function eightToFourOrThree(hex) {
    // hexが8桁でない場合はエラーを返す
    //if (hex.length !== 9) {
    //    return "Invalid hex code";
    //}
    // hexの先頭の#を除く
    hex = hex.slice(1);
    // 省略形に変換できるかどうかを判定するフラグ
    let canShorten = true;
    // 省略形に変換した結果を格納する変数
    let result = "#";
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
        // resultの長さが5であり、かつresultの5桁目[4]が fまたはF であるかどうかをチェックする
        if (result.length === 5 && result[4].toLowerCase() === "f") {
            // もしそうであれば、resultの5桁目を削除する
            result = result.slice(0, -1);
        }
        // resultを返す
        return result;
    } else {
        // 省略形に変換できなかった場合は元のhexを#付きで返す
        return "#" + hex;
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


// 10桁のhexコードを受け取り、省略形に変換する関数
function tenToTenOrFive(hex) {

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

    // 省略形に変換できた場合はresultを返す
    if (canShorten) {
        return result;
    } else {
        // 省略形に変換できなかった場合は元のhexを返す
        return hex;
    }
}

// console.log(tenToTenOrFive("aabbccffff")) // abcff
// console.log(tenToTenOrFive("AABBCCFFFF")) // ABCFF
// console.log(tenToTenOrFive("112233ffff")) // 123ff
// console.log(tenToTenOrFive("112233ee00")) // 123e0
// console.log(tenToTenOrFive("123456ffff")) // 123456ffff





