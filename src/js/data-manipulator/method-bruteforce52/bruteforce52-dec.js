function decodeBruteforce52Enc(encodedDvalsStr, threeFlagCharsArr) {
    console.log("threeFlagCharsArr: ", threeFlagCharsArr)
    console.log("encodedDvalsStr: ", encodedDvalsStr)

    const baseX = threeFlagCharsArr[2] // 3rd char indicates Base X number
    const maxDictSize = 52 - baseX

    // split into eight parts like: [x1:dict]-[x1:diff]-[y1:dict]-[y1:diff]-[x2:dict]-[x2:diff]-[y2:dict]-[y2:diff]
    const dictAndDiffDvals = encodedDvalsStr.split('-')

    // Freq Nums and Diff arrays
    const freqNumsByColumns = [
        decodeFreqNumArray(dictAndDiffDvals[0]), // x1
        decodeFreqNumArray(dictAndDiffDvals[2]), // y1
        decodeFreqNumArray(dictAndDiffDvals[4]), // x2
        decodeFreqNumArray(dictAndDiffDvals[6])  // y2
    ]
    const diffByColumns = [
        dictAndDiffDvals[1], // x1
        dictAndDiffDvals[3], // y1
        dictAndDiffDvals[5], // x2
        dictAndDiffDvals[7]  // y2
    ]


    console.log("freqNumsByColumns: ", freqNumsByColumns)

    // Get Frec Dict Map from Freq Nums Array



    return encodedStrByGroup

}


// Get the numbers array for frequency dictionary from encoded string
function decodeFreqNumArray(str) {
    // Base52デコードした 数値の配列を返す

    // Base52エンコードされた文字列を 以下のルールで区切る
    // '_' アンダースコアは それを含む 4文字
    // その他 (小文字の連なり)は 2文字ずつ

    const splited = str.match(/(_.{3})|(.{2})/g); // 2 or 4文字ずつ取り出す
    console.log('splited: ', splited)

    // regex test
    //const strTEST = 'abcd_efg_hij_klmnopqrstu'
    //const splitedTEST = strTEST.match(/(_.{3})|(.{2})/g);
    //console.log('splitedTEST: ', splitedTEST)
    //Array(9) [ "ab", "cd", "_efg", "_hij", "_klm", "no", "pq", "rs", "tu" ]

    const parseAsNum = splited.map(twoChars => base52DecodeForFreqDictValue(twoChars))

    return parseAsNum
    // (29) [-2, -1, -7, -5, -3, -4, 11, 10, 12, -8, -11, -6, 16, -10, 13, 24, -27, -9, 14, 15, 17, 20, 73, -38, -37, -25, -24, -23, -22]
}