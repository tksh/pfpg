// Don't encode the [0-9] number values

function handleSingleDigit(diff) {
    if (diff >= 0 && diff <= 9) {
        console.log('Value in [0-9]: ', diff);
        return diff;
    }
}


// Encode the frequent diff values via codebook

function handleFrequencyDiff(diff, codebookToEncodeFreqDiff) {
    if (codebookToEncodeFreqDiff.has(diff)) {
        console.log('Diff value has included in codebook. diff => codebookToEncodeFreqDiff.get(diff): ', diff, ' => ', codebookToEncodeFreqDiff.get(diff));
        return codebookToEncodeFreqDiff.get(diff);
    }
}



// Encode the other values with BaseX or Base52(with prefix)

// Flow:
//     先ず baseX対象範囲外 の数値を 処理して 最後に残った baseX対象のものを else で処理する

// Rules:
//     大小両極の数字は baseX で 2文字に エンコード出来ないので baseXエンコードしない
//     代わりに Base52 でアルファベットにエンコードし codebookを使って頻出数値から 一文字に変換をしたアルファベットと 区別するために アンダースコア('_')を 先頭に いくつか フラグとして付ける
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

function handleBaseXEncoding(diff, startOfIneligibleForBaseXEncHigher, endOfIneligibleForBaseXEncLower, baseXNumber) {
    // baseX の対象の中でも 大小両極の数字は baseX で 2文字で エンコード出来ないので baseXエンコードは しない
    // Base52 でアルファベットにエンコードし 上で一文字変換をしたアルファベットと区別するために `_`を 先頭に いくつか 付ける
    let diffEncodedWithUnderscorePrefix;

    if (diff <= endOfIneligibleForBaseXEncLower) {
        // 負の数なので baseXエンコードできない場合
        let diffEncoded = String(base52Encode(Math.abs(diff))); // Math.absで絶対値に変換して マイナス記号を消す
        if (diffEncoded.length <= 2) { // Add `__` as prefix for encoded as 2 digits from minus number
            diffEncodedWithUnderscorePrefix = '__' + diffEncoded.padStart(2, 'a'); // total: 4 (2+2) chars
        } else if (diffEncoded.length == 3) { // Add `____` as prefix for encoded as 3 chars from minus number
            diffEncodedWithUnderscorePrefix = '____' + diffEncoded; // total: 7 (4+3) chars
        }
        console.log(`${diff} は 小さ過ぎて Base${baseXNumber}Encの 対象範囲外なので base52Encしてから 2|4 個の'_'を prefixとして加える: `, diff, diffEncodedWithUnderscorePrefix);
        return diffEncodedWithUnderscorePrefix;
    } else if (startOfIneligibleForBaseXEncHigher <= diff) {
        // 大きい正の数で baseXエンコードでは 三桁以上になってしまう場合
        let diffEncoded = String(base52Encode(diff));
        if (diffEncoded.length <= 2) { // Add `_` as prefix for encoded as 2 chars from plus number
            diffEncodedWithUnderscorePrefix = '_' + diffEncoded.padStart(2, 'a'); // total: 3 (1+2) chars
        } else if (diffEncoded.length == 3) { // Add `___` as prefix for encoded as 3 chars from plus number
            diffEncodedWithUnderscorePrefix = '___' + diffEncoded; // total: 6 (3+3) chars
        }
        console.log(`${diff} は 大き過ぎて Base${baseXNumber}Encの 対象範囲外なので base52Encしてから 1|3 個の'_'を prefixとして加える: `, diff, diffEncodedWithUnderscorePrefix);
        return diffEncodedWithUnderscorePrefix;
    } else {
        // diffが baseXエンコード可能な範囲にある場合
        // BaseX でアルファベット2文字にエンコード
        const baseXEncoded = baseXEnc(diff, baseXNumber);
        console.log(`diffが baseXエンコード可能な範囲にあるので Base${baseXNumber} でアルファベット2文字にエンコード:`, diff, baseXEncoded);
        return baseXEncoded;
    }
}
