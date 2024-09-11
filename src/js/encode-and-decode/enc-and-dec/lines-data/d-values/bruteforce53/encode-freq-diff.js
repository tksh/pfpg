import { base52Enc }                          from 'enc-and-dec/base-n/base-52-enc'
import { addToEliminateNegativeBeforeEncode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'


// Encode the array of frequent diff values as a string to attach

// 頻出数値の配列 を base52Encode してから ひとつの文字列にまとめる
//     エンコード結果が 1文字    の場合は 長さを 2文字 に揃える                 ('a' => 'aa')
//     エンコード結果が 2文字    の場合は そのまま                            ('ab' => 'ab')
//     エンコード結果が 3文字以上 の場合は 先頭にアンダースコア '_' を いくつか 付ける  ('abc' => '_abc')

export function encodeFreqDiff(freqDiffArrActualCodebookSized) {
    const freqDiff = freqDiffArrActualCodebookSized.map((value) => base52EncodeForFreqDiff(value))
    return freqDiff.join('')
}

function base52EncodeForFreqDiff(num) {
    // Encode
    const encoded = base52Enc(addToEliminateNegativeBeforeEncode(num))

    // Add flags
    // base52エンコードした結果が 3文字以上 の場合
    //    n文字の場合 先頭に アンダースコアを (n - 2) 個 追加

    //    e.g.:
    //    3文字の場合 先頭に アンダースコアを 1個 追加
    //    4文字の場合 先頭に アンダースコアを 2個 追加
    //    5文字の場合 先頭に アンダースコアを 3個 追加

    if (encoded.length > 2) {
        const numberOfUnderscores = encoded.length - 2
        return '_'.repeat(numberOfUnderscores) + encoded
    }

    // Padding
    // それ以外 1 or 2 文字 の場合 結果の文字列を 2文字に揃える
    return encoded.padStart(2, 'a')
}
