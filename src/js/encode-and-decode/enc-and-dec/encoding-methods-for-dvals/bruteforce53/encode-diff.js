// Remains the [0-9] number values, NOT encode.

function handleSingleDigit(diff) {
    if (diff >= 0 && diff <= 9) {
        console.log('Value in [0-9]: ', diff);
        return diff;
    }
}


// Encode the frequent diff values via codebook.

// 頻出数値が Codebookに キーとして存在するかどうか を確認し (`codebookToEncodeFreqDiff.has`)
// 存在する場合にのみ 対応するアルファベット一文字に 置換     (`codebookToEncodeFreqDiff.get`)

function handleFrequencyDiff(diff, codebookToEncodeFreqDiff) {
    if (codebookToEncodeFreqDiff.has(diff)) {
        console.log('Diff value has included in codebook. diff => codebookToEncodeFreqDiff.get(diff): ', diff, ' => ', codebookToEncodeFreqDiff.get(diff));
        return codebookToEncodeFreqDiff.get(diff);
    }
}



// Base52 encode (with prefix) for too small|big numbers

// Rules:
//     大小両極の数字は baseX で 2文字に エンコード出来ないので baseXエンコードしない
//     代わりに Base52 でアルファベットにエンコードし Codebookを使って頻出数値から 一文字に変換をしたアルファベットと 区別するために アンダースコア('_')を 先頭に いくつか フラグとして付ける
//
//         エンコード後の文字数が 2文字 になった場合:
//             正の数値は 前に アンダースコアを 1個 付ける
//             負の数値は 前に アンダースコアを 2個 付ける
//         エンコード後の文字数が 3文字 になった場合:
//             正の数値は 前に アンダースコアを 3個 付ける
//             負の数値は 前に アンダースコアを 4個 付ける

// Limit:
//     52*52   =  2704 なので 数値が   2703(ZZ)  までは 2文字に変換できる
//     52*52*52=140608 なので 数値が 140607(ZZZ) までは 3文字に変換できる
//     UInt8Portray (grid size: 0-255)   までは diff の負の数を消した時に取り得る最大値 (2044)   を 2文字でカバーできる
//     UInt14Portray(grid size: 0-16383) までは diff の負の数を消した時に取り得る最大値 (131064) を 3文字でカバーできる

// BaseX の対象の中でも 大小両極の数字は 2文字以内に エンコード出来ないので BaseXエンコードは しない
// Base52 でアルファベットにエンコードし アンダースコア('_')を 先頭に 1|2|3|4個 フラグとして付ける
function handleBase52EncodingWithPrefix(diff, startOfIneligibleForBaseXEncHigher, endOfIneligibleForBaseXEncLower, baseXNumber) {

    if (diff <= endOfIneligibleForBaseXEncLower || startOfIneligibleForBaseXEncHigher <= diff) {
        // base52 エンコードしてアンダースコアを接頭辞として付加
        const diffEncoded = base52Encode(Math.abs(diff));
        const diffEncodedWithUnderscorePrefix = addUnderscorePrefixToBase52Encoded(diffEncoded, diff < 0);
        console.log(`${diff} は Base${baseXNumber} エンコード範囲外なので base52 エンコード ('_'を [1|2|3|4]個 フラグとして付ける): `, diffEncodedWithUnderscorePrefix);
        return diffEncodedWithUnderscorePrefix;
    }
}

// Add prefix
function addUnderscorePrefixToBase52Encoded(str, isNegative) {
    if (str.padStart(2, 'a').length = 2) {
        const prefix = isNegative ? '__' : '_';
        return prefix + str
    } else {          // str.length = 3
        const prefix = isNegative ? '____' : '___';
        return prefix + str
    }
}



// BaseX encode for excepts above.

// baseXエンコード可能な範囲にある場合 => BaseX でアルファベット2文字にエンコード
function handleBaseXEncoding(diff, baseXNumber) {
    const baseXEncoded = baseXEnc(diff, baseXNumber);
    console.log(`diffが baseXエンコード可能な範囲にあるので Base${baseXNumber} でアルファベット2文字にエンコード:`, diff, baseXEncoded);
    return baseXEncoded;
}
