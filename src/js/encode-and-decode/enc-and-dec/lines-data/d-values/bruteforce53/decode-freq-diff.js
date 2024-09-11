import { base52DecodeForFreqDiff } from 'enc-and-dec/base-n/base-52-dec'

// Decode the frequent diff values

export function decodeFreqDiff(diffStr) {
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

// // Test to check the splitting into chunks (without base52DecodeForFreqDiff())
// const str = '__abcd_efg_hij_klmnopq___rstuv'
// console.log(decodeFreqDiff(str))
// // Array(7) [ "abcd", "efg", "hij", "klm", "no", "pq", "rstuv" ]