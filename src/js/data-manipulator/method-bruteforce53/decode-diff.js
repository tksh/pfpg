// Functions to decode the diff

function decodeDiffFromStr(diffStr, freqdictMap, baseX, maxDictSize) {
    let decodedDiffArray = [];

    //console.log('diffStr: ', diffStr)
    //console.log('diffStr.length: ', diffStr.length)
    //console.log('freqdictMap: ', freqdictMap)

    for (let i = 0; i < diffStr.length; i++) {
        console.log('i, diffStr[i]): ', i, diffStr[i])
        //const isInDictBool = isInDict(diffStr[i], freqdictMap)
        //console.log('isInDictBool, i, diffStr[i]: ', isInDictBool, i, diffStr[i])

        // if (isInDictBool === true) { // freq dict に含まれる ならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
        if (isInDict(diffStr[i], freqdictMap)) { // freq dict に含まれる ならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
            //console.log(`isInDict = true, diffStr[${i}] => freqdictMap.get(diffStr[${i}]): `, diffStr[i], ' => ', freqdictMap.get(diffStr[i]))
            decodedDiffArray.push(freqdictMap.get(diffStr[i]));

        } else if (isNumber(diffStr[i])) { // 整数[0-9] ならば 1文字ごとに そのまま 配列に格納
            decodedDiffArray.push(parseInt(diffStr[i]));


            //for (let i = 0; i < diffStr.length; i++) {
            //    //if (isInDict(diffStr[i], freqdictMap)) { // freq dict に含まれる ならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
            //    if (isInDictOld(diffStr[i], maxDictSize)) { // freq dict に含まれる ならば 1文字ごとに diffStr[i]をキーにして 対応する数値を得て 配列に格納
            //        decodedDiffArray.push(freqdictMap.get(diffStr[i]));
            //
            //    } else if (isNumber(diffStr[i])) { // 整数[0-9] ならば 1文字ごとに 配列に格納
            //        decodedDiffArray.push(parseInt(diffStr[i]));


        } else if (diffStr[i] === '_') {
            // `_`があれば その次に続く "2文字" を Base52デコードして 配列に格納: `_ab`
            decodedDiffArray.push(base52Decode((diffStr[i + 1] + diffStr[i + 2])));
            i += 2; // `i` を `2`増やして `_`の後に続く "2文字" 分を スキップさせる

            // `__`があれば その次に続く "2文字" を Base52デコードして 配列に格納: `__ab`
            // 返ってきた 数値には マイナス記号を付ける
            if (diffStr[i + 1] === '_') {
                decodedDiffArray.push(-base52Decode((diffStr[i + 2] + diffStr[i + 3])));
                i += 3; // `i` を `3`増やして `__`の後に続く "2文字" 分を スキップさせる
            }

            // `___`があれば その次に続く "3文字" を Base52デコードして 配列に格納: `___abc`
            if (diffStr[i + 1] === '_' && diffStr[i + 2] === '_') {
                decodedDiffArray.push(base52Decode((diffStr[i + 3] + diffStr[i + 4] + diffStr[i + 5])));
                i += 5; // `i` を `5`増やして `___`の後に続く "3文字" 分を スキップさせる
            }

            // `____`があれば その次に続く "3文字" を Base52デコードして 配列に格納: `____abc`
            // 返ってきた 数値には マイナス記号を付ける
            if (diffStr[i + 1] === '_' && diffStr[i + 2] === '_' && diffStr[i + 3] === '_') {
                decodedDiffArray.push(-base52Decode((diffStr[i + 4] + diffStr[i + 5] + diffStr[i + 6])));
                i += 6; // `i` を `6`増やして `____`の後に続く "3文字" 分を スキップさせる
            }


        } else { // 残りは BaseXでエンコードされた 小文字2文字ずつ のみなので 2文字ずつ baseXDec()して 配列に格納
            const toBaseXDecode = diffStr[i] + diffStr[i + 1];
            //console.log(`${diffStr[i] + diffStr[i + 1]} is decoding with baseX`) // hA
            //console.log('baseXDec(toBaseXDecode, baseX): ', baseXDec(toBaseXDecode, baseX)) // 10
            decodedDiffArray.push(baseXDec(toBaseXDecode, baseX));
            i++; // `i` を `1`増やして 次の2文字目の文字分を スキップさせる
        }
    }

    return decodedDiffArray
}



// 辞書用文字列に含まれているなら `true` を返す
function isInDict(str, freqdictMap) {
    // 判定用文字列
    // Mapオブジェクトのキーのみを 配列として取り出し 区切り無しでjoinして ひとつの文字列にする
    const dictionary = Array.from(freqdictMap.keys()).join('')

    // 文字が辞書用文字列に含まれているかどうかを判定する
    // 含まれている場合は true を返す
    const bool = dictionary.indexOf(str) !== -1;
    return bool
}

// 文字が[0-9]かどうかを判定する
function isNumber(str) {
    return /^[0-9]+$/g.test(str);
}



// 辞書用文字列に含まれているなら `true` を返す
function isInDictOld(str, maxDictSize) {
    // 辞書用文字列
    const dictionary = getAlphabetsForDict(maxDictSize)

    // 文字が辞書用文字列に含まれているかどうかを判定する
    // 含まれている場合はtrueを返す
    return dictionary.indexOf(str) !== -1;
}