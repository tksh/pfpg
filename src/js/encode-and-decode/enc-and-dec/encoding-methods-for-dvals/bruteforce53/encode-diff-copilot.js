// 頻出数値Top${maxCodebookSize} dictArray[index] が存在するかどうかを確認し 存在する場合にのみ `has` でキーを探し
// ${maxCodebookSize}個のアルファベット のどれか一文字に置換
function encodeDiff(diff, codebookToEncodeFreqDiff, maxCodebookSize, baseXNumber, endOfIneligibleForBaseXEncLower, startOfIneligibleForBaseXEncHigher) {
    // [0-9] の一桁の正の数は そのままにする
    if (diff >= 0 && diff <= 9) {
        console.log('Value in [0-9]: ', diff);
        return diff;
    } else if (codebookToEncodeFreqDiff.has(diff)) {
        // 頻出数値Top${maxCodebookSize} dictArray[index] が存在するかどうかを確認し 存在する場合にのみ `has` でキーを探し
        console.log('diff value in freq dict, diff and codebookToEncodeFreqDiff.get(diff): ', typeof(diff), diff, codebookToEncodeFreqDiff.get(diff));
        return codebookToEncodeFreqDiff.get(diff);
    } else {
        // [0-9]でもなく 頻出辞書のキーにも なければ baseX でEncode
        return encodeWithBaseX(diff, baseXNumber, endOfIneligibleForBaseXEncLower, startOfIneligibleForBaseXEncHigher);
    }
}

// BaseX または Base52 エンコーディングを行う関数
function encodeWithBaseX(diff, baseXNumber, endOfIneligibleForBaseXEncLower, startOfIneligibleForBaseXEncHigher) {
    let diffEncoded, diffEncodedWithUnderscorePrefix;
    // diffが baseXエンコード可能な範囲にある場合
    if (diff > endOfIneligibleForBaseXEncLower && diff < startOfIneligibleForBaseXEncHigher) {
        const baseXEncoded = baseXEnc(diff, baseXNumber);
        console.log(`diffが baseXエンコード可能な範囲にあるので Base${baseXNumber} でアルファベット2文字にエンコード:`, diff, baseXEncoded);
        return baseXEncoded;
    } else {
        // baseX の対象範囲外の場合、Base52 でエンコード
        diffEncoded = String(base52Encode(Math.abs(diff)));
        diffEncodedWithUnderscorePrefix = encodeWithUnderscores(diff, diffEncoded);
        console.log(`diffが Base${baseXNumber}Encの 対象範囲外なので base52Encしてから '_'を prefixとして加える: `, diff, diffEncodedWithUnderscorePrefix);
        return diffEncodedWithUnderscorePrefix;
    }
}

// アンダースコアを付けてエンコードする関数
function encodeWithUnderscores(diff, diffEncoded) {
    if (diff < 0) {
        // 負の数値の場合
        return diffEncoded.length <= 2 ? '__' + diffEncoded.padStart(2, 'a') : '____' + diffEncoded;
    } else {
        // 正の数値の場合
        return diffEncoded.length <= 2 ? '_' + diffEncoded.padStart(2, 'a') : '___' + diffEncoded;
    }
}

// diffArr配列をエンコードする
const diffArrEncoded = diffArr.map((diff) => encodeDiff(diff, codebookToEncodeFreqDiff, maxCodebookSize, baseXNumber, endOfIneligibleForBaseXEncLower, startOfIneligibleForBaseXEncHigher));
console.log('diffArrEncoded: ', diffArrEncoded);
