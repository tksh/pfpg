import { base52DecodeForFreqDiff }  from 'enc-and-dec/base-n/base-52-dec'
import { getAlphabetsForCodebook } from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'

export {
    createCodebookToDec,
    decodeFreqDiff
}

// Create the codebook

function createCodebookToDec(freqDiffArr, actualCodebookSize) {
    // Key  : Alphabets
    // Value: Frequent diff value

    // Alphabets
    const alphabets = getAlphabetsForCodebook(actualCodebookSize)

    // Set the kv pair into Map()
    const codebook = new Map()

    for (let i = 0; i < freqDiffArr.length; i++) {
        codebook.set(alphabets[i], freqDiffArr[i])
    }
    return codebook
}


// Decode the frequent diff values

function decodeFreqDiff(diffStr) {
    // Base52デコードした数値の配列を返す

    if (!diffStr) {
        return []; // 空文字列 (頻出数値が無い coord) の場合は 空配列を返す
    }

    const chunks = [];
    let i = 0;

    while (i < diffStr.length) {
        if (diffStr[i] === '_') {
            // アンダースコアで始まる場合
            let underscoreCount = 0;
            while (diffStr[i] === '_' && i < diffStr.length) {
                underscoreCount++;
                i++;
            }
            // アンダースコア数 + 2 文字を取得
            chunks.push(diffStr.slice(i, i + underscoreCount + 2));
            i += underscoreCount + 2;
        } else {
            // 通常の2文字
            chunks.push(diffStr.slice(i, i + 2));
            i += 2;
        }
    }

    console.log('chunks: ', chunks);

    return chunks.map(chunk => base52DecodeForFreqDiff(chunk));
}

// // test
// const str = '__abcd_efg_hij_klmnopq___rstuv'
// console.log(decodeFreqDiff(str))
// // Array(7) [ "abcd", "efg", "hij", "klm", "no", "pq", "rstuv" ]