function decodeBruteforce53Enc(encodedDvalsStr, threeFlagCharsArr) {
    //console.log("threeFlagCharsArr: ", threeFlagCharsArr)
    //console.log("encodedDvalsStr: ", encodedDvalsStr)

    const baseX = base53Decode(threeFlagCharsArr[2]) // 3rd char indicates Base X number
    const maxDictSize = 52 - baseX
    console.log('baseX: ', baseX)
    console.log('maxDictSize: ', maxDictSize)

    // split into eight parts like: [x1:dict]-[x1:diff]-[y1:dict]-[y1:diff]-[x2:dict]-[x2:diff]-[y2:dict]-[y2:diff]
    const dictAndDiffDvals = encodedDvalsStr.split('-')

    // Freq Nums and Diff arrays

    const freqNumsByColumns = [ // 頻出数値が無い column の場合には 空の配列が 返ってくる
        decodeFreqNumArray(dictAndDiffDvals[0]), // x1
        decodeFreqNumArray(dictAndDiffDvals[2]), // y1
        decodeFreqNumArray(dictAndDiffDvals[4]), // x2
        decodeFreqNumArray(dictAndDiffDvals[6])  // y2
    ]
    const diffStrByColumns = [
        dictAndDiffDvals[1], // x1
        dictAndDiffDvals[3], // y1
        dictAndDiffDvals[5], // x2
        dictAndDiffDvals[7]  // y2
    ]
    console.log("freqNumsByColumns: ", freqNumsByColumns)
    // 0: [-3]
    // 1: [-3]
    // 2: [-5]
    // 3: [-3]
    console.log("diffStrByColumns: ", diffStrByColumns)
    // (4) ['120Zml19mJZ6mlmFZmwmgZ1mMmJ', '0MZ1mQ7mEmqmKmkmGZmumimFmtZ00md', '00mM5mk41mkmM0031mlZ326Z', 'mumMmlmEZmimmmRmEmq2mamKmNZml01Z']

    // Processing for each columns from x1 [0] to y2 [3]
    let decodedDiffColumns = []
    for (let i = 0; i < 4; i++) {

        // get freq dict map with actual size
        const actualDictSize = getActualDictSize(maxDictSize, freqNumsByColumns[i])
        const freqdictMap = freqdictForDec(freqNumsByColumns[i], actualDictSize)

        // Decode the diff
        const decodedDiffArray = decodeDiffFromStr(
            diffStrByColumns[i],
            freqdictMap,
            baseX,
        )
        //console.log('decodedDiffArray: ', decodedDiffArray)
        // Array(484) [ 7, 10, -3, -3, -12, -13, -17, 6, 54, -47, … ]

        decodedDiffColumns.push(decodedDiffArray)
    }
    return decodedDiffColumns
}


// Functions to get the freq dict

// Get the numbers array for frequency dictionary from encoded string
function decodeFreqNumArray(diffStr) {
    // Base52デコードした 数値の配列を返す

    // Base52エンコードされた文字列を 以下のルールで区切る
    // '_' アンダースコアは それを含む 4文字
    // その他 (小文字の連なり)は 2文字ずつ

    const splitted = diffStr.match(/(_.{3})|(.{2})/g); // 2 or 4文字ずつ取り出す
    console.log('splitted: ', splitted) // 頻出数値が無い column の場合には 'splitted:  null' となる

    // regex test
    //const strTEST = 'abcd_efg_hij_klmnopqrstu'
    //const splittedTEST = strTEST.match(/(_.{3})|(.{2})/g);
    //console.log('splittedTEST: ', splittedTEST)
    //Array(9) [ "ab", "cd", "_efg", "_hij", "_klm", "no", "pq", "rs", "tu" ]

    if (splitted !== null) {
        return splitted.map(twoChars => base52DecodeForFreqDictValue(twoChars))
    } else {
        return [] // 頻出数値が無い column の場合には 空の配列を 返す
    }
    // (29) [-2, -1, -7, -5, -3, -4, 11, 10, 12, -8, -11, -6, 16, -10, 13, 24, -27, -9, 14, 15, 17, 20, 73, -38, -37, -25, -24, -23, -22]
}


function freqdictForDec(numArray, maxDictSize) {
    // Generate the frequency dictionary for decoding

    // Key:   freq numbers
    // Value: char from alphabets

    // An array of alphabet chars to replace the numerical numbers
    const alphabetForDict = getAlphabetsForDict(maxDictSize)

    // Set the kv pair into Map()
    const freqdictMap = new Map();

    for (let i = 0; i < numArray.length; i++) {
        // Mapオブジェクトに キー(頻出数値) と バリュー(一文字置換用アルファベット) のペアを追加する
        freqdictMap.set(alphabetForDict[i], numArray[i]);
    }
    return freqdictMap
}
