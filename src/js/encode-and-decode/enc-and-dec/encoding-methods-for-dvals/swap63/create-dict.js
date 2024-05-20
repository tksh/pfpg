// Swap63 変換辞書用の キーとバリューの配列 を定義する
// エンコード時と デコード時で key,value を 逆にする

function createDictionary(keys, values) {
    //console.log(get63Numbers())     // Array(63) [ -31, -30, … -2, -1, 0, 1, 2, … 30, 31]
    //console.log(get63Characters())  // Array(63) [ "0", "1", … "a", "b", … "z", "A", … "Z", "_"]

    // For encoding: keys = numbers,    value = characters
    // For decoding: keys = characters, values = numbers

    const dictMap = new Map()

    for (let i = 0; i < keys.length; i++) {
        dictMap.set(keys[i], values[i]);
    }

    return dictMap
}


function get63Numbers() {
    let minus31To31 = [];
    for (let i = -31; i < 32; i++) {
        //console.log(i)
        minus31To31.push(i)
    }
    //console.log(minus31To31)
    return minus31To31
}
// Array(63) [ "-31", "-30", "-29", "-28", "-27", "-26", "-25", "-24", "-23", "-22", … , "31"]


function get63Characters() {
    let zeroToNine = [];
    for (i = 0; i < 10; i++) {
        zeroToNine.push(i.toString())
    }
    //console.log(zeroToNine)
    // Array(10) [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" ]

    // 小文字を 文字コードを利用して配列を生成する
    let alphabetLowerCase = [];
    for (let i = 97; i <= 122; i++) { // 97から122までがaからzの文字コード
      alphabetLowerCase.push(String.fromCharCode(i)); // 文字コードから文字に変換して配列に追加
    }
    //console.log(alphabetLowerCase)

    // 大文字を 文字コードを利用して配列を生成する
    let alphabetUpperCase = [];
    for (let i = 65; i <= 90; i++) { // 65から90までがAからZの文字コード
      alphabetUpperCase.push(String.fromCharCode(i)); // 文字コードから文字に変換して配列に追加
    }
    //console.log(alphabetUpperCase)

    // Underscore
    const underscore = ['_']


    // Merge four arrays
    const wholeValues = zeroToNine.concat(alphabetLowerCase, alphabetUpperCase, underscore); // concatメソッドで配列をマージする
    //console.log(wholeValues)

    return wholeValues
}

// Array(63) [ "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", … "Z", "_"]