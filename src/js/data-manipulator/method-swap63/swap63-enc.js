// Replace a number of relative d values (-31 to 31) with a char of 63 keys ([0,1,2…9,a,b,c…z,A,B,C…Z,_])

function swap63Enc(swap63DictMap = generateSwap63DictToEnc(getSwap63Nums(), getSwap63Chars())) {
    const startTime = performance.now()

    // Dictionary and input values

    // Swap63 dictionary
    console.log('swap63DictMap: ', swap63DictMap);
    // Map(63) { -31 → "0", -30 → "1", -29 → "2", -28 → "3", -27 → "4", -26 → "5", -25 → "6", -24 → "7", -23 → "8", -22 → "9", … }


    // Read the relative d values from .json as Map()
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
    //console.log('linesDataMap: ', linesDataMap)
    //Map(5) {'1' => {…}, '2' => {…}, '3' => {…}, '4' => {…}, '5' => {…}}
    //    [[Entries]]
    //    0: {"1" => Object}
    //    1: {"2" => Object}
    //    2: {"3" => Object}
    //    3: {"4" => Object}
    //    4: {"5" => Object}

    // Test
    //for ([groupId, linesData] of linesDataMap) {
    //    console.log(groupId)                // 1
    //    console.log(linesData)               // {g_stroke: '#000', g_opacity: 1, g_stroke-opacity: 1, id: Array(19), stroke-width: Array(19), …}
    //    console.log(linesData.d.relative)    // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}
    //    console.log(linesData.d.relative.x1) // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]
    //}


    // Get the string of d values encoded as Map
    const encodedDvalByGroup = swap63EncByGroup(swap63DictMap, linesDataMap)
    console.log('encodedDvalByGroup: ', encodedDvalByGroup)
    // Map(5) {'1' => 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx', '2' => 'v9oswnHvnuzxsxwmvxDDAA7tWtvshunl_AxxwxxxxxyvwtvxwspCtuxxwwxyuwxw', '3' => 'wCuuzusuvxxrxuxtvAzyyyrvveuurvsttxxputwvsvttturpyutrsqttsAtvaBVbpyJuvwttrurvwrqppqqstrskuvmruyxmsqtruvtrwwwvBymtrvuDxuvqwuMuuwwwyywwvuxxuvyyrstuutwxyxxwxwyxxswxxtvyxzwxxxwwxAyxxxzyywwwxzwzzsyxvxxyytxwxyCCBAAyxzyxyxyxtuvAxzyzwvxvtsssuwwzyyzvwttxtvyt', '4' => 'JvruxouwuwvpwjxuvvABtvBuxzuxAhHsvtssxvqAxvxxwwwxwvwxyywyxxtuwutzvvywAxxxxwtt', '5' => 'HuxwxxuQcuywAwvtutuxxxyxywww'}



    //  From agg-data-for-comp

    // Get the width count (list_of_width and count_by_width) encoded as a string
    const encodedWidthCountByGroup = encodeWidthCount()
    //console.log('encodedWidthCountByGroup: ', encodedWidthCountByGroup)          // Map(5) {'1' => '3t', '2' => '2q', '3' => '1bk', '4' => '1t', '5' => '1h'}


    // Get the group colors(stroke, opacity, stroke-opacity) encoded as 10|6|5|3|1 chars hex
    const encodedColorsByGroup = encodeGroupColors(linesDataMap)
    //console.log('encodedColorsByGroup: ', encodedColorsByGroup) // Map(5) {'1' => '000', '2' => '000', '3' => '000', '4' => 'eee', '5' => 'fff'}



    // Choose smaller one between URLComp applied or not, for each group
    const optimizedEncodedStrokesByGroup = tryOptimizeWithURLComp(
        encodedDvalByGroup,
        encodedWidthCountByGroup,
        encodedColorsByGroup,
        'swap63-enc',
        null                        // value for 3rd char, swap63-enc needs no 3rd char to encode
    )
    console.log('optimizedEncodedStrokesByGroup: ', optimizedEncodedStrokesByGroup)
    // Map { 000 → (2) […] }
    //     0: 000 → Array [ 400, "000=13xbqDCEgLL7jANz5XKXua ... LiAh5KEXgVutC" ]



    // Whole group strings joined with `&`
    const wholeGroupStrJoined = joinWithAnd(optimizedEncodedStrokesByGroup)



    // Output to textarea
    outputToTextarea(wholeGroupStrJoined, 'textarea-strokes-values-encoded')
    // 000=19gUZa0HMswFYl ... lCLwK3WhT

    // Show the size of result in html and console
    showStringSize('Lines Data', wholeGroupStrJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('swap63Enc()', elapsedTime, 'encoded-strokes-values-time')

    // Show the encoding result of each group in console
    showDetailsByGroup('Lines Data', optimizedEncodedStrokesByGroup)

    return optimizedEncodedStrokesByGroup
}



// Get the encoded string of d values as Map
function swap63EncByGroup(dictMap, linesDataMap) {
    //console.log(dictMap); // Map(63) {-31 => '0', -30 => '1', -29 => '2', -28 => '3', -27 => '4', …}

    const encodedDvals = new Map();

    for (const linesData of linesDataMap.values()) {

        // A variable to store the encoded string of d values
        // Joined whole columns (x1, y1, x2, y2) without spaces
        let dvalsEncodedStr = "";

        // relative d values array in obj, x1 to y2
        const relDvals = linesData.d.relative

        const numberOfPath = (linesData.d.relative.x1).length // x1 to y2 arrays have same length

        // Swap from number to char
        for (let key in relDvals) {
            //console.log('key: ', key)  // x1, y1, x2, y2
            const dval = relDvals[key]
            //console.log(dval); // (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]

            // Encode and append
            dvalsEncodedStr = dvalsEncodedStr + swap63NumToChar(dval, numberOfPath, dictMap)
        }

        encodedDvals.set(linesData.g_id, dvalsEncodedStr)
    }
    return encodedDvals
}



function swap63NumToChar(dval, numberOfPath, dictMap) {

    let dvalEncoded = ''

    // Use the original d value as an index to look up a character from the keys list and append it to the symbol string variable
    for (let i = 0; i < numberOfPath; i++) {
        const encodedChar = dictMap.get(dval[i]);
        dvalEncoded = dvalEncoded + encodedChar
    }

    return dvalEncoded
}