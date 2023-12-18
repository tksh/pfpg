// 10桁のhex を受け取り 省略して 6|5|3|1桁 に変換する関数
// 省略できなければ 10桁のまま返す

// Value and index number: [0-5] stroke
//                         [6-7] opacity
//                         [8-9] stroke-opacity

// To 6: Delete the opacity and stroke-opacity if both are ff|FF
// To 5: If same chars at odd and even number index in all [0-9], reduce into one
// To 3: After to 5, Delete the opacity and stroke-opacity if both are ff|FF
// To 1: After to 3, If three chars are same, reduce into one


function hexShortenFrom10(hex) {
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
            // 省略形に変換できず 二つの透明度情報も省略できなかった場合は 元の10桁のhexを返す
            return hex;
        }
    }
}


// Test
//console.log(hexShortenFrom10("AABBCCFF99")); // ABCF9
//console.log(hexShortenFrom10("AABBCCFFff")); // ABC
//console.log(hexShortenFrom10("112233ff88")); // 123f8
//console.log(hexShortenFrom10("112233eeee")); // 123ee
//console.log(hexShortenFrom10("123456ffff")); // 123456
//console.log(hexShortenFrom10("AABBCCabcd")); // AABBCCabcd
//console.log(hexShortenFrom10("1122334455")); // 12345
//console.log(hexShortenFrom10("112233FFFF")); // 123
//console.log(hexShortenFrom10("111111ffFF")); // 1
//console.log(hexShortenFrom10("AAAAAAFFFF")); // A
//console.log(hexShortenFrom10("aaaaaaffff")); // a
