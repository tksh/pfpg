// Relative な d value (-31 to 31) の 数値 を
// 63個の キー ([0,1,2..9,a,b,c..z,A,B,C...Z,_]) の 文字列 に 置き換える

////////////////////////////////// Output: //////////////////////////////////

// Format: [1st group colors]=[1st char][2nd char][width count encoded]-[x1 encoded][y1 encoded][x2 encoded][y2 encoded]&[2nd group colors]=...
// e.g. 000=129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha&000=129ziKOkaP8myCQ4EBznmZp2zqRtASHCnLgULFSIs1qwA4wKBtYQuGf1gRP00BIScd&000=129hs5bAsvfxmrAHkI-1TvVM1BPu2F0SwA62QxTrqQnBSFhkMwk3rplTElFsdYa8u0fN1za1q8rITDQ2hOYUk2_FBGrTBiUPgN-dSDNjaC9lObDxTrljDtmJD3UeQNreGOynsFA5VyMFe-Dg5hw-J5OfTNzxNXvvy7dVAcvTyQIKjkEzDPzw1TQwtzJkEPSG1_OF46qmpC&eee=129iaIRDFvcu0ldUIBY5rOUPAtwVAQza8pvqZyCHTrCSo71OFPMs7aaEwPTmrIYq1wFdm&fff=129g6IVCHsyEPtAV4bRErsc8vl2CA0

// Encoding format:
// [hex(3|5|6|10)chars]([stroke(hex(3|6))][opacity(hex(1|2))][stroke-opacity(hex(1|2))])=
// 1st char [Encode-type-A: *0*:none, *1*:URLCompressor] (*1*の場合 2文字目以降全体(次のグループが始まる`&`まで)を圧縮する)
// 2nd char [Encode-type-B: *0*:mixed-enc, *1*:bigint-enc, *2*:swap63-enc(only for UInt5Portary)]
// 3rd char [Preference number for Encode-type-B as *base52 encoded char*:
//              For *0*:mixed-enc  => Base X number for mixed-enc,
//              For *1*:bigint-enc => split by X digits for bigint-enc,
//              For *2*:swap63-enc => Nothing (Encoded value start at 3rd char)]
// After 4th char: widthCount(width number, amount base52 encoded, ...)]
//                     [`list_of_width`(Int) と `count_by_width`(base52 encoded Char(s)) を交互に並べた文字列]
//                     `-`[x1:swap63-encoded] [y1:swap63-encoded] [x2:swap63-encoded] [y2:swap63-encoded]


function swap63Enc(swap63DictMap = generateSwap63DictToEnc(getSwap63Nums(), getSwap63Chars())) {

    // Dictionary and input values

    // Swap63 dictionary
    //console.log('swap63DictMap: ', swap63DictMap);
    // Map(63) { -31 → "0", -30 → "1", -29 → "2", -28 → "3", -27 → "4", -26 → "5", -25 → "6", -24 → "7", -23 → "8", -22 → "9", … }


    // Read the relative d values from .json as Map() grouped by group_id
    const strokesAttrsMap = jsonToMapObj('textarea-strokes-attrs-uploaded')
    //console.log('strokesAttrsMap: ', strokesAttrsMap)
    //Map(5) {'1' => {…}, '2' => {…}, '3' => {…}, '4' => {…}, '5' => {…}}
    //    [[Entries]]
    //    0: {"1" => Object}
    //    1: {"2" => Object}
    //    2: {"3" => Object}
    //    3: {"4" => Object}
    //    4: {"5" => Object}

    // Test
    //for ([groupId, attrsObj] of strokesAttrsMap) {
    //    console.log(groupId)                // 1
    //    console.log(attrsObj)               // {g_stroke: '#000', g_opacity: 1, g_stroke-opacity: 1, id: Array(19), stroke-width: Array(19), …}
    //    console.log(attrsObj.d.relative)    // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}
    //    console.log(attrsObj.d.relative.x1) // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]
    //}


    // Get the string of d values encoded as Map
    const encodedDvalByGroup = swap63EncByGroup(swap63DictMap, strokesAttrsMap)
    console.log('encodedDvalByGroup: ', encodedDvalByGroup)
    // Map(5) {'1' => 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx', '2' => 'v9oswnHvnuzxsxwmvxDDAA7tWtvshunl_AxxwxxxxxyvwtvxwspCtuxxwwxyuwxw', '3' => 'wCuuzusuvxxrxuxtvAzyyyrvveuurvsttxxputwvsvttturpyutrsqttsAtvaBVbpyJuvwttrurvwrqppqqstrskuvmruyxmsqtruvtrwwwvBymtrvuDxuvqwuMuuwwwyywwvuxxuvyyrstuutwxyxxwxwyxxswxxtvyxzwxxxwwxAyxxxzyywwwxzwzzsyxvxxyytxwxyCCBAAyxzyxyxyxtuvAxzyzwvxvtsssuwwzyyzvwttxtvyt', '4' => 'JvruxouwuwvpwjxuvvABtvBuxzuxAhHsvtssxvqAxvxxwwwxwvwxyywyxxtuwutzvvywAxxxxwtt', '5' => 'HuxwxxuQcuywAwvtutuxxxyxywww'}



    //  From agg-data-for-comp

    // Get the width count (list_of_width and count_by_width) encoded as a string
    const widthCountEncodedByGroup = encodeWidthCount()
    //console.log(widthCountEncodedByGroup)          // Map(5) {'1' => '3t', '2' => '2q', '3' => '1bk', '4' => '1t', '5' => '1h'}
    //console.log(widthCountEncodedByGroup.get("1")) // 3t


    // Get the group colors(stroke, opacity, stroke-opacity) encoded as 3 or 5 or 6 or 10 chars hex
    const colorsEncodedByGroup = encodeColors(strokesAttrsMap)
    //console.log(colorsEncodedByGroup) // Map(5) {'1' => '000', '2' => '000', '3' => '000', '4' => 'eee', '5' => 'fff'}



    // Choose smaller one between URLComp applied or not, for each group
    const optimizedEncodedStrokesByGroup = applyUrlCompIfEffective(
        encodedDvalByGroup,
        widthCountEncodedByGroup,
        colorsEncodedByGroup)
    //console.log('optimizedEncodedStrokesByGroup: ', optimizedEncodedStrokesByGroup)
    // Map { 000 → (2) […] }
    //     0: 000 → Array [ 400, "000=13xbqDCEgLL7jANz5XKXua ... LiAh5KEXgVutC" ]



    // Whole group strings joined with `&`
    const wholeGroupStrJoined = joinStrWithAmpersand(optimizedEncodedStrokesByGroup)



    // Output to textarea
    outputToTextarea(wholeGroupStrJoined, 'textarea-strokes-values-encoded')
    // 000=19gUZa0HMswFYl ... lCLwK3WhT

}



/////// Inner functions ///////

// Swap63 encode

// Get the string of d values encoded as Map
function swap63EncByGroup(dictMap, strokesAttrsMap) {
    //console.log(dictMap); // Map(63) {-31 => '0', -30 => '1', -29 => '2', -28 => '3', -27 => '4', …}

    const encodedStrByGroup = new Map();

    for ([groupId, attrsObj] of strokesAttrsMap) {

        // 変換後の文字列を入れる変数
        let dvalsEncodedStr = ""; // x1, y1, x2, y2, joined witout spaces

        // relative d values array in obj, x1 to y2
        const relDvals = attrsObj.d.relative

        const numberOfPath = (attrsObj.d.relative.x1).length // x1 to y2 arrays have same length

        // Swap from number to char
        for (let key in relDvals) {
            const dval = relDvals[key]
            //console.log(dval); // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]

            // オブジェクトのキーとして 変換元の数値を代入し 対応する符号を得て 変数にpushしていく
            for (let i = 0; i < numberOfPath; i++) {
                const encodedChar = dictMap.get(dval[i]);
                dvalsEncodedStr = dvalsEncodedStr + encodedChar
            }
        }

        encodedStrByGroup.set(groupId, dvalsEncodedStr)
    }
    return encodedStrByGroup
}



// Choose the smaller one from URLCompressed applied or not

function applyUrlCompIfEffective(encodedDvalByGroup, widthCountEncodedByGroup, colorsEncodedByGroup) {

    // Store smaller length strings
    const wholeEncodedValuesByGroup = new Map();

    // For JUST comparing between URLComp applied or not
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];


    for (const [groupId, dvalSwap63EncodedStr] of encodedDvalByGroup) {

        // Get encoded width count that have same group_id as a key
        const widthCountEncoded = widthCountEncodedByGroup.get(groupId)
        //console.log('widthCountEncoded: ', widthCountEncoded) // 3t

        // Join the [width count] and [swap63 encoded dvals] with `-` (hyphen)
        // [width count]-[x1, y1, x2, y2]
        const widthCountAndDval = widthCountEncoded + '-' + dvalSwap63EncodedStr


        // Compress with URLCompressor
        const widthCountAndDvalURLCompressed = URLCompressor.compress(widthCountAndDval)

        // Judge the URLCompressor should be applied or not
        const applyURLCompressorOrNot = compareLengthOfString(groupId, widthCountAndDval, widthCountAndDvalURLCompressed)
        // URLCompressor is effective for color #000, so should be applied it: 488 => 395
        // URLCompressor is effective for color #000, so should be applied it: 492 => 400
        // console.log('applyURLCompressorOrNot: ', applyURLCompressorOrNot) // true


        const smallerStrWithPrefix = chooseSmallerAndAddPrefix(
            applyURLCompressorOrNot,        // Boolean of apply the compression or not
            widthCountAndDvalURLCompressed, // Compressed string
            widthCountAndDval,              // Raw string
            'swap63-enc',                   // Encode method name
            null                            // Value for 3rd char
        )

        console.log('smallerStrWithPrefix: ', smallerStrWithPrefix)
        // 129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha


        // Add color attrs for group (stroke, opacity, stroke-opacity) encoded as 3|5|6|10 chars hex
        const groupColorsPrefixAddedByGroup = colorsEncodedByGroup.get(groupId) + '=' + smallerStrWithPrefix
        // console.log('groupColorsPrefixAddedByGroup: ', groupColorsPrefixAddedByGroup)
        // 000=129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha

        // Set to Map the whole stroke groups
        wholeEncodedValuesByGroup.set(groupId, groupColorsPrefixAddedByGroup)



        // For JUST comparing between URLComp applied or not

        // Join the encoded group colors and strokes values (without flags)
        const joinedAsURLParamsBeforeURLComp = colorsEncodedByGroup.get(groupId) + '=' + widthCountAndDval
        const joinedAsURLParamsAfterURLComp = colorsEncodedByGroup.get(groupId) + '=' + widthCountAndDvalURLCompressed
        // Push to the array for whole colors, `+ 2` means length of 2 chars flags
        lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 2)
        lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 2)
    }

    // For JUST comparing between URLComp applied or not
    console.log('Before URLComp (Each group encoded string length): ', lengthBeforeURLComp) // (5) [85, 73, 258, 85, 37]
    console.log('After URLComp  (Each group encoded string length): ', lengthAfterURLComp)  // (5) [84, 70, 206, 73, 34]
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, 0)
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, 0)
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore) // 538
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter)  // 467
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore) // 0.8680297397769516

    return wholeEncodedValuesByGroup
}


// 1. Choose smaller size string, compressed or not
// 2. Add the prefix chars into chosen one
function chooseSmallerAndAddPrefix(applyCompOrNotBoolean, compressedStr, rawStr, compMethodName, valueOf3rdChar) {
    // Result string
    let smallerStrWithPrefix = ""

    // Init the flags
    let numFor2ndFlag = 0
    let valueFor3rdFlag = ""

    // Change the flags values as each encode method specific
    if (compMethodName === 'swap63-enc') {
        numFor2ndFlag = 2
        valueFor3rdFlag = null
    } else if (compMethodName === 'bigint-enc') {
        numFor2ndFlag = 1
        valueFor3rdFlag = valueOf3rdChar
    } else if (compMethodName === 'baseX-enc') {
        numFor2ndFlag = 0
        valueFor3rdFlag = valueOf3rdChar
    }


    if (applyCompOrNotBoolean === true) { // Compression applied
        smallerStrWithPrefix = addPrefixAsFlags(compressedStr,
            1,              // Flag for 1st char as URLComp applied
            numFor2ndFlag,  // Flag for 2nd char as swap63Enc applied
            valueFor3rdFlag // No flag needed for 3rd char when swap63Enc applied
        )
    } else { // Compression not applied
        smallerStrWithPrefix = addPrefixAsFlags(rawStr,
            0,              // Flag for 1st char as URLComp not applied
            numFor2ndFlag,  // Flag for 2nd char as swap63Enc applied
            valueFor3rdFlag // No flag needed for 3rd char when swap63Enc applied
        )
    }
    return smallerStrWithPrefix
}



// Add the chars for flags that indicates encoding method settings

// 1st char(Encode-type-A): [0] Raw       / [1] URLCompressor
// 2nd char(Encode-type-B): [0] baseX-enc / [1] bigint-enc / [2] swap63-enc
// 3rd char(Config value for Encode-type-B): Base52 encoded char
//                                           For [0] baseX-enc  => Base X number
//                                           For [1] bigint-enc => X digits to split into each chunks
//                                           For [2] swap63-enc => Nothing (Encoded values start at 3rd char)]
function addPrefixAsFlags(inputStr, numFor1stFlag, numFor2ndFlag, valueFor3rdFlag) {
    let strWithFlag = inputStr

    // Add 3rd char
    if (valueFor3rdFlag === null) {
        console.log("The encode method now using is Swap63, Not need to add any char as 3rd flag.")
    } else {
        strWithFlag = `${valueFor3rdFlag}` + strWithFlag
    }

    // Add 2nd char
    if (numFor2ndFlag >= 3) {
        console.log("Invalid number for 2nd flag.")
    } else {
        strWithFlag = `${numFor2ndFlag}` + strWithFlag
    }

    // Add 1st char
    if (numFor1stFlag >= 2) {
        console.log("Invalid number for 1st flag.")
    } else {
        strWithFlag = `${numFor1stFlag}` + strWithFlag
    }

    return strWithFlag
}
