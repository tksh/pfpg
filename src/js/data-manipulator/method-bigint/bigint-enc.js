function bigintEnc() {
    const startTime = performance.now()

    // Get digits of chunk for padding
    const digits_of_chunk = getDigitsOfChunk()
    //console.log("digits_of_chunk: ", digits_of_chunk) // 2


    // Get the strokes values

    // Read the relative d values from .json as Map() grouped by group_id
    const strokesAttrsMap = jsonToMapObj('textarea-strokes-attrs-uploaded')
    //console.log('strokesAttrsMap: ', strokesAttrsMap)
    //Map(5) {'1' => {…}, '2' => {…}, '3' => {…}, '4' => {…}, '5' => {…}}

    // Test
    //for ([groupId, attrsObj] of strokesAttrsMap) {
    //    console.log(groupId)                // 1
    //    console.log(attrsObj)               // {g_stroke: '#000', g_opacity: 1, g_stroke-opacity: 1, id: Array(19), stroke-width: Array(19), …}
    //    console.log(attrsObj.d.absolute)    // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}
    //    console.log(attrsObj.d.absolute.x1) // (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]
    //}



    // BigInt encode apply to absolute d values

    const encodedDvalByGroup = bigintEncByGroup(strokesAttrsMap, digits_of_chunk)
    //console.log("encodedStrByGroup: ", encodedStrByGroup)
    // Map(5) {'1' => '01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710', '2' => ...



    //  From agg-data-for-comp

    // Get the width count (list_of_width and count_by_width) encoded as a string
    const encodedWidthCountByGroup = encodeWidthCount()

    // Get the group colors(stroke, opacity, stroke-opacity) encoded as 10|6|5|3|1 chars hex
    const encodedColorsByGroup = encodeColors(strokesAttrsMap)
    console.log(encodedColorsByGroup) // Map(5) {'1' => '0', '2' => '0', '3' => '0', '4' => 'e', '5' => 'f'}

    // Choose smaller one between URLComp applied or not, for each group
    const optimizedEncodedStrokesByGroup = applyUrlCompIfEffective(
        encodedDvalByGroup,
        encodedWidthCountByGroup,
        encodedColorsByGroup,
        'bigint-enc',
        digits_of_chunk
        )
    //console.log('optimizedEncodedStrokesByGroup: ', optimizedEncodedStrokesByGroup)
    // Map(5) {'1' => '0=129CaJGsAQK33q3FDaoQNuZs6u8XQW_EYegViBcDQ0gxtk-YqavrFw0V3KXggctKtnLfj_rl3ZzTzitfvmVp-Wz09Um3k4e8YyZ9kGHG0aT', '2' => '0=129ziJH ...



    // Whole group strings joined with `&`
    const wholeGroupStrJoined = joinStrWithAmpersand(optimizedEncodedStrokesByGroup)



    // Output to textarea
    outputToTextarea(wholeGroupStrJoined, 'textarea-strokes-values-encoded')
    // 0=129CaJGsAQK33q3FDaoQNuZs6u8XQW_EYegViBcDQ0gxtk-YqavrFw0V3KXggctKtnLfj_rl3ZzTzitfvmVp-Wz09Um3k4e8YyZ9kGHG0aT&0=129ziJH ...

    // Show the size of result in html and console
    showStringSize('Strokes Values', wholeGroupStrJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('bigintEnc()', elapsedTime, 'encoded-strokes-values-time')
}


// BigInt encode

function getDigitsOfChunk() {
    // Read from textarea as JSON
    const rawJson = readTextarea('textarea-artwork-data-uploaded')
    const artworkDataObj = JSON.parse(rawJson)

    // Size
    const grid_size_str = artworkDataObj.grid_size
    const split_by_x = grid_size_str.split('x')            // (2) ['255', '255']
    const max = Math.max(...split_by_x)                    // 255

    return String(max).length
}



function padZero(number, targetLength) {
    return String(number).padStart(targetLength, '0');
}



function bigintEncByGroup(strokesAttrsMap, digits_of_chunk) {
    const encodedStrByGroup = new Map();

    for ([groupId, attrsObj] of strokesAttrsMap) {

        // absolute d values array in obj, x1 to y2
        const absDvals = attrsObj.d.absolute

        //const numberOfPath = (attrsObj.d.absolute.x1).length // x1 to y2 arrays have same length


        // Pad and join
        let joinedDvalsStr = ""; // x1, y1, x2, y2, joined witout spaces

        for (let key in absDvals) {
            const dval = absDvals[key]
            //console.log(dval); // (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]

            // Pad
            const paddedDval = dval.map(number => padZero(number, digits_of_chunk))
            //console.log("paddedDval: ", paddedDval)
            // (19) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23']

            // Join
            const joinedDval = paddedDval.join('')
            //console.log("joinedDvals: ", joinedDvals)
            // 01040706080719252428301704222622222323

            joinedDvalsStr = joinedDvalsStr + joinedDval
        }
        // Encode with Base64 URL safe encode
        const joinedDvalsBigInt = BigInt(joinedDvalsStr)
        const base64EncodedDvalsStr = base64UrlEncForBigInt(joinedDvalsBigInt)

        encodedStrByGroup.set(groupId, base64EncodedDvalsStr)
    }

    // Encoded
    //console.log("encodedStrByGroup: ", encodedStrByGroup)
    // Map(5) {'1' => '01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710', '2' => ...

    return encodedStrByGroup
}