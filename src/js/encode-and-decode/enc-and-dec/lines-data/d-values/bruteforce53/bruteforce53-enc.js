import { getActualCodebookSize }              from 'enc-and-dec/d-values/bruteforce53/actual-codebook-size'
import { createCodebookToEncodeFrequentDiff } from 'enc-and-dec/d-values/bruteforce53/create-codebook-to-enc'
import { handleSingleDigit }                  from 'enc-and-dec/d-values/bruteforce53/encode-diff'
import { handleFrequencyDiff }                from 'enc-and-dec/d-values/bruteforce53/encode-diff'
import { calculateLimitsForBaseXSkipRange }   from 'enc-and-dec/d-values/bruteforce53/encode-diff'
import { handleBase52EncodingWithPrefix }     from 'enc-and-dec/d-values/bruteforce53/encode-diff'
import { encodeFreqDiffAsRefDict }            from 'enc-and-dec/d-values/bruteforce53/encode-ref-dict'
import { getEncodedAttrsExceptsDvals }        from 'encode/get-attrs-excepts-dvals'
import { joinWithAmpersand }                  from 'encode/join-with-ampersand'
import { showStringSize
       , showDetailsByGroup }                 from 'encode/show-result'
import { storeShorter }                       from 'encode/store-shorter'
import { tryCompress }                        from 'encode/try-compress'



////////////////////////////////// Input: //////////////////////////////////

// Basic Data
// Lines Data
// Lines Data Aggregated for Encoding


// for-loop 1: Max dict size from 0 to 52
// for-loop 2: Each lines-group (.g_id) from '1' to group size
// for-loop 3: Four columns from 'x1' to 'y2'

export function bruteforce53Enc() {
    const startTime = performance.now()

    // To store the shortest encoded string of each group
    let currentShortest = new Map()

    const maxCodebookSizeStartAt = 0
    const maxCodebookSizeEndAt = 52

    // min|max diff value (Just for indicating to console at function calculateLimitsForBaseXSkipRange(baseXNumber))
    const minimumDiffValue = 0 - (2 ** parseBasicData().uintN - 1) * 4
    const maximumDiffValue =     (2 ** parseBasicData().uintN - 1) * 4

    // Loop 1. Max dict size from 0 to 52

    for (let i = maxCodebookSizeStartAt; i <= maxCodebookSizeEndAt; i++) {
        const maxCodebookSize = i
        const baseXNumber = 52 - i
        console.log('////////////////////////////////// maxCodebookSize: ', maxCodebookSize, ' //////////////////////////////////') // 0, 1, ... 51, 52
        console.log('////////////////////////////////// baseXNumber: ', baseXNumber, ' //////////////////////////////////') // 52, 51, ... 1, 0

        const encodedDvals = new Map()

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

            let refDictAndDiffEncodedFourColumns = []


            // Loop 3. Four columns from 'x1' to 'y2'

            for (const column of ['x1', 'y1', 'x2', 'y2']) {
                console.log('//////// column: ', column, '////////')

                let diffArr     = aggData.d.relative.diff_by_row[column]                    // Diff-by-row original
                let freqDiffArr = aggData.d.relative.frequent_diff_values_sorted[column]    // Diff-by-row sorted by frequency and remove the values that only once appeared
                //console.log('diffArr: ', diffArr)         // (19) [1, 2, 0, -3, -2, 1, 9, -7, -3, 6, -2, -15, -3, 30, -12, -3, 1, -1, -7]
                //console.log('freqDiffArr: ', freqDiffArr) // (3) [-3, -2, -7]


                // Generate the codebook to encode frequent diff_by_row values

                // Source symbol of codebook => Value of diff_by_row
                // Codeword      of codebook => Alphabets

                // Define the size of codebook:
                // If      freqDiffArr.length is OVER maxCodebookSize,  => actualCodebookSize.length is maxCodebookSize
                // Else if freqDiffArr.length is UNDER maxCodebookSize, => actualCodebookSize.length equals freqDiffArr.length

                // Get the number of actual codebook length in this column
                const actualCodebookSize = getActualCodebookSize(maxCodebookSize, freqDiffArr)

                // Extract top ${maxCodebookSize} elements of numerical numbers

                // ${actualCodebookSize}個の数値を切り出したい時には [0]...[${actualCodebookSize} - 1]が ${actualCodebookSize}個なので
                // `.slice(0, ${actualCodebookSize})` とする (`.slice`の 第二引数の終了位置は切り出されない)
                const freqDiffArrActualCodebookSized = freqDiffArr.slice(0, actualCodebookSize);
                // If actualCodebookSize is 0, Empty array `[]` will be returned

                // Create the codebook to encode
                const codebookToEncodeFreqDiff = createCodebookToEncodeFrequentDiff(freqDiffArrActualCodebookSized, actualCodebookSize)
                console.log('codebookToEncodeFreqDiff: ', codebookToEncodeFreqDiff)
                // e.g.: Map(29) {-2 => 'x', -1 => 'y', -4 => 'z', -7 => 'A', -3 => 'B', …}


                // Create the reference dictionary
                //   Encode the array of frequency diff values as a string to attach
                const freqDiffAsRefDict = encodeFreqDiffAsRefDict(freqDiffArrActualCodebookSized)

                // Encode the diff values
                const diffArrEncoded = diffArr.map((diff) => {

                    // [0-9] の一桁の正の数は そのままにする
                    let result = handleSingleDigit(diff);
                    if (result !== undefined) return result;

                    // 頻出数値が codebookに キーとして存在するかどうか を確認し 存在する場合にのみ 対応する アルファベット1文字 に 置換する
                    result = handleFrequencyDiff(diff, codebookToEncodeFreqDiff);
                    if (result !== undefined) return result;

                    // 数値が [大き|小さ]過ぎて BaseX で 2桁 にエンコードできないものは base52エンコードしてから アンダースコア を先頭にフラグとして 条件に応じて [1|2|3|4]個 付ける
                    //   上の Codebook と 下の BaseX は それぞれ重複しないアルファベットを 切り出して使っているが
                    //   Base52 は 両方ともと同じ種類の文字を使っているので デコード時にそれらと区別できるようにするため フラグを付ける
                    result = handleBase52EncodingWithPrefix(diff, baseXNumber, baseXRangeLimits);
                    if (result !== undefined) return result;

                    // 上記 3条件 いずれでもなければ baseX で アルファベット2文字 に エンコードする
                    return handleBaseXEncoding(diff, baseXNumber);
                });
                //console.log('diffArrEncoded: ', diffArrEncoded);
                // e.g.: (484) [7, 'ln', 'B', 'B', 'D', 'N', 'X', 6, 'nl', 'U', 8, ...


                // Join the encoded diff values as a string
                const diffEncodedJoined = diffArrEncoded.join('')
                // Combine the dictionary and diff to form: '[encoded reference_dictionary]-[encoded diff_by_row]'
                const mergeEncodedRefDictAndDiff = freqDiffAsRefDict + '-' + diffEncodedJoined

                // Push to merge four columns into one array: [x1, y1, x2, y2]
                refDictAndDiffEncodedFourColumns.push(mergeEncodedRefDictAndDiff)
            }

            //console.log('refDictAndDiffEncodedFourColumns: ', refDictAndDiffEncodedFourColumns)
            // 頻出数値が無い場合 hyphen始まりになる (4) ['-0lalO44lHlqlflh75lklJ5lLlg', 'crbR-0260Z0zlrlVz2ZlGlNlIlk', 'cr-lWLWz0lL100001z1z22', 'cqct-1ZlKlNlH130z011Z21z']

            // Join four columns to form: '[x1]-[y1]-[x2]-[y2]'
            refDictAndDiffEncodedFourColumnsJoined = refDictAndDiffEncodedFourColumns.join('-')

            // Set the encoded d values ([refDict]-[encodedDiff]) into map as value with group ID key
            encodedDvals.set(aggData.g_id, refDictAndDiffEncodedFourColumnsJoined)

        }
        console.log('encodedDvals: ', encodedDvals)
        // e.g.: Map(5) {'1' => 'crcscn-120yZ19zy6ZlqyMKlSy1lxz-cr-0lL1Md7lpMElvlWlrzMIlUlqMHz00lP-cpcqct-00z5Z41Zz0031lXy326y-crcscd-MIlxZzylUMAMezME2lMlvMayZ01', '2' => '-0lNM ...
        // e.g.: x1からy2まで 全てに頻出数値が無い場合: '5' => '-lmlF3lL10lK--lRLPlp4lk4lj--0lk1lL130--21lL1lk00'}



        // Try compress and add prefix

        // 1. Prepend the encoded stroke-width value and counts to the beginning of encoded d values
        // 2. Compress the combined string using URLCompressor and choose the shorter version.
        // 3. Prepend the encoded group-colors value to the chosen string (compressed or original).

        // Format: [group-colors]=[width-and-counts]-[d-values]


        // Get the encoded strings of width-and-counts and group-colors
        const encodedAttrsExceptsDvals = getEncodedAttrsExceptsDvals()

        // Choose shorter one between URLComp applied or not, by each group
        const compressedByGroup = tryCompress(
            encodedDvals,
            encodedAttrsExceptsDvals,
            'bruteforce53-enc',
            baseXNumber
        )
        console.log(`baseXNumber = ${baseXNumber}, compressedByGroup: `, compressedByGroup)
        //  Map(5) {'1' => '0=129CaIjMCzLAFox3gEVYTdnymbAmwP-UWDCnew3h-Aqsd6rQsPf7nuc97B-Tyl896LIItSqsH-0_igZRCKY265Ta0zzD8-axd0B3NgagFJ2rRrUWcULFyn1IwBi', '2' => '0=129zi ...



        // Store the shortest string by each group

        // For first loop, init the map with current value
        if (maxCodebookSize === maxCodebookSizeStartAt) {
            console.log('maxCodebookSize in first loop: ', maxCodebookSize) // 0
            currentShortest = compressedByGroup
            console.log('currentShortest in first loop: ', currentShortest)
        }

        // For after second loop
        // baseXNumber will be used for just indicating to console when updated the current shortest.
        currentShortest = storeShorter(currentShortest, compressedByGroup, baseXNumber)

    }
    // End of Loop for every baseX values: [0-52]
    // 'for (let i = maxCodebookSizeStartAt; i <= maxCodebookSizeEndAt; i++) {'



    // Result map
    console.log('currentShortest: ', currentShortest)

    // Whole group strings joined with '&' (ampersand sign)
    const shortestJoined = joinWithAmpersand(currentShortest)

    // Output to textarea
    outputToTextarea(shortestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Lines Data', shortestJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('bruteforce53Enc()', elapsedTime, 'encoded-strokes-values-time')

    // Show the encoding result of each group in console
    showDetailsByGroup('Lines Data', currentShortest)

    return currentShortest
}
