import { resultInfo }            from 'constants'
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
import { createMapFromNestedArrays
       , mergeArrays }           from 'encode/transform-array'

////////////////////////////////// Input: //////////////////////////////////

// Basic Data
// Lines Data
// Lines Data Aggregated for Encoding


// for-loop 1: Max dict size from 0 to 52
// for-loop 2: Each lines-group (.g_id) from 0 to group size
// for-loop 3: Coordinate set from 'x1' to 'y2'

export function bruteforce53Enc() {
    const startTime = performance.now()

    const encodingMethodName = 'bruteforce53'

    // To store the shortest encoded string of each group
    let currentShortestByGroups = new Map()

    // To store info
    let resultArrWholeBaseX = []

    const maxCodebookSizeStartAt = 0
    const maxCodebookSizeEndAt = 52

    // min|max diff value (Just for indicating to console at function calculateLimitsForBaseXSkipRange(baseXNumber))
    const uintN = tryDecompress(parseBasicData().n)
    const minimumDiffValue = 0 - (2 ** uintN - 1) * 4
    const maximumDiffValue =     (2 ** uintN - 1) * 4

    // Loop 1. Max dict size from 0 to 52

    for (let i = maxCodebookSizeStartAt; i <= maxCodebookSizeEndAt; i++) {
        const maxCodebookSize = i
        const baseXNumber = 52 - i
        console.log('////////////////////////////////// maxCodebookSize: ', maxCodebookSize, ' //////////////////////////////////') // 0, 1, ... 51, 52
        console.log('////////////////////////////////// baseXNumber: ', baseXNumber, ' //////////////////////////////////') // 52, 51, ... 1, 0

        const encodedDvals = new Map()

        // To store info
        let resultNumArrByGroups = []

        const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

        // Get the lower and upper limits for baseX exclusion.
        // This is the argument for handleBase52EncodingWithPrefix().
        const baseXRangeLimits = calculateLimitsForBaseXSkipRange(baseXNumber, minimumDiffValue, maximumDiffValue)
        // Object { baseXSkipRangeLowerLimit, baseXSkipRangeUpperLimit }

        // Loop 2. Each lines-group (.g_id) from '1' to group size

        for (const aggData of aggDataMap.values()) {
            //console.log('aggData.g_id: ', aggData.g_id)
            // 1
            //console.log('aggData.d.relative: ', aggData.d.relative)
            // Object { diff_by_row: {…}, frequent_diff_values_sorted: {…}, frequent_diff_counts_sorted: {…} }

            let freqDiffAndDiffFourCoords = []

            // Loop 3. Coordinate set from 'x1' to 'y2'

            for (const coord of ['x1', 'y1', 'x2', 'y2']) {
                console.log('//////// coord: ', coord, '////////')

                // Diff-by-row original
                let diffArr = aggData.d.relative.diff_by_row[coord]
                // e.g.: (19) [1, 2, 0, -3, -2, 1, 9, -7, -3, 6, -2, -15, -3, 30, -12, -3, 1, -1, -7]

                // Diff-by-row sorted by frequency and removed the values that only once appeared
                let freqDiffArr = aggData.d.relative.frequent_diff_values_sorted[coord]
                // e.g.: (3) [-3, -2, -7]


                // Generate the codebook to encode frequent diff_by_row values

                // Source symbol of codebook => Value of diff_by_row
                // Codeword      of codebook => Alphabets

                // Define the size of codebook:
                // If      freqDiffArr.length is OVER maxCodebookSize,  => actualCodebookSize.length is maxCodebookSize
                // Else if freqDiffArr.length is UNDER maxCodebookSize, => actualCodebookSize.length equals freqDiffArr.length

                // Get the number of actual codebook length in this coord
                const actualCodebookSize = getActualCodebookSize(maxCodebookSize, freqDiffArr)

                // Extract top ${maxCodebookSize} elements of numerical numbers

                // ${actualCodebookSize}個の数値を切り出したい時には [0]...[${actualCodebookSize} - 1]が ${actualCodebookSize}個なので
                // `.slice(0, ${actualCodebookSize})` とする (`.slice`の 第二引数の終了位置は切り出されない)
                const freqDiffArrActualCodebookSized = freqDiffArr.slice(0, actualCodebookSize)
                // If actualCodebookSize is 0, Empty array `[]` will be returned

                // Create the codebook to encode
                const codebookToEncodeFreqDiff = createCodebookToEnc(freqDiffArrActualCodebookSized, actualCodebookSize)
                console.log('maxCodebookSize and codebookToEncodeFreqDiff: ', maxCodebookSize, codebookToEncodeFreqDiff)
                // e.g.: Map(29) {-2 => 'x', -1 => 'y', -4 => 'z', -7 => 'A', -3 => 'B', …}


                // Encode the array of frequent diff values as a string to attach
                const freqDiffEncoded = encodeFreqDiff(freqDiffArrActualCodebookSized)
                console.log('maxCodebookSize and freqDiffEncoded: ', maxCodebookSize, freqDiffEncoded)

                try {
                    // Encode the diff values
                    const diffArrEncoded = diffArr.map((diff) => {

                        // [0-9] の一桁の正の数は そのままにする
                        let result = handleSingleDigit(diff)
                        if (result !== undefined) return result

                        // 頻出数値が codebookに キーとして存在するかどうか を確認し 存在する場合にのみ 対応する アルファベット1文字 に 置換する
                        result = handleFrequencyDiff(diff, codebookToEncodeFreqDiff)
                        if (result !== undefined) return result

                        // 数値が [大き|小さ]過ぎて BaseX で 2桁 にエンコードできないものは base52エンコードしてから アンダースコア を先頭にフラグとして 条件に応じて いくつか 付ける
                        //   上の Codebook と 下の BaseX は それぞれ重複しないアルファベットを 切り出して使っているが
                        //   Base52 は 両方ともと同じ種類の文字を使っているので デコード時にそれらと区別できるようにするため フラグを付ける
                        result = handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits)
                        if (result !== undefined) return result

                        // 上記 3条件 いずれでもなければ baseX で アルファベット2文字 に エンコードする
                        console.log(`Apply base${baseXNumber} for: ${diff}, result: ${handleBaseXEncoding(diff, baseXNumber)}`)
                        return handleBaseXEncoding(diff, baseXNumber)
                    })

                    console.log('diffArrEncoded: ', diffArrEncoded)
                    // e.g.: (484) [7, 'ln', 'B', 'B', 'D', 'N', 'X', 6, 'nl', 'U', 8, ...

                    // Join the encoded diff values as a string
                    const diffEncodedJoined = diffArrEncoded.join('')
                    // Join the frequent diff and diff to form: '[encoded frequent_diff]-[encoded diff_by_row]'
                    const freqDiffAndDiff = freqDiffEncoded + '-' + diffEncodedJoined

                    // Push to merge coordinate set into one array: [x1, y1, x2, y2]
                    freqDiffAndDiffFourCoords.push(freqDiffAndDiff)

                } catch (error) {
                    // 外側のエラーハンドリングでキャッチし、処理を中断する
                    console.error("An error occurred during encoding:", error.message)
                    return null // 処理を中断し、nullを返す
                }

            }

            //console.log('freqDiffAndDiffFourCoords: ', freqDiffAndDiffFourCoords)
            // 頻出数値が無い場合 hyphen始まりになる (4) ['-0lalO44lHlqlflh75lklJ5lLlg', 'crbR-0260Z0zlrlVz2ZlGlNlIlk', 'cr-lWLWz0lL100001z1z22', 'cqct-1ZlKlNlH130z011Z21z']

            // Join coordinate set to form: '[x1]-[y1]-[x2]-[y2]'
            const freqDiffAndDiffFourCoordsJoined = freqDiffAndDiffFourCoords.join('-')

            // Encode the baseXNumber to prepend
            const baseXEncoded = base53Enc(baseXNumber)

            // Final encoded d value form to: [baseX][freqDiff]-[encodedDiff]
            const encodedDvalStr = baseXEncoded + freqDiffAndDiffFourCoordsJoined

            // Set the encoded d values into map as value with group ID key
            encodedDvals.set(aggData.g_id, encodedDvalStr)


            // Store info
            resultNumArrByGroups.push([aggData.g_id, baseXNumber, encodedDvalStr.length])
        }

        // Store info
        //resultArrWholeBaseX.push(...resultNumArrByGroups)

        console.log('resultArrWholeBaseX: ', resultArrWholeBaseX)
        // e.g.: Map(5) {'1' => 'crcscn-120yZ19zy6ZlqyMKlSy1lxz-cr-0lL1Md7lpMElvlWlrzMIlUlqMHz00lP-cpcqct-00z5Z41Zz0031lXy326y-crcscd-MIlxZzylUMAMezME2lMlvMayZ01', '2' => '-0lNM ...
        // e.g.: x1からy2まで 全てに頻出数値が無い場合: '5' => '-lmlF3lL10lK--lRLPlp4lk4lj--0lk1lL130--21lL1lk00'}



        // Try compress and add prefix

        // 1. Prepend the encoded stroke-width value and counts to the beginning of encoded d values
        // 2. Compress the combined string using URLCompressor and choose the shorter version.
        // 3. Prepend the encoded group-colors value to the chosen string (compressed or original).

        // Format: [group-colors]=[widths-and-counts]-[d-values]


        // Choose shorter one between URLComp applied or not, by each group
        const { compressedByGroups, compressingResultArr } = tryCompress(
            encodedDvals,
            encodingMethodName
        )
        console.log(`baseXNumber = ${baseXNumber}, compressedByGroups: `, compressedByGroups)
        //  Map(5) {'1' => '0=129CaIjMCzLAFox3gEVYTdnymbAmwP-UWDCnew3h-Aqsd6rQsPf7nuc97B-Tyl896LIItSqsH-0_igZRCKY265Ta0zzD8-axd0B3NgagFJ2rRrUWcULFyn1IwBi', '2' => '0=129zi ...


        const resultArr = mergeArrays(resultNumArrByGroups, compressingResultArr)
        // input:
        // resultNumArrByGroups
        //     0: (3) [0, 52, 20]
        //     1: (3) [1, 52, 3497]
        //     2: (3) [2, 52, 144]
        //      ...
        // compressingResultArr
        //     0: (3) [27, 27, 'uncompressed']
        //     1: (3) [3511, 2709, 'URLCompressor']
        //     2: (3) [149, 133, 'URLCompressor']
        //      ...
        console.log("resultArr: ", resultArr)
        // output:
        //     (3) [Array(6), Array(6), Array(6)]
        //         0: (6) [0, 52, 20, 27, 27, 'uncompressed']
        //         1: (6) [1, 52, 3497, 3511, 2709, 'URLCompressor']
        //         2: (6) [2, 52, 144, 149, 133, 'URLCompressor']
        //         length: 3

        resultArrWholeBaseX.push(...resultArr)


        // Store the shortest string by each group

        // At first loop, init the map with current value and change the structure
        if (maxCodebookSize === maxCodebookSizeStartAt) {
            currentShortestByGroups = transformMap(compressedByGroups, baseXNumber, encodingMethodName)
            console.log(
                `currentShortestByGroups in first loop (maxCodebookSize: ${maxCodebookSize}, baseX: ${baseXNumber}): `,
                currentShortestByGroups
            )
        }

        // After second loop
        currentShortestByGroups = storeShorter(
            currentShortestByGroups,
            transformMap(compressedByGroups, baseXNumber),
            baseXNumber
        )

    } // End of Loop for every baseX values: [0-52]
    //console.log('currentShortestByGroups: ', currentShortestByGroups)


    // simplify the value of Map, [string, length, baseX] => string
    const shortestStrByGroups = simplifyMap(currentShortestByGroups)

    // Whole group strings joined with '&' (ampersand sign)
    const wholeGroupJoined = joinWithAmpersand(shortestStrByGroups)

    // Show the encoded result and processing time to html and console
    showResult(
        encodingMethodName,
        startTime,
        wholeGroupJoined, currentShortestByGroups  // encoded data
    )

    // Set result info with 'bruteforce53-analytics--...'
    // the relations of each baseX numbers and result string length
    const resultByGroups = createMapFromNestedArrays(resultArrWholeBaseX)
    resultInfo.set(
        'bruteforce53-analytics--0_baseX-1_encodedDvals-2_uncompressed-3_bestCompressed-4_bestMethod',
        resultByGroups
    )

    return currentShortestByGroups
}



// 値を 文字列から3要素の配列に変更し storeShorter() の返り値と同じ構造にする
// 最初の要素に元の値の文字列を入れる
function transformMap(map, baseXNumber, encodingMethodName) {
    const newMap = new Map()

    map.forEach((value, key) => {
        const newArray = [value, encodingMethodName, { baseXNumber }]
        newMap.set(key, newArray)
    })

    return newMap
}
