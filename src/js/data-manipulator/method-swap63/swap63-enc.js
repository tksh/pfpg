// Relative な d value (-31 to 31) の 数値 を
// 63個の キー ([0,1,2..9,a,b,c..z,A,B,C...Z,_]) の 文字列 に 置き換える

function swap63Enc(swap63DictMap = generateSwap63DictToEnc(getSwap63Nums(), getSwap63Chars())) {
    const startTime = performance.now()

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
    const encodedWidthCountByGroup = encodeWidthCount()
    //console.log(encodedWidthCountByGroup)          // Map(5) {'1' => '3t', '2' => '2q', '3' => '1bk', '4' => '1t', '5' => '1h'}
    //console.log(encodedWidthCountByGroup.get("1")) // 3t


    // Get the group colors(stroke, opacity, stroke-opacity) encoded as 10|6|5|3|1 chars hex
    const encodedColorsByGroup = encodeColors(strokesAttrsMap)
    //console.log(encodedColorsByGroup) // Map(5) {'1' => '000', '2' => '000', '3' => '000', '4' => 'eee', '5' => 'fff'}



    // Choose smaller one between URLComp applied or not, for each group
    const optimizedEncodedStrokesByGroup = applyUrlCompIfEffective(
        encodedDvalByGroup,
        encodedWidthCountByGroup,
        encodedColorsByGroup,
        'swap63-enc',
        null                        // value for 3rd char, swap63-enc needs no 3rd char to encode
    )
    //console.log('optimizedEncodedStrokesByGroup: ', optimizedEncodedStrokesByGroup)
    // Map { 000 → (2) […] }
    //     0: 000 → Array [ 400, "000=13xbqDCEgLL7jANz5XKXua ... LiAh5KEXgVutC" ]



    // Whole group strings joined with `&`
    const wholeGroupStrJoined = joinWithAnd(optimizedEncodedStrokesByGroup)



    // Output to textarea
    outputToTextarea(wholeGroupStrJoined, 'textarea-strokes-values-encoded')
    // 000=19gUZa0HMswFYl ... lCLwK3WhT

    // Show the size of result in html and console
    showStringSize('Strokes Values', wholeGroupStrJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('swap63Enc()', elapsedTime, 'encoded-strokes-values-time')

    // Show the encoding result of each group in console
    showDetailsByGroup('Strokes Values', optimizedEncodedStrokesByGroup)

    return optimizedEncodedStrokesByGroup
}



// Get the encoded string of d values as Map
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
            //console.log('key: ', key)  // key: x1, y1, x2, y2
            const dval = relDvals[key]
            //console.log(dval); // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]

            dvalsEncodedStr = dvalsEncodedStr + swap63NumToChar(dval, numberOfPath, dictMap)
        }

        encodedStrByGroup.set(groupId, dvalsEncodedStr)
    }
    return encodedStrByGroup
}



function swap63NumToChar(dval, numberOfPath, dictMap) {

    let dvalsEncodedStr = ''

    // オブジェクトのキーとして 変換元の数値を代入し 対応する符号を得て 変数にpushしていく
    for (let i = 0; i < numberOfPath; i++) {
        const encodedChar = dictMap.get(dval[i]);
        dvalsEncodedStr = dvalsEncodedStr + encodedChar
    }

    return dvalsEncodedStr
}