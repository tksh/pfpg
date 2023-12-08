// Swap63 変換辞書用の キーとバリューの配列 を定義する
//   エンコード時と デコード時で key,value を 逆にする

function generateSwap63Dict(keys = getSwap63Nums(), values = getSwap63Chars()) {
    console.log('keys: ', keys) // Array(63) [ -31, -30, … -1, 0, 1, 2, … , 31]
    console.log('values: ', values) // Array(63) [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, … "Z", "_"]

    const dictMap = new Map()

    // 配列の要素をループしてマップにセットする
    for (let i = 0; i < keys.length; i++) {
        // keys[i] をキーとして values[i] を値としてセットする
        dictMap.set(keys[i], values[i]);
    }

    return dictMap
}


function generateSwap63DictToDec(keys = getSwap63Nums(), values = getSwap63Chars()) {
    //console.log('keys: ', keys) // Array(63) [ -31, -30, … -1, 0, 1, 2, … , 31]
    //console.log('values: ', values) // Array(63) [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, … "Z", "_"]

    const dictMap = new Map()

    // 配列の要素をループしてマップにセットする
    for (let i = 0; i < keys.length; i++) {
        // values[i] をキーとして keys[i] を値としてセットする
        // エンコード用と 逆 にする
        dictMap.set(values[i], keys[i]);
    }

    return dictMap
}





/////// Inner functions ///////


function getSwap63Nums() {
    let minus31To31 = [];
    for (let i = -31; i < 32; i++) {
        //console.log(i)
        minus31To31.push(i)
    }
    //console.log(minus31To31)
    return minus31To31
}
// Array(63) [ "-31", "-30", "-29", "-28", "-27", "-26", "-25", "-24", "-23", "-22", … , "31"]

// Without `.toString()` method, Number will returned
// Array(63) [ -31, -30, -29, -28, -27, -26, -25, -24, -23, -22, … , 31]


function getSwap63Chars() {
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