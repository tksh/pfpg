/////////////// Encode d values diff of rows from jsonl values, //////////////

////////////////////////////////// Input: //////////////////////////////////

// Diff and Freq dict

// From: './jsonl_extracted/%{ARTWORK_ID}_diff_of_dval_rows_and_freq_dict_except_0to9.jsonl'

//  {"000_rel_x1_diff":[7,10,-3,-3,-12,-13,-17,6,54,-47, ...
//  {"000_rel_x1_value":[-2,-1,-4,-7,-3,-5,-12,-6,-11,19 ...
//  {"000_rel_x1_count":[23,17,15,13,13,11,9,8,7,7,6,6,6 ...
// ......
//  {"fff_abs_y2_diff":[110,17,3,55,-99,-17,-4,-1,16,-1, ...
//  {"fff_abs_y2_value":[-4,-1,17,-99,-6,-9,110,55,-17,1 ...
//  {"fff_abs_y2_count":[5,4,2,2,2,2,1,1,1,1,1,1,1,1,1,1 ...


// Strokes Info

// From: './jsonl_extracted/%{ARTWORK_ID}_strokes_width_and_amount.jsonl'

// {"000_amount":[24,21,37,66,91,118,127]}
// {"000_width":[21,13,8,5,3,2,1]}
// {"fff_amount":[8,43]}
// {"fff_width":[2,1]}

////////////////////////////////// Output: //////////////////////////////////

// To: <textarea> id="textarea-strokes-attrs-encoded"
// Format: [1st:color]=[1st char: binary flag for URLComp or not][2nd char: baseX number base52 encoded][widthCount(width number, amount base52 encoded, ...)]-[x1:dict]-[x1:diff]-[y1:dict]-[y1:diff]-[x2:dict]-[x2:diff]-[y2:dict]-[y2:diff]&[2nd:color]=...
// e.g. enc=0w&000=9_eLsiCq2FVu ... qJqwU2&fff=9wiYAu ... iMHPwo-


//base0To52Enc
function base0to52Enc() {
    const startTime = performance.now()

    const lengthByBaseXNumber = new Map()

    // For reference: Store the whole results of encoded string using URLCompressor or not
    const lengthBeforeAndAfterURLComp = new Map();

    // Loop for every baseX values: [0-52]
    for (let i = 3; i <= 5; i++) { // Test [3-5]
        //    for (let i = 0; i <= 52; i++) {
        const maxDictSize = i
        const baseXNumber = 52 - i
        console.log('maxDictSize: ', maxDictSize) // 0, 1, ... 51, 52
        console.log('baseXNumber: ', baseXNumber) // 52, 51, ... 1, 0


        const mergedDictAndDiffEncodedMapByGroup = new Map();

        const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)
        for (let [groupId, aggDataObj] of aggDataMap) {
            //console.log('groupId: ', groupId) // 1
            //console.log('aggDataObj: ', aggDataObj) // {list_of_width: Array(1), count_by_width: Array(1), absolute: {…}, relative: {…}}
            //console.log('aggDataObj.relative: ', aggDataObj.relative)
            //{x1: {…}, y1: {…}, x2: {…}, y2: {…}}
            //    x1: {diff: Array(19), diff_values_sorted_by_freq: Array(3), diff_counts_sorted_by_freq: Array(3)}
            //    x2: {diff: Array(19), diff_values_sorted_by_freq: Array(3), diff_counts_sorted_by_freq: Array(3)}
            //    y1: {diff: Array(19), diff_values_sorted_by_freq: Array(1), diff_counts_sorted_by_freq: Array(1)}
            //    y2: {diff: Array(19), diff_values_sorted_by_freq: Array(3), diff_counts_sorted_by_freq: Array(3)}
            //    [[Prototype]]: Object

            let dictAndDiffEncodedWholeColumns = ''

            // Count the total length of freq dict values encoded
            let totalLengthOfFreqDictValuesEncoded = 0

            for (const key in aggDataObj.relative) { // Loop for x1 to y2
                //console.log('key: ', key) // x1

                // Get the strings as key, and arrays as value
                //                let keyDiff = ''
                //                let keyValue = ''
                ///                let valueDiff = []
                //                let valueValue = []

                let valueDiff = aggDataObj.relative[key].diff
                let valueValue = aggDataObj.relative[key].diff_values_sorted_by_freq
                //console.log('valueDiff: ', valueDiff)   // (19) [1, 2, 0, -3, -2, 1, 9, -7, -3, 6, -2, -15, -3, 30, -12, -3, 1, -1, -7]
                //console.log('valueValue: ', valueValue) // (3) [-3, -2, -7]

                console.log('valueDiff.length:  ', valueDiff.length)  // 484
                console.log('valueValue.length: ', valueValue.length) // 133

                valueValueFiltered = valueValue.filter((num) => num !== undefined);
                console.log('valueValueFiltered.length: ', valueValueFiltered.length) // 133
                console.log('valueValueFiltered: ', valueValueFiltered) //


                // Generate the frequency dictionary

                // {1st freq num => 'x', 2nd freq num => 'y', ...}
                // The number of keys for the compression dictionary is at most 29, sometimes less

                // If      `valueValue`length is OVER maxDictSize,  then dict length is maxDictSize
                // Else if `valueValue`length is UNDER maxDictSize, then dict length equals `valueValue`length

                // Get the number of dict length
                function getActualDictSize(maxDictSize, valueValue) {
                    let actualDictSize
                    if (valueValue.length >= maxDictSize) {
                        actualDictSize = maxDictSize
                    } else {
                        actualDictSize = valueValue.length
                    }
                    return actualDictSize
                }
                actualDictSize = getActualDictSize(maxDictSize, valueValue)
                console.log('actualDictSize: ', actualDictSize)


                // Key of freq dict

                // Extract top ${maxDictSize} numerical numbers
                // `.slice`の 第二引数の終了位置は切り出されないので
                // ${actualDictSize}個の数値を切り出したい時には [0]...[28]が${actualDictSize}個なので `.slice(0, ${actualDictSize})` となるようにする
                const valueValueDict = valueValue.slice(0, actualDictSize);
                console.log('valueValueDict: ', valueValueDict)
                // [] => Dict size is zero


                // Value of freq dict

                const alphabetForDict = getAlphabetForDict(actualDictSize)
                console.log('alphabetForDict: ', alphabetForDict)
                // AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz


                // Set the kv pair into Map()

                const freqdictMap = new Map();

                // Check length of both array
                //console.log('valueValueDict.length, alphabetForDict.length: ', valueValueDict.length, alphabetForDict.length)

                for (let i = 0; i < alphabetForDict.length; i++) {
                    // Mapオブジェクトに キー(頻出数値) と バリュー(一文字置換用アルファベット) のペアを追加する
                    //console.log('typeof(valueValueDict[i], alphabetForDict[i]), valueValueDict[i], alphabetForDict[i]: ', typeof(valueValueDict[i]), typeof(alphabetForDict[i]), valueValueDict[i], alphabetForDict[i])
                    // number string -2 I
                    freqdictMap.set(valueValueDict[i], alphabetForDict[i]);
                }
                console.log('freqdictMap: ', freqdictMap)
                // Map(0) {size: 0}, when maxDictSize = 0, baseXNumber = 52
                // Map(29) {-2 => 'x', -1 => 'y', -4 => 'z', -7 => 'A', -3 => 'B', …}


                // Generate a encoded string of frequency nums for embedding after diff values decoded

                // 頻出数値 を base52Encode して ひとつの文字列にまとめる
                // 結果が一文字の場合は `.padStart(2, 'a')` で 長さを 2文字 に揃える          / 2703 = ZZ
                // 結果が三文字の場合は 先頭にアンダースコア `_` をひとつ付ける ( abc => _abc ) / 2704 = baa
                console.log(base52EncodeForFreqDictValue(2704)) // _bcu
                console.log(base52EncodeForFreqDictValue(2703)) // _bct
                console.log(base52EncodeForFreqDictValue(2500)) // Yy
                console.log(base52EncodeForFreqDictValue(25))   // cT
                console.log(base52EncodeForFreqDictValue(0))    // cu
                console.log(base52EncodeForFreqDictValue(1))    // cv

                const encodedValueValue = valueValueDict.map((value) => base52EncodeForFreqDictValue(value))
                const encodedValueValueJoined = encodedValueValue.join('')
                //                console.log(`${keyValue}, base52 encoded freq dict values length and string: `, encodedValueValueJoined.length, encodedValueValueJoined)
                console.log(`base52 encoded freq dict values length and string: `, encodedValueValueJoined.length, encodedValueValueJoined)
                // When baseXnumber: 52, maxDictSize: 0
                // 000_rel_x1_value, base52 encoded freq dict values length and string:  0 <empty string>
                totalLengthOfFreqDictValuesEncoded += encodedValueValueJoined.length



                // Encode the diff

                // Get the range to apply the BaseX encoding
                const startOfBaseXEncTargetBefore0 = 0 - getHalfOfBaseXRange(baseXNumber) // -128
                const endOfBaseXEncTargetAfter9 = getHalfOfBaseXRange(baseXNumber) + 9 //  137

                // Get the range to skip the BaseX encoding
                const endOfIneligibleForBaseXEncLower = startOfBaseXEncTargetBefore0 - 1 // -129
                const startOfIneligibleForBaseXEncHigher = endOfBaseXEncTargetAfter9 + 1 //  138
                //console.log('endOfIneligibleForBaseXEncLower: ', endOfIneligibleForBaseXEncLower)       // -1353
                //console.log('startOfIneligibleForBaseXEncHigher: ', startOfIneligibleForBaseXEncHigher) // 1362

                const valueDiffEncoded = valueDiff.map((diff) => {
                    // [０－９] の一桁の正の数は そのままにする
                    if (diff >= 0 && diff <= 9) {
                        //console.log('If ([0-9]), typeof(diff) and diff: ', typeof(diff), diff)
                        return diff;
                    }
                    // 頻出数値Top${maxDictSize} dictArray[index] が存在するかどうかを確認し 存在する場合にのみ `has` でキーを探し
                    // ${maxDictSize}個のアルファベット のどれか一文字に置換
                    else if (freqdictMap.has(diff)) {
                        //console.log('Else If (diff in dict), typeof(diff), diff and freqdictMap.get(diff): ', typeof(diff), diff, freqdictMap.get(diff))
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

                            console.log("diffは 小さ過ぎて baseXエンコードの 対象範囲外: ", diff);

                            diffEncoded = String(base52Encode(Math.abs(diff))) // Math.absで絶対値に変換して マイナス記号を消す
                            if (diffEncoded.length <= 2) { // Add `__` as prefix for encoded as 2 digits from minus number
                                diffEncodedWithUnderscorePrefix = '__' + diffEncoded.padStart(2, 'a') // total: 4 (2+2) chars
                            } else if (diffEncoded.length = 3) { // Add `____` as prefix for encoded as 3 chars from minus number
                                diffEncodedWithUnderscorePrefix = '____' + diffEncoded // total: 7 (4+3) chars
                            }
                            return diffEncodedWithUnderscorePrefix

                        } else if (startOfIneligibleForBaseXEncHigher <= diff) {
                            // 大きい正の数で baseXエンコードでは 三桁以上になってしまう場合

                            console.log("diffは 大き過ぎて baseXエンコードの 対象範囲外: ", diff);

                            diffEncoded = String(base52Encode(diff))
                            if (diffEncoded.length <= 2) { // Add `_` as prefix for encoded as 2 chars from plus number
                                diffEncodedWithUnderscorePrefix = '_' + diffEncoded.padStart(2, 'a') // total: 3 (1+2) chars
                            } else if (diffEncoded.length = 3) { // Add `___` as prefix for encoded as 3 chars from plus number
                                diffEncodedWithUnderscorePrefix = '___' + diffEncoded // total: 6 (3+3) chars
                            }
                            return diffEncodedWithUnderscorePrefix

                        } else {
                            // diffが baseXエンコード可能な範囲にある場合
                            // BaseX でアルファベット2文字にエンコード
                            return baseXEnc(diff, baseXNumber);
                        }
                    }
                });
                //console.log('valueDiffEncoded: ', valueDiffEncoded) // (484) [7, 'ln', 'B', 'B', 'D', 'N', 'X', 6, 'nl', 'U', 8, ...


                // Join the encoded four columns values as a string
                const diffEncodedJoined = valueDiffEncoded.join('')
                // Merge as `[encoded dict]-[encoded diff]`
                const mergeEncodedDictAndDiff = encodedValueValueJoined + '-' + diffEncodedJoined

                // Push the whole columns with`-`
                dictAndDiffEncodedWholeColumns += (mergeEncodedDictAndDiff + '-')
                // Like `[x1: dict and diff]-[y1: dict and diff]-[x2: dict and diff]-[y2: dict and diff]-`
                //console.log('dictAndDiffEncodedWholeColumns, divided with `-`: ', dictAndDiffEncodedWholeColumns)
            } // End of `for (let [keyByX1y1x2y2, valueByX1y1x2y2] of strokesValuesMapByX1y1x2y2) {`

            console.log(`${groupId}, totalLengthOfFreqDictValuesEncoded: `, totalLengthOfFreqDictValuesEncoded)

            // sliceメソッドを使って 各カラムを `-`区切りで統合した際に生じた 最後の余計な1文字 '-' を削る
            dictAndDiffEncodedWholeColumns = dictAndDiffEncodedWholeColumns.slice(0, -2);
            //console.log('dictAndDiffEncodedWholeColumns,  Unnecessaly `-` at end deleted: ', dictAndDiffEncodedWholeColumns)

            // 色ごとの キー で分かれた Mapオブジェクトに 値として x1,y1,x2,y2 を 統合した座標データ文字列を 挿入
            mergedDictAndDiffEncodedMapByGroup.set(groupId, dictAndDiffEncodedWholeColumns)

        } // End of `for (let [groupId, aggDataObj] of aggDataMap) {`
        console.log('mergedDictAndDiffEncodedMapByGroup: ', mergedDictAndDiffEncodedMapByGroup)
        // Map { 000 → "eUeVeSePeTeR ... Map { 000 → "eUeVeSePeTeReKeQeLfpeNeOfheBeEeIeJeMfjflfmftfzebeweyeFeHfxfEeuezeCeGfgfi-7ZKKLQV6_abDt8_aaG23PjNgD_abD_aaCKfHj_aBA_aeAdgj_aAH_aC ...



        //  From agg-data-for-comp

        // Get the width count (list_of_width and count_by_width) encoded as a string
        const encodedWidthCountByGroup = encodeWidthCount()


        // Store smaller length strings
        let lengthAndStringArray = [];
        let strokesValuesByGroupMap = new Map();


        // For reference: Comparing the length of Using URLCompressor or not
        let lengthBeforeURLComp = [];
        let lengthAfterURLComp = [];


        for (const [groupId, valueDictAndDiffEncoded] of mergedDictAndDiffEncodedMapByGroup) {
            //console.log('groupId: ', groupId) // 000, fff
            //console.log('valueDictAndDiffEncoded: ', valueDictAndDiffEncoded) // lblckwkt ..., ktlcko ...
            //console.log('widthCountEncodedMapByGroup.get(groupId): ', widthCountEncodedMapByGroup.get(groupId)) // 21b13z8U5bF3cT2eG1gU, 2b1j

            // Get encoded strokes info that have same color as a key
            const widthCountEncoded = encodedWidthCountByGroup.get(groupId)

            // Join the [strokes info] and [dict]_[diff] with `-` (hyphen)
            const widthCountAndDictAndDiff = widthCountEncoded + '-' + valueDictAndDiffEncoded
            // [widthCount]-[x1:dict]-[x1:diff]-[y1:dict]-[y1:diff]-[x2:dict]-[x2:diff]-[y2:dict]_[y2:diff]
            //console.log(`${groupId} \t | Before URLCompressor: `, widthCountAndDictAndDiff.length)

            // Compress with URLCompressor
            const widthCountAndDictAndDiffURLCompressed = URLCompressor.compress(widthCountAndDictAndDiff)
            //console.log(`${groupId} \t | After URLCompressor:  `, widthCountAndDictAndDiffURLCompressed.length)


            // Judge the URLCompressor should be applied or not
            const applyURLCompressorOrNotByGroup = compareLengthOfString(groupId, widthCountAndDictAndDiff, widthCountAndDictAndDiffURLCompressed)

            // Add 2 chars prefix to smaller size one
            const strokesValuesWithPrefixByGroup = addEncMethodPrefix2Chars(widthCountAndDictAndDiff, widthCountAndDictAndDiffURLCompressed, applyURLCompressorOrNotByGroup, baseXNumber)

            // Add color key to format as url params
            const strokesValuesJoinedAsURLParamsByGroup = groupId + '=' + strokesValuesWithPrefixByGroup

            // Push to array to store whole color stroke groups
            lengthAndStringArray = [strokesValuesJoinedAsURLParamsByGroup.length, strokesValuesJoinedAsURLParamsByGroup]
            strokesValuesByGroupMap.set(groupId, lengthAndStringArray)


            // For reference: Count the non dynamic compressioned strokes values length

            // Join the hex color code (key) and encoded strokes values (value) with `=` (equal)
            const joinedAsURLParamsBeforeURLComp = groupId + '=' + widthCountAndDictAndDiff
            const joinedAsURLParamsAfterURLComp = groupId + '=' + widthCountAndDictAndDiffURLCompressed

            // Push to the array for whole colors, `+ 2` for encode methods prefix length
            lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 2)
            lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 2)

            lengthBeforeAndAfterURLComp.set(`${baseXNumber}-beforeAndAfterURLComp`, [lengthBeforeURLComp, lengthAfterURLComp])

        } // End of for (const [groupId, valueDictAndDiffEncoded] of mergedDictAndDiffEncodedMapByGroup) {
        //console.log('strokesValuesByGroupMap: ', strokesValuesByGroupMap)
        // Map { 000 → (2) […], fff → (2) […] }


        // Function to add the encoding methods prefix

        // 1st char indicates URLCompressor applied (1) or not (0)
        // 2nd char indicates What number of BaseX using for strokes diff encoding, that is base52 encoded.
        // 2nd char is same value if URLComp applied or not.

        function addEncMethodPrefix2Chars(strokesValuesBeforeComp, strokesValuesAfterComp, applyURLCompressorOrNot, baseXNumber) {
            const baseXNumberEncodedViaBase52 = base52Encode(baseXNumber)

            if (applyURLCompressorOrNot === true) {
                // Set the encoding methods param as prefix for strokes values
                return strokesValuesWithEncMethodsPrefix = '1' + baseXNumberEncodedViaBase52 + strokesValuesAfterComp
            } else {
                // Set the encoding methods param as prefix for strokes values
                return strokesValuesWithEncMethodsPrefix = '0' + baseXNumberEncodedViaBase52 + strokesValuesBeforeComp
            }
        }
        lengthByBaseXNumber.set(baseXNumber, strokesValuesByGroupMap)

    } //End of Loop for every baseX values: [0-52]




    // The whole baseX and colors results

    console.log('lengthByBaseXNumber: ', lengthByBaseXNumber)
    // Map(53) { 52 → Map(2), 51 → Map(2), 50 → Map(2), 49 → Map(2), 48 → Map(2), 47 → Map(2), 46 → Map(2), 45 → Map(2), 44 → Map(2), 43 → Map(2), … }

    // `lengthByBaseXNumber` contains whole baseXNumber looped results like below.
    // For url param string, smaller one (URLComp or not) was chosen indivisually about each color.
    //   Key  : BaseXNumber (size: 53)
    //   Value: Map()
    //   e.g.
    //   Key  : 52
    //   Value: Map()
    //            Key  : color code (size: number of colors, e.g. '2' for 000 and fff)
    //            Value: Array[] [ Number: smaller length (URLComp or not), String: encoded string ]
    //            e.g.
    //            Key  : 000
    //            Value: [ 2811, "000=1ba9_eLsi ... 3P0pg7" ]
    //            Key  : fff
    //            Value: [ 318, ""fff=1ba9wi ... WDhaxt-LN" ]



    // Extract the smallest length combination from whole baseX[0-52] encoding results

    // Get whole color string as array

    let colorKeys = [];
    for (strokesByGroup of lengthByBaseXNumber.values()) {
        // keys()メソッドでキーだけを配列で取得
        colorKeys = [...strokesByGroup.keys()]
        //console.log('colorKeys; ', colorKeys) // Array [ "000", "fff" ]
    }

    // Choose smallest strings for each color

    const smallestStringsByGroup = new Map();
    for (color of colorKeys) {
        let smallestLength = 9999;
        for (strokesByGroup of lengthByBaseXNumber.values()) {
            //console.log(strokesByGroup.get(color))
            // Array [ 2811, "000=1ba9_eLs ... ]
            //console.log(strokesByGroup.get(color)[0])
            // 2811, 2758, ...
            // 318, 314, ...

            const currentLength = strokesByGroup.get(color)[0]

            if (smallestLength > currentLength) {
                smallestStringsByGroup.set(color, strokesByGroup.get(color)[1]) // Set the current smallest strings
                smallestLength = strokesByGroup.get(color)[0] // Set the smallest number for next time comparing
            }
        }
    }
    console.log('smallestStringsByGroup: ', smallestStringsByGroup)
    // Map { 000 → "000=1D9_eL ... qJwU8", fff → "fff=1Y9w ... pDjwpqm6" }

    // Whole color strings joined with `&`
    const wholeGroupStrJoined = joinWholeColorStr(smallestStringsByGroup)
    console.log('wholeGroupStrJoined: ', wholeGroupStrJoined)
    // 1=1X9CaIjMCzLAFox3gEVYTdnymbAmwP-UWDCnew3h-Aqsd6rQsPf7nuc97B-Tyl896LIItSqsH-0_igZRCKY265Ta0zzD8-axd0B3NgagFJ2rRrUWcULFyn1IwB&2=1V9z

    // Output to textarea
    outputToTextarea(wholeGroupStrJoined, 'textarea-strokes-values-encoded')

    // Show the size of result in html and console
    showStringSize('Strokes Values', wholeGroupStrJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('base0to52Enc()', elapsedTime, 'encoded-strokes-values-time')



    // For reference:

    // Show the encode methods list

    const colors = [...smallestStringsByGroup.keys()]
    const valuesStr = [...smallestStringsByGroup.values()]
    const encodedString = valuesStr.map((value) => value.split('=')[1].slice(0, 2)) // `=`の直後の 先頭から2文字目までの部分を切り出し
    const urlcompOrNotChosen = encodedString.map((value) => value[0])              // 1文字目
    const baseXNumberChosen = encodedString.map((value) => base52Decode(value[1])) // 2文字目

    for (i in colors) {
        console.log(`${colors[i]}:\tURLCompresor = ${urlcompOrNotChosen[i]}, BaseX = ${baseXNumberChosen[i]}`)
    }
    // 000:	URLCompresor = 1, BaseX = 30
    // fff:	URLCompresor = 1, BaseX = 49


    // Show the length of before and after URLComp for every baseX and color

    console.log('lengthBeforeAndAfterURLComp: ', lengthBeforeAndAfterURLComp)
    // Map(53) { "52-beforeAndAfterURLComp" → (2) […], "51-beforeAndAfterURLComp" → (2) […], ...

    for ([key, value] of lengthBeforeAndAfterURLComp) {
        console.log(key, value.flat())
    }
    // 52-beforeAndAfterURLComp Array(4) [ 3239, 351, 2808, 315 ]
    // 51-beforeAndAfterURLComp Array(4) [ 3120, 339, 2756, 312 ]
    // ...
    // 1-beforeAndAfterURLComp Array(4) [ 2891, 379, 2705, 382 ]
    // 0-beforeAndAfterURLComp Array(4) [ 2885, 379, 2702, 382 ]
}
