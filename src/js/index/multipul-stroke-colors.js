function replaceAtIndex(inputString, regexPattern, replacement, index) {
    //console.log('replacement: ', replacement) // <g stroke="#00000088">

    // 正規表現でマッチした結果を配列として取得
    const matches = Array.from(inputString.matchAll(regexPattern));
    console.log('matches: ', matches)
    // Array [ (1) […], (1) […] ]
    //   0: Array [ "apple" ]
    //     0: "apple"
    //     groups: undefined
    //     index: 0
    //     input: "apple banana cherry apple"
    //     length: 1
    //   1: Array [ "apple" ]
    //     0: "apple"
    //     groups: undefined
    //     index: 20
    //     input: "apple banana cherry apple"
    //     length: 1

    // 指定されたインデックスの要素を置き換える
    //   文字列としては 同じ 'apple' でも 'index'はそれぞれの情報を持っている
    //   'index'は マッチングした文字列の先頭が 元の文字列内でどの位置にあるか を示す数値
    const matchToReplace = matches[index];
    console.log('matchToReplace: ', matchToReplace)
    // Array [ "apple" ]
    //   0: "apple"
    //   groups: undefined
    //   index: 20
    //   input: "apple banana cherry apple"
    //   length: 1

    // 元の文字列を指定されたインデックスの要素で分割し、
    // replacement を挿入して新しい文字列を生成
    const replacedString =
        inputString.slice(0, matchToReplace.index) + // インデックスの前の部分 0から19までが抽出される (0, マッチングした文字列の先頭 (20))
        replacement + // 置き換える文字列
        inputString.slice(matchToReplace.index + matchToReplace[0].length);
        // インデックスの後の部分 (マッチングした文字列の先頭 (20) + マッチ文字列 "apple" の長さ)
        // = 正規表現にマッチした文字列の末尾の位置を示す数値
        // `.slice()` メソッドを一つの引数だけで使用することで、指定した位置から文字列の最後までを取得

    // 新しい文字列を返す
    return replacedString;
}

// // Test
// 
// const inputString = "apple banana cherry apple";
// const regexPattern = /apple/g; // "apple" にマッチする正規表現
// const replacement = "orange"; // 置き換える文字列
// const indexToReplace = 1; // 置き換えたいインデックス (2番目[1]の apple を置き換える)
// 
// const result = replaceAtIndex(inputString, regexPattern, replacement, indexToReplace);
// console.log(result);
// // apple banana cherry orange
