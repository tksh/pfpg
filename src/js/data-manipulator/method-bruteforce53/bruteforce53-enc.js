////////////////////////////////// Input: //////////////////////////////////

// Basic Data
// Lines Data
// Lines Data Aggregated for Encoding


// for-loop 1: Max dict size from 0 to 52
// for-loop 2: Each lines-group (.g_id) from '1' to group size
// for-loop 3: Four columns from 'x1' to 'y2'
// for-loop 4: From 0 to actual dict size (each column has own size)
//       .map: Apply for array of 'diff_by_row' (each column has own size)


function bruteforce53Enc() {
    const startTime = performance.now()

    // To store the smallest encoded string of each group
    let currentSmallest = new Map()

    const maxDictSizeStartAt = 0
    const maxDictSizeEndAt = 52


    // Loop 1. Max dict size from 0 to 52

    for (let i = maxDictSizeStartAt; i <= maxDictSizeEndAt; i++) {
        const maxDictSize = i
        const baseXNumber = 52 - i
        console.log('////////////////////////////////// maxDictSize: ', maxDictSize, ' //////////////////////////////////') // 0, 1, ... 51, 52
        console.log('////////////////////////////////// baseXNumber: ', baseXNumber, ' //////////////////////////////////') // 52, 51, ... 1, 0

        const minimumDiffValue = -parseBasicData().max*4
        const maxDiffValue     =  parseBasicData().max*4

        const encodedDval = new Map()

        const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)


        // Loop 2. Each lines-group (.g_id) from '1' to group size

        for (const aggData of aggDataMap.values()) {
            //console.log('aggData.g_id: ', aggData.g_id)
            // 1
            //console.log('aggData.d.relative: ', aggData.d.relative)
            // Object { diff_by_row: {…}, frequent_diff_values_sorted: {…}, frequent_diff_counts_sorted: {…} }

            let dictAndDiffEncodedFourColumns = []


            // Loop 3. Four columns from 'x1' to 'y2'

            for (const column of ['x1', 'y1', 'x2', 'y2']) {
                console.log('//////// column: ', column, '////////')

                let diffArr          = aggData.d.relative.diff_by_row[column]
                let freqDiffValueArr = aggData.d.relative.frequent_diff_values_sorted[column]
                //console.log('diffArr: ', diffArr)   // (19) [1, 2, 0, -3, -2, 1, 9, -7, -3, 6, -2, -15, -3, 30, -12, -3, 1, -1, -7]
                //console.log('freqDiffValueArr: ', freqDiffValueArr) // (3) [-3, -2, -7]


                // Generate the frequency dictionary

                // length of dictionary:
                // If      `freqDiffValueArr`length is OVER maxDictSize,  then dict length is maxDictSize
                // Else if `freqDiffValueArr`length is UNDER maxDictSize, then dict length equals `freqDiffValueArr`length

                // Get the number of dict length
                actualDictSize = getActualDictSize(maxDictSize, freqDiffValueArr)


                // Key of freq dict

                // Extract top ${maxDictSize} numerical numbers
                // `.slice`の 第二引数の終了位置は切り出されないので
                // ${actualDictSize}個の数値を切り出したい時には [0]...[28]が${actualDictSize}個なので
                //  `.slice(0, ${actualDictSize})` となるようにする
                const freqDiffValueArrDict = freqDiffValueArr.slice(0, actualDictSize);
                //console.log('freqDiffValueArrDict: ', freqDiffValueArrDict)
                // [] | If dict size is zero, Empty array will be returned


                // Value of freq dict

                const alphabetsForDict = getAlphabetsForDict(actualDictSize)
                // From 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'


                // Set the KV pair into Map()

                const freqdictMap = new Map();

                // Loop 4. From 0 to actual dict size (each column has own size)

                for (let i = 0; i < alphabetsForDict.length; i++) {
                    // Mapオブジェクトに キー(頻出数値) と バリュー(置換用アルファベット) のペアを追加する
                    console.log('typeof(freqDiffValueArrDict[i], alphabetsForDict[i]), freqDiffValueArrDict[i], alphabetsForDict[i]: ', typeof(freqDiffValueArrDict[i]), typeof(alphabetsForDict[i]), freqDiffValueArrDict[i], alphabetsForDict[i])
                    // e.g.: number string -2 I
                    freqdictMap.set(freqDiffValueArrDict[i], alphabetsForDict[i]);
                }
                console.log('freqdictMap: ', freqdictMap)
                // e.g.: Map(0) {size: 0}, when maxDictSize = 0, baseXNumber = 52
                // e.g.: Map(29) {-2 => 'x', -1 => 'y', -4 => 'z', -7 => 'A', -3 => 'B', …}



                // Encode the frequency diff values array as a string to embed

                // 頻出数値の配列 を base52Encode して ひとつの文字列にまとめる
                // 結果が一文字の場合は `.padStart(2, 'a')` で 長さを 2文字 に揃える
                // 結果が三文字の場合は 先頭にアンダースコア `_` をひとつ付ける ( abc => _abc )

                const freqDiffValueToEmbed       = freqDiffValueArrDict.map((value) => base52EncodeForFreqDictValue(value))
                const freqDiffValueToEmbedJoined = freqDiffValueToEmbed.join('')


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
                    // [0-9] の一桁の正の数は そのままにする
                    if (diff >= 0 && diff <= 9) {
                        console.log('Value in [0-9]: ', diff)
                        return diff;
                    }

                    // 頻出数値Top${maxDictSize} dictArray[index] が存在するかどうかを確認し 存在する場合にのみ `has` でキーを探し
                    // ${maxDictSize}個のアルファベット のどれか一文字に置換
                    else if (freqdictMap.has(diff)) {
                        console.log('diff value in freq dict, diff and freqdictMap.get(diff): ', typeof(diff), diff, freqdictMap.get(diff))
                        return freqdictMap.get(diff);
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
                const mergeEncodedDictAndDiff = freqDiffValueToEmbedJoined + '-' + diffEncodedJoined

                // Push into four columns array
                dictAndDiffEncodedFourColumns.push(mergeEncodedDictAndDiff)
                // Like: [x1: dict and diff], [y1: dict and diff], [x2: dict and diff], [y2: dict and diff]`

            } // End of `for (const key in aggDataObj.relative) { // Loop for x1 to y2`

            //console.log('typeof(dictAndDiffEncodedFourColumns): ', typeof(dictAndDiffEncodedFourColumns)) // object
            //console.log('dictAndDiffEncodedFourColumns: ', dictAndDiffEncodedFourColumns)
            // (4) ['crcscn-120yZ19zy6ZlEylvlfy1lLz', 'cr-0LW1lP7lDlplJljlFzltlhlElsz00lc', 'cpcqct-00z5Z41Zz0031lky326y', 'crcscd-ltlLZzylhlllQzlp2LXlJlMyZ01y']
            // x1 に頻出数値が無い場合 hyphen始まりになる (4) ['-0lalO44lHlqlflh75lklJ5lLlg', 'crbR-0260Z0zlrlVz2ZlGlNlIlk', 'cr-lWLWz0lL100001z1z22', 'cqct-1ZlKlNlH130z011Z21z']

            // Join four columns
            dictAndDiffEncodedFourColumnsJoined = dictAndDiffEncodedFourColumns.join('-')
            console.log('dictAndDiffEncodedFourColumns: ', dictAndDiffEncodedFourColumns)

            // Set encoded [dict]-[diff] into map as value with group ID key
            encodedDval.set(aggData.g_id, dictAndDiffEncodedFourColumnsJoined)

        } // End of `for (let agg of aggDataMap.values()) {`
        console.log('encodedDval: ', encodedDval)
        // Map(5) {'1' => 'crcscn-120yZ19zy6ZlqyMKlSy1lxz-cr-0lL1Md7lpMElvlWlrzMIlUlqMHz00lP-cpcqct-00z5Z41Zz0031lXy326y-crcscd-MIlxZzylUMAMezME2lMlvMayZ01', '2' => '-0lNM ...
        // x1からy2まで 全てに頻出数値が無い場合: '5' => '-lmlF3lL10lK--lRLPlp4lk4lj--0lk1lL130--21lL1lk00'}



        //  Merge with Width Count and Group Colors, Then Compress

        // [Group Colors]=[Width Count]-[Encode Dict and Diff]

        // Get the width count (list_of_width and count_by_width) encoded as a string
        const encodedWidthCount = encodeWidthCount()

        // Read the lines data from .json as Map()
        const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')

        // Get the group colors(stroke, opacity, stroke-opacity) encoded as 10|6|5|3|1 chars hex
        const encodedColors = encodeGroupColors(linesDataMap)
        //console.log(encodedColors) // Map(5) {'1' => '0', '2' => '0', '3' => '0', '4' => 'e', '5' => 'f'}


        // Choose smaller one between URLComp applied or not, for each group
        const optimizedByGroup = tryOptimizeWithURLComp(
            encodedDval,
            encodedWidthCount,
            encodedColors,
            'bruteforce53-enc',
            baseXNumber
        )
        console.log('optimizedByGroup: ', optimizedByGroup)
        //  Map(5) {'1' => '0=129CaIjMCzLAFox3gEVYTdnymbAmwP-UWDCnew3h-Aqsd6rQsPf7nuc97B-Tyl896LIItSqsH-0_igZRCKY265Ta0zzD8-axd0B3NgagFJ2rRrUWcULFyn1IwBi', '2' => '0=129zi ...



        // Store the smallest string for each group

        // For first loop, init the map with current value
        if (maxDictSize === maxDictSizeStartAt) {
            console.log('maxDictSize in first loop: ', maxDictSize) // 0
            currentSmallest = optimizedByGroup
            console.log('currentSmallest in first loop: ', currentSmallest)
        }

        // For every loop
        currentSmallest = storeSmaller(currentSmallest, optimizedByGroup)

    }
    // End of Loop for every baseX values: [0-52]
    // 'for (let i = maxDictSizeStartAt; i <= maxDictSizeEndAt; i++) {'



    // Result map
    console.log('currentSmallest: ', currentSmallest)

    // Whole group strings joined with `&`
    const smallestJoined = joinWithAnd(currentSmallest)

    // Output to textarea
    outputToTextarea(smallestJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Lines Data', smallestJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('bruteforce53Enc()', elapsedTime, 'encoded-strokes-values-time')

    // Show the encoding result of each group in console
    showDetailsByGroup('Lines Data', currentSmallest)

    return currentSmallest
}
