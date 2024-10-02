import { tryDecompress }         from 'decode/try-decompress'
import { base53Enc }             from 'enc-and-dec/base-n/base-53-enc'
import { parseBasicData }        from 'enc-and-dec/basic-data/basic-data-enc'
import { getActualCodebookSize } from 'enc-and-dec/lines-data/d-values/bruteforce53/actual-codebook-size'
import { createCodebookToEnc }   from 'enc-and-dec/lines-data/d-values/bruteforce53/create-codebook-to-enc'
import { calculateLimitsForBaseXSkipRange
       , handleBase52EncodingWithPrefix
       , handleBaseXEncoding
       , handleFrequencyDiff
       , handleSingleDigit }     from 'enc-and-dec/lines-data/d-values/bruteforce53/encode-diff'
import { encodeFreqDiff }        from 'enc-and-dec/lines-data/d-values/bruteforce53/encode-freq-diff'
import { storeShorter }          from 'enc-and-dec/lines-data/d-values/bruteforce53/store-shorter'
import { joinWithAmpersand }     from 'encode/join-with-ampersand'
import { jsonToMapObj }          from 'encode/json-to-map-obj'
import { showResult }            from 'encode/show-result'
import { simplifyMap }           from 'encode/simplify-map'
import { tryCompress }           from 'encode/try-compress'
import { resultInfo } from 'constants'

// Three layers iterations
//   1. for-loop: Max codebook size from 0 to 52
//   2.     .map: Lines-group (.g_id) from 0 to group size - 1
//   3.     .map: Coordinate from 'x1' to 'y2'

// Constants
const MAX_CODEBOOK_SIZE_START = 0
const MAX_CODEBOOK_SIZE_END = 52
const COORDINATES = ['x1', 'y1', 'x2', 'y2']


// Main function
export async function bruteforce53Enc() {
    const startTime = performance.now()
    const encodingMethodName = 'bruteforce53'
    let currentShortestByGroups = new Map()

    // Get the range of diff value to calculate the baseXRangeLimits value
    const uintN = tryDecompress(parseBasicData().n)
    const diffValueRange = calculateDiffLimits(uintN)

    // Bruteforce encoding for 53 patterns (Max codebook size: 0 -> 52, BaseX number: 52 -> 0)
    for (let maxCodebookSize = MAX_CODEBOOK_SIZE_START; maxCodebookSize <= MAX_CODEBOOK_SIZE_END; maxCodebookSize++) {
        const baseXNumber = 52 - maxCodebookSize
        console.log(`///////////////// maxCodebookSize: ${maxCodebookSize}, baseXNumber: ${baseXNumber} /////////////////`)

        const encodedDvals = processGroups(baseXNumber, diffValueRange)
        const compressResult = await compressAndStore(encodedDvals, encodingMethodName, baseXNumber)

        // currentShortestByGroups = updateShortestByGroups(currentShortestByGroups, compressResult, baseXNumber, maxCodebookSize)
        currentShortestByGroups = updateShortestByGroups(currentShortestByGroups, compressResult.compressedByGroups, baseXNumber, maxCodebookSize)
    }

    // Aggregate and correct flags information for 'bruteforce53' method
    // - At this point, the first flag (Compression method name) under 'bruteforce53 Flags' is incorrect
    // - This is because tryCompress() in compressAndStore() is suitable for encoding methods other than 'bruteforce53'
    // - We need to merge the correct flags arrays that are stored separately by group IDs
    // - These arrays are stored under keys matching the pattern 'bruteforce53FlagsOfGroupId=[gId]'
    // - After merging, we'll remove the individual flag entries to clean up the resultInfo map
    mergeFlagsArr(resultInfo)
    console.log("||||resultInfo:", resultInfo)

    return finalizeResults(currentShortestByGroups, encodingMethodName, startTime)
}

function processGroups(baseXNumber, diffValueRange) {
    const aggDataByGroups = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

    // Get the lower and upper limits for baseX exclusion for handleBase52EncodingWithPrefix()
    const baseXRangeLimits = calculateLimitsForBaseXSkipRange(baseXNumber, diffValueRange)

    // Process each lines group (g_id ranges from 0 to group size - 1)
    return new Map(
        Array.from(aggDataByGroups.values()).map(aggData => {
            const freqDiffAndDiffFourCoords = processCoordinates(aggData, baseXNumber, baseXRangeLimits)
            const encodedDvalStr = encodeGroupData(freqDiffAndDiffFourCoords, baseXNumber)
            return [aggData.g_id, encodedDvalStr]
        })
    )
}

function processCoordinates(aggData, baseXNumber, baseXRangeLimits) {
    return COORDINATES.map(coord => {
        // Get the values
        const diffArr = aggData.d.relative.diff_by_row[coord]
        const freqDiffArr = aggData.d.relative.frequent_diff_values_sorted[coord]

        // Create the codebook
        const actualCodebookSize = getActualCodebookSize(baseXNumber, freqDiffArr)
        const codebookToEncodeFreqDiff = createCodebookToEnc(freqDiffArr.slice(0, actualCodebookSize), actualCodebookSize)

        // Encode the values
        const freqDiffEncoded = encodeFreqDiff(freqDiffArr.slice(0, actualCodebookSize))
        const diffArrEncoded = encodeDiffArray(diffArr, codebookToEncodeFreqDiff, baseXNumber, baseXRangeLimits)

        return `${freqDiffEncoded}-${diffArrEncoded.join('')}`
    })
}

function encodeDiffArray(diffArr, codebook, baseXNumber, baseXRangeLimits) {
    return diffArr.map(diff =>
        // [0-9] の一桁の正の数は そのままにする
        handleSingleDigit(diff) ??

        // 頻出数値が codebookに キーとして存在するかどうか を確認し 存在する場合にのみ 対応する アルファベット1文字 に 置換する
        handleFrequencyDiff(diff, codebook) ??

        // 数値が [大き|小さ] 過ぎて BaseX で 2桁 にエンコードできないものは base52エンコードしてから アンダースコア を先頭にフラグとして 条件に応じて いくつか付ける
        // 上の codebook と 下の BaseX は それぞれ重複しないアルファベットを 切り出して使っているが
        // Base52 は 両方ともと 同じ種類の文字を使っているので デコード時にそれらと区別できるようにする為の フラグが必要
        handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits) ??

        // 上記 3条件 いずれでもなければ baseX で アルファベット2文字 に エンコードする
        handleBaseXEncoding(diff, baseXNumber)
    )
}

function encodeGroupData(freqDiffAndDiffFourCoords, baseXNumber) {
    const joined = freqDiffAndDiffFourCoords.join('-')
    const baseXEncoded = base53Enc(baseXNumber)
    return baseXEncoded + joined  // Encoded d-values structure: [baseX encoded][x1]-[y1]-[x2]-[y2]
}

// Try compress, choose shorter, then add prefix to form: [group_colors]=[widths_and_counts]-[d_values]
//   1. Prepend the [encoded stroke-width values and counts] to the beginning of [encoded d values].
//   2. Compress the above combined string and choose the shorter one.
//   3. Prepend the [encoded group-colors value] to the chosen string.
async function compressAndStore(encodedDvals, encodingMethodName, baseXNumber) {
    const { compressedByGroups, compressingResultArr } = await tryCompress(encodedDvals, encodingMethodName, baseXNumber)
    return { compressedByGroups, compressingResultArr }
}

// function updateShortestByGroups(currentShortestByGroups, compressResult, baseXNumber, maxCodebookSize) {
function updateShortestByGroups(currentShortestByGroups, compressedByGroups, baseXNumber, maxCodebookSize) {
    // const transformedMap = transformMap(compressResult.compressedByGroups, baseXNumber)
    const transformedMap = transformMap(compressedByGroups, baseXNumber)
    return maxCodebookSize === MAX_CODEBOOK_SIZE_START
        ? transformedMap  // At first loop (maxCodebookSize: 0, baseXNumber: 52), init the Map with current value
        : storeShorter(currentShortestByGroups, transformedMap, baseXNumber) // After second loop
}

function finalizeResults(currentShortestByGroups, encodingMethodName, startTime) {
    const shortestStrByGroups = simplifyMap(currentShortestByGroups)  // simplify the value of Map, [string, length, baseX] => string
    const wholeGroupJoined = joinWithAmpersand(shortestStrByGroups)
    showResult(encodingMethodName, startTime, wholeGroupJoined, currentShortestByGroups)
    return currentShortestByGroups
}


// 入力されたマップオブジェクトの値を '文字列' から 3要素から成る '配列' に変更し storeShorter() の返り値と 同じ構造にする
// [0]の要素に 元の値の 文字列 を入れる
function transformMap(map, baseXNumber) {
    return new Map(
        Array.from(map.entries()).map(([key, value]) => [key, [value, 'encodingMethodName', { baseXNumber }]])
    )
}

// Get the range of diff value
function calculateDiffLimits(uintN) {
    return {
        min: 0 - (2 ** uintN - 1) * 4,
        max:     (2 ** uintN - 1) * 4
    }
}

// Merge correct separately flags into one, then remove originals
function mergeFlagsArr(resultInfo) {
    // Filter the resultInfo entries to include only those with keys starting with "bruteforce53FlagsOfGroupId"
    const flagsByGroupsArr = Array.from(resultInfo.entries())
        .filter(([key]) => key.startsWith('bruteforce53FlagsOfGroupId'))
        .map(([, value]) => value);

    // Set the "bruteforce53 Flags" key in resultInfo to the filtered array
    resultInfo.set('bruteforce53 Flags', flagsByGroupsArr);

    // Remove the original entries with keys starting with "bruteforce53FlagsOfGroupId"
    resultInfo.forEach((_, key) => {
        if (key.startsWith('bruteforce53FlagsOfGroupId')) {
            resultInfo.delete(key);
        }
    });
}
