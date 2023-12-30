function decodeBruteforce53Enc(encodedDvalsStr, threeFlagCharsArr) {
    console.log("threeFlagCharsArr: ", threeFlagCharsArr)
    console.log("encodedDvalsStr: ", encodedDvalsStr)

    const baseX = base53Decode(threeFlagCharsArr[2]) // 3rd char indicates Base X number
    const maxDictSize = 52 - baseX
    console.log('|decodeBruteforce53Enc| baseX: ', baseX)
    console.log('|decodeBruteforce53Enc| maxDictSize: ', maxDictSize)

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

    // Get Frec Dict Map from Freq Nums Array
    const freqdictMapByColumn = freqNumsByColumns.map(eachColumn => freqdictForDec(eachColumn, maxDictSize))
    console.log('freqdictMapByColumn: ', freqdictMapByColumn)
    // (4) [Map(1), Map(1), Map(1), Map(1)]
    //     0: Map(1) {'a' => -3}
    //     1: Map(1) {'a' => -3}
    //     2: Map(1) {'a' => -5}
    //     3: Map(1) {'a' => -3}

    // Decode the diff
    let decodedDiffColumns = []
    for (let i = 0; i < 4; i++) { // Processing for x1[0] to y2[3]
        //console.log('i: ', i) // 0, 1, 2, 3
        //console.log('freqdictMapByColumn[i]: ', freqdictMapByColumn[i])       // freq dict:   Map(11) { P → -7, p → -12, Q → -11, … }
        //console.log('diffStrByColumns[i], diffStrByColumns[i].length: ', diffStrByColumns[i], diffStrByColumns[i].length) // diff string: 7hARRSXHg6IHgg8hJ23WqUgJIHhFRGMqhLjHF...

        const decodedDiffArray = decodeDiffFromStr(
            diffStrByColumns[i],
            freqdictMapByColumn[i],
            baseX,
            maxDictSize
        )
        console.log('decodedDiffArray: ', decodedDiffArray)
        // Array(484) [ 7, 10, -3, -3, -12, -13, -17, 6, 54, -47, … ]

        decodedDiffColumns.push(decodedDiffArray)
        console.log(`${i} for x1[0],y1[1],x2[2],y2[3] | `, 'decodedDiffColumns: ', decodedDiffColumns)
    }

    return decodedDiffColumns
    // (4) [Array(7), Array(6), Array(7), Array(7)]
    // 0: (7) [12, -13, 3, -1, 1, 0, -3]
    // 1: (6) [21, -35, -14, -2, 4, -4]             // 要素の数が合ってない
    // 2: (7) [0, -2, 1, -1, 1, 3, 0]
    // 3: (7) [2, 1, -1, 1, -2, 0, 0]
}


// Functions to get the freq dict

// Get the numbers array for frequency dictionary from encoded string
function decodeFreqNumArray(diffStr) {
    // Base52デコードした 数値の配列を返す

    // Base52エンコードされた文字列を 以下のルールで区切る
    // '_' アンダースコアは それを含む 4文字
    // その他 (小文字の連なり)は 2文字ずつ

    const splited = diffStr.match(/(_.{3})|(.{2})/g); // 2 or 4文字ずつ取り出す
    console.log('splited: ', splited) // 頻出数値が無い column の場合には 'splited:  null' となる

    // regex test
    //const strTEST = 'abcd_efg_hij_klmnopqrstu'
    //const splitedTEST = strTEST.match(/(_.{3})|(.{2})/g);
    //console.log('splitedTEST: ', splitedTEST)
    //Array(9) [ "ab", "cd", "_efg", "_hij", "_klm", "no", "pq", "rs", "tu" ]

    if (splited !== null) {
        return splited.map(twoChars => base52DecodeForFreqDictValue(twoChars))
    } else {
        return [] // 頻出数値が無い column の場合には 空の配列を 返す
    }
    // (29) [-2, -1, -7, -5, -3, -4, 11, 10, 12, -8, -11, -6, 16, -10, 13, 24, -27, -9, 14, 15, 17, 20, 73, -38, -37, -25, -24, -23, -22]
}

function getFreqNumDict(numArray, maxDictSize) {
    // Generate a frequency dictionary for decoding

    // Keys: freq dict
    // An array of alphabet chars to replace the numerical numbers
    const alphabetForDict = getAlphabetsForDict(maxDictSize)

    // Set the kv pair into Map()
    const freqdictMap = new Map();

    for (let i = 0; i < numArray.length; i++) {
        // Mapオブジェクトに キー(一文字置換用アルファベット) と バリュー(頻出数値) のペアを追加する
        freqdictMap.set(alphabetForDict[i], numArray[i]);
    }
    //console.log('freqdictMap: ', freqdictMap) // Map(11) { P → -7, p → -12, Q → -11, q → -9, R → -8, … }
    return freqdictMap
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

