import { base52DecodeForRefDict }  from 'enc-and-dec/base-n/base-52-dec'
import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'


// Create the codebook

export function createCodebookToDecodeFrequentDiff(encodedRefDict, maxCodebookSize) {
    // Key  : Alphabets
    // Value: Frequent diff value from reference dictionary

    // Alphabets
    const alphabets = getAlphabetsForCodebook(maxCodebookSize)

    // Decode the reference dictionary
    const refDict = decodeFreqDiffAsRefDict(encodedRefDict)

    // Set the kv pair into Map()
    const codebook = new Map();

    for (let i = 0; i < refDict.length; i++) {
        codebook.set(alphabets[i], refDict[i]);
    }
    return codebook
}


// Decode the reference dictionary (frequent diff value)

function decodeFreqDiffAsRefDict(diffStr) {
    // Base52デコードした 数値の配列を返す

    // Base52エンコードされた文字列を 以下のルールで区切る
    //   '_' アンダースコアは それを含む 4文字
    //   その他 (小文字の連なり)は 2文字ずつ

    const splitted = diffStr.match(/(_.{3})|(.{2})/g);  // 2 or 4文字ずつ取り出す
    console.log('splitted: ', splitted)                 // 頻出数値が無い column の場合には 'splitted:  null' となる

    // Regex test
    //const strTEST = 'abcd_efg_hij_klmnopqrstu'
    //const splittedTEST = strTEST.match(/(_.{3})|(.{2})/g);
    //console.log(splittedTEST)
    //Array(9) [ "ab", "cd", "_efg", "_hij", "_klm", "no", "pq", "rs", "tu" ]

    if (splitted !== null) {
        return splitted.map(twoChars => base52DecodeForRefDict(twoChars))
    } else {
        return [] // 頻出数値が無い column の場合には 空の配列を 返す
    }
    // e.g.: (29) [-2, -1, -7, -5, -3, -4, 11, 10, 12, -8, -11, -6, 16, -10, 13, 24, -27, -9, 14, 15, 17, 20, 73, -38, -37, -25, -24, -23, -22]
}
