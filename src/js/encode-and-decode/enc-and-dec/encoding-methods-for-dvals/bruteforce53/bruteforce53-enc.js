////////////////////////////////// Input: //////////////////////////////////

// Basic Data
// Lines Data
// Lines Data Aggregated for Encoding


// for-loop 1: Max dict size from 0 to 52
// for-loop 2: Each lines-group (.g_id) from '1' to group size
// for-loop 3: Four columns from 'x1' to 'y2'

function bruteforce53Enc() {
    const startTime = performance.now()

    // To store the shortest encoded string of each group
    let currentShortest = new Map()

    const maxCodebookSizeStartAt = 0
    const maxCodebookSizeEndAt = 52


    // Loop 1. Max dict size from 0 to 52

    for (let i = maxCodebookSizeStartAt; i <= maxCodebookSizeEndAt; i++) {
        const maxCodebookSize = i
        const baseXNumber = 52 - i
        console.log('////////////////////////////////// maxCodebookSize: ', maxCodebookSize, ' //////////////////////////////////') // 0, 1, ... 51, 52
        console.log('////////////////////////////////// baseXNumber: ', baseXNumber, ' //////////////////////////////////') // 52, 51, ... 1, 0

        const minimumDiffValue = -parseBasicData().max*4
        const maxDiffValue     =  parseBasicData().max*4

        const encodedDvals = new Map()

        const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)


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

                let diffArr     = aggData.d.relative.diff_by_row[column]
                let freqDiffArr = aggData.d.relative.frequent_diff_values_sorted[column]
                //console.log('diffArr: ', diffArr)   // (19) [1, 2, 0, -3, -2, 1, 9, -7, -3, 6, -2, -15, -3, 30, -12, -3, 1, -1, -7]
                //console.log('freqDiffArr: ', freqDiffArr) // (3) [-3, -2, -7]


                // Generate the codebook to encode frequent diff_by_row values

                // Source symbol of codebook => Value of diff_by_row
                // Codeword      of codebook => Alphabets

                // Define the size of codebook:
                // If      freqDiffArr.length is OVER maxCodebookSize,  => actualCodebookSize.length is maxCodebookSize
                // Else if freqDiffArr.length is UNDER maxCodebookSize, => actualCodebookSize.length equals freqDiffArr.length

                // Get the number of actual codebook length in this column
                const actualCodebookSize = getActualCodebookSize(maxCodebookSize, freqDiffArr)
                console.log('actualCodebookSize: ', actualCodebookSize)

                // Extract top ${maxCodebookSize} elements of numerical numbers

                // ${actualCodebookSize}個の数値を切り出したい時には [0]...[${actualCodebookSize} - 1]が ${actualCodebookSize}個なので
                // `.slice(0, ${actualCodebookSize})` とする (`.slice`の 第二引数の終了位置は切り出されない)
                const freqDiffArrActualCodebookSized = freqDiffArr.slice(0, actualCodebookSize);
                // If actualCodebookSize is 0, Empty array `[]` will be returned

                // Create the codebook to encode
                const codebookToEncodeFreqDiff = createCodebookToEncodeFrequentDiff(freqDiffArrActualCodebookSized, actualCodebookSize)
                console.log('codebookToEncodeFreqDiff: ', codebookToEncodeFreqDiff)
                // e.g.: Map(0) {size: 0}, when maxCodebookSize = 0, baseXNumber = 52
                // e.g.: Map(29) {-2 => 'x', -1 => 'y', -4 => 'z', -7 => 'A', -3 => 'B', …}


                // Encode the frequency diff values array as a string to attach
                const freqDiffAsRefDict = encodeFreqDiffAsReferenceDict(freqDiffArr, maxCodebookSize)


                // Encode the diff

                // Get the range to apply the BaseX encoding
                const startOfBaseXEncTargetBefore0 = 0 - getHalfOfBaseXRange(baseXNumber)
                const endOfBaseXEncTargetAfter9 = getHalfOfBaseXRange(baseXNumber) + 9
                console.log('the range to apply the baseXEnc: ', startOfBaseXEncTargetBefore0, ' < 0 | 9 < ', endOfBaseXEncTargetAfter9)
                // -40  < 0 | 9 <  49

                // Get the range to skip the BaseX encoding
                const endOfIneligibleForBaseXEncLower = startOfBaseXEncTargetBefore0 - 1
                const startOfIneligibleForBaseXEncHigher = endOfBaseXEncTargetAfter9 + 1
                console.log('the range to skip the baseXEnc: ', minimumDiffValue, ' < ', endOfIneligibleForBaseXEncLower, ' | ', startOfIneligibleForBaseXEncHigher, ' < ', maxDiffValue )
                // -124  <  -41  |  50  <  124


                const diffArrEncoded = diffArr.map((diff) => {
                    ////console.log('diff; ', diff)
                    // [0-9] の一桁の正の数は そのままにする
                    if (diff >= 0 && diff <= 9) {
                        console.log('Value in [0-9]: ', diff)
                        return diff;
                    }

                    // 頻出数値Top${maxCodebookSize} dictArray[index] が存在するかどうかを確認し 存在する場合にのみ `has` でキーを探し
                    // ${maxCodebookSize}個のアルファベット のどれか一文字に置換
                    else if (codebookToEncodeFreqDiff.has(diff)) {
                        console.log('diff value in freq dict, diff and codebookToEncodeFreqDiff.get(diff): ', typeof(diff), diff, codebookToEncodeFreqDiff.get(diff))
                        return codebookToEncodeFreqDiff.get(diff);
                    }

                    // [0-9]でもなく 頻出辞書のキーにも なければ baseX でEncode
                    // baseX で2桁にエンコードできないものは base52 encodeしてから アンダースコア を先頭に 付ける
                    // 先ず baseX範囲外のものを 処理して 最後に残った baseX対象のものを else で処理する
                    else {
                        // baseX の対象の中でも 大小両極の数字は baseX で 2文字で エンコード出来ないので baseXエンコードは しない
                        // Base52 でアルファベットにエンコードし 上で一文字変換をしたアルファベットと区別するために `_`を 先頭に いくつか 付ける
                        //   エンコード後の文字数が 2文字 になった場合
                        //     正の数値は 前に アンダースコアを 1個 付ける
                        //     負の数値は 前に アンダースコアを 2個 付ける
                        //   エンコード後の文字数が 3文字 になった場合
                        //     正の数値は 前に アンダースコアを 3個 付ける
                        //     負の数値は 前に アンダースコアを 4個 付ける

                        //   52*52=2704 なので 数値が 2703(ZZ) までは 2文字に変換できる
                        //   52*52*52=140608 なので 数値が 140607(ZZZ) までは 3文字に変換できる
                        //   UInt8Portray (grid size: 0-255)   までは diff の負の数を消した時に取り得る最大値 (2044)   を 2文字でカバーできる
                        //   UInt14Portray(grid size: 0-16383) までは diff の負の数を消した時に取り得る最大値 (131064) を 3文字でカバーできる

                        if (diff <= endOfIneligibleForBaseXEncLower) {
                            // 負の数なので baseXエンコードできない場合

                            diffEncoded = String(base52Encode(Math.abs(diff))) // Math.absで絶対値に変換して マイナス記号を消す
                            if (diffEncoded.length <= 2) { // Add `__` as prefix for encoded as 2 digits from minus number
                                diffEncodedWithUnderscorePrefix = '__' + diffEncoded.padStart(2, 'a') // total: 4 (2+2) chars
                            } else if (diffEncoded.length = 3) { // Add `____` as prefix for encoded as 3 chars from minus number
                                diffEncodedWithUnderscorePrefix = '____' + diffEncoded // total: 7 (4+3) chars
                            }

                            console.log(`${diff} は 小さ過ぎて Base${baseXNumber}Encの 対象範囲外なので base52Encしてから 2|4 個の'_'を prefixとして加える: `, diff, diffEncodedWithUnderscorePrefix);
                            return diffEncodedWithUnderscorePrefix

                        } else if (startOfIneligibleForBaseXEncHigher <= diff) {
                            // 大きい正の数で baseXエンコードでは 三桁以上になってしまう場合

                            diffEncoded = String(base52Encode(diff))
                            if (diffEncoded.length <= 2) { // Add `_` as prefix for encoded as 2 chars from plus number
                                diffEncodedWithUnderscorePrefix = '_' + diffEncoded.padStart(2, 'a') // total: 3 (1+2) chars
                            } else if (diffEncoded.length = 3) { // Add `___` as prefix for encoded as 3 chars from plus number
                                diffEncodedWithUnderscorePrefix = '___' + diffEncoded // total: 6 (3+3) chars
                            }
                            console.log(`${diff} は 大き過ぎて Base${baseXNumber}Encの 対象範囲外なので base52Encしてから 1|3 個の'_'を prefixとして加える: `, diff, diffEncodedWithUnderscorePrefix);
                            return diffEncodedWithUnderscorePrefix

                        } else {
                            // diffが baseXエンコード可能な範囲にある場合
                            // BaseX でアルファベット2文字にエンコード
                            const baseXEncoded = baseXEnc(diff, baseXNumber);
                            console.log(`diffが baseXエンコード可能な範囲にあるので Base${baseXNumber} でアルファベット2文字にエンコード:`, diff, baseXEncoded)
                            return  baseXEncoded
                        }
                    }
                });
                console.log('diffArrEncoded: ', diffArrEncoded) // (484) [7, 'ln', 'B', 'B', 'D', 'N', 'X', 6, 'nl', 'U', 8, ...


                // Join the encoded four columns values as a string
                const diffEncodedJoined = diffArrEncoded.join('')
                // Merge with hyphen'-': `[encoded dict]-[encoded diff]`
                const mergeEncodedRefDictAndDiff = freqDiffAsRefDict + '-' + diffEncodedJoined

                // Merge four columns into one array
                refDictAndDiffEncodedFourColumns.push(mergeEncodedRefDictAndDiff)
                // Like: [x1: dict and diff], [y1: dict and diff], [x2: dict and diff], [y2: dict and diff]`
            }

            //console.log('typeof(refDictAndDiffEncodedFourColumns): ', typeof(refDictAndDiffEncodedFourColumns)) // object
            //console.log('refDictAndDiffEncodedFourColumns: ', refDictAndDiffEncodedFourColumns)
            // (4) ['crcscn-120yZ19zy6ZlEylvlfy1lLz', 'cr-0LW1lP7lDlplJljlFzltlhlElsz00lc', 'cpcqct-00z5Z41Zz0031lky326y', 'crcscd-ltlLZzylhlllQzlp2LXlJlMyZ01y']
            // x1 に頻出数値が無い場合 hyphen始まりになる (4) ['-0lalO44lHlqlflh75lklJ5lLlg', 'crbR-0260Z0zlrlVz2ZlGlNlIlk', 'cr-lWLWz0lL100001z1z22', 'cqct-1ZlKlNlH130z011Z21z']

            // Join four columns (x1, y1, x2, y2)
            refDictAndDiffEncodedFourColumnsJoined = refDictAndDiffEncodedFourColumns.join('-')

            // Set the encoded d values ([refDict]-[encodedDiff]) into map as value with group ID key
            encodedDvals.set(aggData.g_id, refDictAndDiffEncodedFourColumnsJoined)

        } // End of `for (let agg of aggDataMap.values()) {`
        console.log('encodedDvals: ', encodedDvals)
        // Map(5) {'1' => 'crcscn-120yZ19zy6ZlqyMKlSy1lxz-cr-0lL1Md7lpMElvlWlrzMIlUlqMHz00lP-cpcqct-00z5Z41Zz0031lXy326y-crcscd-MIlxZzylUMAMezME2lMlvMayZ01', '2' => '-0lNM ...
        // x1からy2まで 全てに頻出数値が無い場合: '5' => '-lmlF3lL10lK--lRLPlp4lk4lj--0lk1lL130--21lL1lk00'}



        // Try compress and add prefix

        // 1. Prepend the encoded stroke-width value and counts to the beginning of encoded d values
        // 2. Compress the combined string using URLCompressor and choose the shorter version.
        // 3. Prepend the encoded group-colors value to the chosen string (compressed or original).

        // Format: [group-colors]=[width-and-counts]-[d-values]


        // Get the encoded strings of width-and-counts and group-colors
        const encodedAttrsExceptsDvals = getEncodedAttrsExceptsDvals()

        // Choose shorter one between URLComp applied or not, for each group
        const compressedByGroup = tryCompress(
            encodedDvals,
            encodedAttrsExceptsDvals,
            'bruteforce53-enc',
            baseXNumber
        )
        console.log('compressedByGroup: ', compressedByGroup)
        //  Map(5) {'1' => '0=129CaIjMCzLAFox3gEVYTdnymbAmwP-UWDCnew3h-Aqsd6rQsPf7nuc97B-Tyl896LIItSqsH-0_igZRCKY265Ta0zzD8-axd0B3NgagFJ2rRrUWcULFyn1IwBi', '2' => '0=129zi ...



        // Store the shortest string for each group

        // For first loop, init the map with current value
        if (maxCodebookSize === maxCodebookSizeStartAt) {
            console.log('maxCodebookSize in first loop: ', maxCodebookSize) // 0
            currentShortest = compressedByGroup
            console.log('currentShortest in first loop: ', currentShortest)
        }

        // For every loop
        currentShortest = storeShorter(currentShortest, compressedByGroup)

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
