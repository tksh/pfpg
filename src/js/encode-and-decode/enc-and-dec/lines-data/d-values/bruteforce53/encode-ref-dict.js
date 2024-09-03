import { base52Enc }                          from 'enc-and-dec/base-n/base-52-enc'
import { addToEliminateNegativeBeforeEncode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'


// Create the reference dictionary
//   Encode the array of frequent diff values as a string to attach

// 頻出数値の配列 を base52Encode して ひとつの文字列にまとめる
//   結果が 1文字の場合は `.padStart(2, 'a')` で 長さを 2文字 に揃える
//   結果が 3文字の場合は 先頭にアンダースコア '_' をひとつ付ける ( 'abc' => '_abc' )

export function encodeFreqDiffAsRefDict(freqDiffArrActualCodebookSized) {
    const refDict = freqDiffArrActualCodebookSized.map((value) => base52EncodeForRefDict(value))
    return refDict.join('') // return after joined as a string
}


function base52EncodeForRefDict(num) {
    const encoded = base52Enc(addToEliminateNegativeBeforeEncode(num))

    // base52エンコードした結果が 3文字の場合 先頭に アンダースコアを追加
    if (encoded.length === 3) {
        return '_' + encoded
    }

    // それ以外の場合 結果の文字列を 二文字に揃える
    return encoded.padStart(2, 'a')
}
