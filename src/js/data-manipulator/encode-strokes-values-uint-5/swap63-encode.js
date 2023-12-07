// Relative な d value (-31 to 31) の 数値 を
// 63個の キー ([0,1,2..9,a,b,c..z,A,B,C...Z,_]) の 文字列 に 置き換える

////////////////////////////////// Output: //////////////////////////////////

// Format: [1st:color]=[1st char: binary flag for URLComp or not][strokesInfo(width number, amount base52 encoded, ...)]-[x1:dict]-[x1:diff]-[y1:dict]-[y1:diff]-[x2:dict]-[x2:diff]-[y2:dict]-[y2:diff]&[2nd:color]=...
// e.g. 000=1E9_eLsiCq2FV ... 3MIQzvvmCESj9yYZkIDMJ4l4

//New
// Format: [hex(5|10)chars]([stroke(hex(3|6))][opacity(hex(1|2))][stroke-opacity(hex(1|2))])=
//         1st char [Encode-type-A: *0*:none, *1*:URLCompressor] (*1*の場合 2文字目以降全体(次のグループが始まる`&`まで)を圧縮する)
//         2nd char [Encode-type-B: *0*:mixed-enc, *1*:bigint-enc, *2*:swap63-enc(only for UInt5Portary)]
//         3rd char [Preference number for Encode-type-B as *base52 encoded char*:
//                      For *0*:mixed-enc  => Base X number for mixed-enc,
//                      For *1*:bigint-enc => split by X digits for bigint-enc,
//                      For *2*:swap63-enc => Nothing (Encoded value start at 3rd char)]
//         After 4th char: strokesInfo(width number, amount base52 encoded, ...)]
//                             [`list_of_width`(Int) と `count_by_width`(base52 encoded Char(s)) を交互に並べた文字列]
//                             `-`[x1:swap63-encoded] [y1:swap63-encoded] [x2:swap63-encoded] [y2:swap63-encoded]


//function swap63Encode(swap63DictMap = generateSwap63Dict(), dvalByColor = extractDValues()) {
function swap63Encode(swap63DictMap = generateSwap63Dict()) {

    // Dictionary and input values

    // Swap63 dictionary
    //console.log('swap63DictMap: ', swap63DictMap);
    // Map(63) { -31 → "0", -30 → "1", -29 → "2", -28 → "3", -27 → "4", -26 → "5", -25 → "6", -24 → "7", -23 → "8", -22 → "9", … }


    // Read the relative d values from .json as Map() grouped by group_id
    const strokesAttrsMap = jsonToMapObj('textarea-uint5portray-strokes-attrs-uploaded')
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


    const encodedDvalByGroup = swap63EncodeForDvalByColor(swap63DictMap, strokesAttrsMap)
    console.log('encodedDvalByGroup: ', encodedDvalByGroup)
    // Map(5) {'1' => 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx', '2' => 'v9oswnHvnuzxsxwmvxDDAA7tWtvshunl_AxxwxxxxxyvwtvxwspCtuxxwwxyuwxw', '3' => 'wCuuzusuvxxrxuxtvAzyyyrvveuurvsttxxputwvsvttturpyutrsqttsAtvaBVbpyJuvwttrurvwrqppqqstrskuvmruyxmsqtruvtrwwwvBymtrvuDxuvqwuMuuwwwyywwvuxxuvyyrstuutwxyxxwxwyxxswxxtvyxzwxxxwwxAyxxxzyywwwxzwzzsyxvxxyytxwxyCCBAAyxzyxyxyxtuvAxzyzwvxvtsssuwwzyyzvwttxtvyt', '4' => 'JvruxouwuwvpwjxuvvABtvBuxzuxAhHsvtssxvqAxvxxwwwxwvwxyywyxxtuwutzvvywAxxxxwtt', '5' => 'HuxwxxuQcuywAwvtutuxxxyxywww'}


    // Choose smaller one between URLComp or not, for each color

    const optimizedEncodedStrokesByColor = applyUrlCompIfEffective(encodedDvalByGroup)
    //console.log('optimizedEncodedStrokesByColor: ', optimizedEncodedStrokesByColor)
    // Map { 000 → (2) […] }
    //     0: 000 → Array [ 400, "000=13xbqDCEgLL7jANz5XKXua ... LiAh5KEXgVutC" ]



    // Whole color strings joined with `&`
    const wholeColorStrJoined = joinWholeColorStr(optimizedEncodedStrokesByColor)



    // Output to textarea
    outputToTextarea(wholeColorStrJoined, 'textarea-uint5portray-strokes-values-encoded')
    // 000=19gUZa0HMswFYl ... lCLwK3WhT

}





/////// Inner functions ///////

// Swap63 encode

function swap63EncodeForDvalByColor(dictMap, strokesAttrsMap) {
    //console.log(dictMap); // Map(63) {-31 => '0', -30 => '1', -29 => '2', -28 => '3', -27 => '4', …}

    const encodedStrByGroupId = new Map();

    for ([groupId, attrsObj] of strokesAttrsMap) {

        // 変換後の文字列を入れる変数
        let dvalsEncodedStr = ""; // x1, y1, x2, y2, joined witout spaces

        // relative d values array in obj, x1 to y2
        const relDvals = attrsObj.d.relative

        const numberOfPath = (attrsObj.d.relative.x1).length // x1 to y2 arrays have same length
        console.log('numberOfPath: ', numberOfPath);

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

        encodedStrByGroupId.set(groupId, dvalsEncodedStr)
    }
    return encodedStrByGroupId
}



// Choose the smaller one from URLCompressed or not

function applyUrlCompIfEffective(encodedDvalByColor) {

    // Get the strokes info encoded from another .json file
    const strokesInfoEncodedMapByColor = encodeStrokesInfo('uint5')
    //console.log('strokesInfoEncodedMapByColor: ', strokesInfoEncodedMapByColor) // Map { 000 → "1cs" }

    // Store smaller length strings
    //let lengthAndStringArray = [];
    const strokesValuesByColorMap = new Map();

    // For reference: Comparing the length of Using URLCompressor or not
    const lengthBeforeAndAfterURLComp = new Map();
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];

    for (const [keyColor, dvalSwap63EncodedStr] of encodedDvalByColor) {

        // Get encoded strokes info that have same color as a key
        const strokesInfoEncoded = strokesInfoEncodedMapByColor.get(keyColor)
        //console.log('strokesInfoEncoded: ', strokesInfoEncoded) // 1cs

        // Join the [strokes info] and [dict]_[diff] with `-` (hyphen)
        const strokesInfoAndDval = strokesInfoEncoded + '-' + dvalSwap63EncodedStr
        // [strokesInfo]-[x1:dval, y1:dval, x2:dval, y2:dval]

        // Compress with URLCompressor
        const strokesInfoAndDvalURLCompressed = URLCompressor.compress(strokesInfoAndDval)
        console.log(`${keyColor} \t | After URLCompressor:  `, strokesInfoAndDvalURLCompressed.length)
        // 000 	 | After URLCompressor:   400


        // Judge the URLCompressor should be applied or not
        const applyURLCompressorOrNotByColor = compareLengthOfString(keyColor, strokesInfoAndDval, strokesInfoAndDvalURLCompressed)
        // URLCompressor is effective for color #000, should be applied it: 488 => 395
        // URLCompressor is effective for color #000, should be applied it: 492 => 400
        // console.log('applyURLCompressorOrNotByColor: ', applyURLCompressorOrNotByColor) // true

        // Add the prefix to smaller size one
        const smallerWithPrefixByColor = addEncMethodPrefix(strokesInfoAndDval, strokesInfoAndDvalURLCompressed, applyURLCompressorOrNotByColor)
        // 0[strokesInfo]-[x1:dval, y1:dval, x2:dval, y2:dval] / URLComp not applied
        // 1[strokesInfo]-[x1:dval, y1:dval, x2:dval, y2:dval] / URLComp applied
        //console.log('smallerWithPrefixByColor: ', smallerWithPrefixByColor) // 19gUZa0HMswFYlcjyOT0hPaVTdR3z-8 ... xAQ8lCLwK3WhT

        // Add color key to format as url params
        const colorPrefixAddedByColor = keyColor + '=' + smallerWithPrefixByColor
        // 000=[strokes encoded string with prefix]
        console.log('colorPrefixAddedByColor: ', colorPrefixAddedByColor)

        // Push to array to store whole color stroke groups
        strokesValuesByColorMap.set(keyColor, colorPrefixAddedByColor)


        // For reference: Count the non dynamic compressioned strokes values length

        // Join the hex color code (key) and encoded strokes values (value) with `=` (equal)
        const joinedAsURLParamsBeforeURLComp = keyColor + '=' + strokesInfoAndDval
        const joinedAsURLParamsAfterURLComp = keyColor + '=' + strokesInfoAndDvalURLCompressed

        // Push to the array for whole colors, `+ 1` for encode methods prefix length
        lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 1)
        lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 1)

        lengthBeforeAndAfterURLComp.set('beforeAndAfterURLComp', [lengthBeforeURLComp, lengthAfterURLComp])
        console.log('lengthBeforeAndAfterURLComp: ', lengthBeforeAndAfterURLComp)
        // Map { beforeAndAfterURLComp → (2) […] }
        //    <value>: Array [ (1) […], (1) […] ]
        //        0: Array [ 493 ]
        //        1: Array [ 400 ]
    }

    return strokesValuesByColorMap
}




// Add the prefix for binary flag for encoding methods

// 0/1 indicates URLCompressor applied (1) or not (0)
function addEncMethodPrefix(strokesValuesBeforeComp, strokesValuesAfterComp, applyURLCompressorOrNot) {
    if (applyURLCompressorOrNot === true) {
        // Set the encoding methods param as prefix for strokes values
        return strokesValuesWithEncMethodsPrefix = '1' + strokesValuesAfterComp
    } else {
        // Set the encoding methods param as prefix for strokes values
        return strokesValuesWithEncMethodsPrefix = '0' + strokesValuesBeforeComp
    }
}