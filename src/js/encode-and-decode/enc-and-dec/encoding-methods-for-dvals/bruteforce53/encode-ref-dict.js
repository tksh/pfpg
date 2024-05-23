// Encode the frequency diff values array as a string to attach

// 頻出数値の配列 を base52Encode して ひとつの文字列にまとめる
// 結果が 1文字の場合は `.padStart(2, 'a')` で 長さを 2文字 に揃える
// 結果が 3文字の場合は 先頭にアンダースコア '_' をひとつ付ける ( 'abc' => '_abc' )

function encodeFreqDiffAsReferenceDict(freqDiffArrActualCodebookSized) {
    const freqDiffEncoded = freqDiffArrActualCodebookSized.map((value) => base52EncodeForFreqDictValue(value))
    return freqDiffEncoded.join('') // return after joined as a string
}
