import { base52Enc }           from 'enc-and-dec/base-n/base-52-enc'
import { getHalfOfBaseXRange } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { baseXEnc }            from 'enc-and-dec/lines-data/d-values/bruteforce53/base-x-enc'


export
    { handleSingleDigit
    , handleFrequencyDiff
    , calculateLimitsForBaseXSkipRange
    , handleBase52EncodingWithPrefix
    , handleBaseXEncoding
    }


// Remains the [0-9] number values, NOT encode.

function handleSingleDigit(diff) {
    if (diff >= 0 && diff <= 9) {
        //console.log('Value in [0-9]: ', diff)
        return diff
    }
}



// Encode the frequent diff values via codebook.

// 頻出数値が Codebookに キーとして存在するかどうか を確認し (`codebookToEncodeFreqDiff.has`)
// 存在する場合にのみ 対応するアルファベット一文字に 置換     (`codebookToEncodeFreqDiff.get`)

function handleFrequencyDiff(diff, codebookToEncodeFreqDiff) {
    if (codebookToEncodeFreqDiff.has(diff)) {
        //console.log('Diff value has included in codebook. diff => codebookToEncodeFreqDiff.get(diff): ', diff, ' => ', codebookToEncodeFreqDiff.get(diff))
        return codebookToEncodeFreqDiff.get(diff)
    }
}



// Base52 encode with some '_' prefix for too small|big numbers

// Rules:
//     大小両極の数字は baseX で 2文字以内に エンコード出来ないので baseXエンコードしない
//     代わりに Base52 でアルファベットにエンコードし Codebookを使って頻出数値から 一文字に変換をしたアルファベットと 区別するために アンダースコア('_')を 先頭に いくつか フラグとして付ける
//
//         エンコード後の文字数が 2文字 になった場合:
//             正の数値は 前に アンダースコアを 1個 付ける
//             負の数値は 前に アンダースコアを 2個 付ける
//         エンコード後の文字数が 3文字 になった場合:
//             正の数値は 前に アンダースコアを 3個 付ける
//             負の数値は 前に アンダースコアを 4個 付ける
//         エンコード後の文字数が 4文字 になった場合:
//             正の数値は 前に アンダースコアを 5個 付ける
//             負の数値は 前に アンダースコアを 6個 付ける

// Formula:
//     (エンコード後の文字数 - 1) * 2 - 1 = 正の数値に付ける アンダースコアの 個数
//     (エンコード後の文字数 - 1) * 2     = 負の数値に付ける アンダースコアの 個数
function getNumberOfUnderscorePrefix(str, isPositive) {
    const lengthBasedValue = (str.length - 1) * 2;

    console.log("str is too long|short", str, lengthBasedValue - 1, lengthBasedValue)

    if (isPositive) {
        return lengthBasedValue - 1; // 正の数値に付ける アンダースコアの個数
    } else {
        return lengthBasedValue;     // 負の数値に付ける アンダースコアの個数
    }
}

// Prepend some underscore signs
function prependUnderscores(str, isPositive) {
    const numberOfUnderscores = getNumberOfUnderscorePrefix(str, isPositive);
    const underscorePrefix = '_'.repeat(numberOfUnderscores);
    console.log("str is too long|short", str, isPositive, underscorePrefix)
    return underscorePrefix + str;
}

// Limits:
//     52*52       =    2704 なので 数値が    2703(ZZ)   までは 2文字に変換できる
//     52*52*52    =  140608 なので 数値が  140607(ZZZ)  までは 3文字に変換できる
//     52*52*52*52 = 7311616 なので 数値が 7311615(ZZZZ) までは 4文字に変換できる
//     UInt8Portray (grid size: 0 -     255) までは diff の負の数を消した時に取り得る最大値 (    2,044) を 2文字でカバーできる
//     UInt14Portray(grid size: 0 -  16,383) までは diff の負の数を消した時に取り得る最大値 (  131,064) を 3文字でカバーできる
//     UInt19Portray(grid size: 0 - 524,287) までは diff の負の数を消した時に取り得る最大値 (4,194,296) を 4文字でカバーできる


// Calculate the threshold for target range of BaseX ans Base52
function calculateLimitsForBaseXSkipRange(baseXNumber, minimumDiffValue, maximumDiffValue) {
    // Get the baseX encoding target range (values within this range will be encoded)
    const baseXTargetRangeStart = 0 - getHalfOfBaseXRange(baseXNumber)
    const baseXTargetRangeEnd   =     getHalfOfBaseXRange(baseXNumber) + 9
    console.log(`Range to target for Base${baseXNumber} encoding: ${baseXTargetRangeStart} ... 0 / 9 ... ${baseXTargetRangeEnd}`)
    // e.g: -40  < 0 | 9 <  49

    // Get the range to skip BaseX encoding (values outside this range will be skipped and Base52 encoding will be applied)
    const baseXSkipRangeLowerLimit = baseXTargetRangeStart - 1
    const baseXSkipRangeUpperLimit = baseXTargetRangeEnd + 1
    console.log(`Range to skip for Base${baseXNumber} encoding: minimum diff value = ${minimumDiffValue} ... ${baseXSkipRangeLowerLimit} / ${baseXSkipRangeUpperLimit} ... ${maximumDiffValue} = maximum diff value`)
    // e.g.: -124  <  -41  |  50  <  124

    return {
        baseXSkipRangeLowerLimit,
        baseXSkipRangeUpperLimit
    }
}

// Base52 encode
function handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits) {

    // Check if original d value number is within the range -65532 and 65532,
    // this is max diff value range for bruteforce53 with UInt14Portray
    //   UInt14Portray range:
    //     Absolute => [     0 - 16383] (2 ** 14 = 16384)
    //     Relative => [-32766 - 32766]
    //     Diff     => [-65532 - 65532]
    if (diff < -65532 || diff > 65532) {
        throw new Error(`Value out of range: ${diff}. Must be between -65532 and 65532.`)
    }

    // Encode
    if (diff <= baseXRangeLimits.baseXSkipRangeLowerLimit || baseXRangeLimits.baseXSkipRangeUpperLimit <= diff) {
        // base52エンコードして 2桁に'a'でパディングしたあと いくつかのアンダースコアを 接頭辞として付加
        const diffEncoded = base52Enc(Math.abs(diff)).padStart(2, 'a')
        const diffEncodedWithUnderscorePrefix = prependUnderscores(diffEncoded, diff > 0)
        console.log(
            `diff ${diff} は Base${baseXNumber} エンコード範囲外なので Base52エンコード ('_'を いくつか フラグとして付ける): `,
            diffEncodedWithUnderscorePrefix
        )
        return diffEncodedWithUnderscorePrefix
    }
}



// BaseX encode will be applied for excepts above cases.

// baseXエンコード可能な範囲にある場合 => BaseX でアルファベット2文字にエンコード
function handleBaseXEncoding(diff, baseXNumber) {
    const baseXEncoded = baseXEnc(diff, baseXNumber)
    //console.log(`diff ${diff} は baseXエンコード可能な範囲にあるので Base${baseXNumber} でアルファベット2文字にエンコード:`, baseXEncoded)
    return baseXEncoded
}
