// Decode from URL Params to SVG
decode()

function decode() {
    const urlParamsAsTwoMaps = readUrlParamsAsMaps()

    // Extract the values
    const artworkDataMap = urlParamsAsTwoMaps[0]
    // console.log("artworkDataMap: ", artworkDataMap)
    // Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uint_n' => 5, 'bg_color' => '9999'}

    const strokesValuesMap = urlParamsAsTwoMaps[1]
    // console.log("strokesValuesMap: ", strokesValuesMap)
    // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
    // key  : Group ID (seq num)
    // value: Object
    //            group_colors  : Object {g_stroke: '#000000', g_opacity: 1, g_stroke-opacity: 1}
    //            {three_flags  : Array(3)}
    //            {width_count  : Map(1)}
    //            {encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}

    const decodedRelDvalsMap = decodeStrokesValues(strokesValuesMap)
    // console.log("decodedRelDvalsMap: ", decodedRelDvalsMap)
    // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
    // [[Entries]]
    //     0: {1 => Object}
    //         key: 1
    //         value: x1: (19) [1, 3, 3, 0, -2, -1, 8, 1, -2, 4, 2, -13, -16, 14, 2, -1, 0, -1, -8]
    //                x2: (19) [0, 0, -1, 4, 0, 4, 5, 1, 0, 0, 0, 3, 4, 2, -3, 0, 2, 8, 3]
    //                y1: (19) [0, -26, -25, -8, -1, -18, 0, -5, -9, -22, -25, 1, -7, -22, 2, -1, -1, -1, -19]
    //                y2: (19) [26, 25, 23, 6, 3, -5, 5, 24, 7, 25, 27, 3, -2, 9, 6, 4, 4, 5, 2]
    //     1: {2 => Object}
    //         key: 2
    // ...


    // Generate SVG string

    const svgStr = generateSvg(artworkDataMap, strokesValuesMap, decodedRelDvalsMap)

    // Output to textarea
    outputToTextarea(svgStr, 'textarea-decoded-svg')

    // Compare the data size of URL params and generated SVG
    const queryString = window.location.search;
    const compRatio = queryString.length / svgStr.length

    // Show the result in html
    const resultTextElem = document.getElementById('encoded-size-compare');
    if (resultTextElem) {
        const text = `url params size: <b>${queryString.length}</b> characters (bytes)<br>
        docoded svg size: <b>${svgStr.length}</b> characters (bytes)<br>
        ${queryString.length} / ${svgStr.length} = <b>${compRatio}</b>`
        resultTextElem.innerHTML = text
    }
}



function decodeStrokesValues(strokesValuesMap) {
    const decodedRelDvalsMap = new Map()

    for ([groupId, v] of strokesValuesMap) {
        //console.log("v: ", v)
        // {group_colors: {…}, three_flags: Array(3), width_count: Map(1), encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}

        if (v.three_flags[1] === '0') {
            console.log("This group has encoded with 'bruteforce52-enc'")

        } else if (v.three_flags[1] === '1') {
            console.log("This group has encoded with 'bigint64-enc'")

            console.log("v: ", v)
            console.log("v.encoded_dvals: ", v.encoded_dvals) // H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w


            //splitedDvals = v.encoded_dvals.split('-') // [x1, y1, x2, y2]
            encodedDvalsStr = v.encoded_dvals // "x1 + y1 + x2 + y2"
            // Decode as bigint
            const decodedDvalsBigint = base64UrlDec(encodedDvalsStr)
            console.log("decodedDvalsBigint: ", decodedDvalsBigint)
            // 10407060807192524283017042226222223230000001520050…232224312626252321230005242225273122091720232710n

            // Convert to String
            const bigintAsStr = String(decodedDvalsBigint)
            console.log("bigintAsStr: ", bigintAsStr)

            // Recover the zero padding
            let originalZeroPaddedStr = ''

            // Get the number of result string length
            console.log("bigintAsStr.length: ", bigintAsStr.length) // 151

            // Number of chunks to split
            const numberOfChunks = Number(v.three_flags[2]) // 2

            // Get the length of original zero padded string
            const originalPaddedLength = findNearestMultipleOfFourX(bigintAsStr.length, numberOfChunks)
            console.log("originalPaddedLength: ", originalPaddedLength) // 152
            if (bigintAsStr.length === originalPaddedLength) {
                console.log('Not need to recover, Here is already original zero padded string.')
                originalZeroPaddedStr = bigintAsStr
            } else {
                const digitsToPadWithZero = originalPaddedLength - bigintAsStr.length
                console.log("digitsToPadWithZero: ", digitsToPadWithZero) // 1
                originalZeroPaddedStr = bigintAsStr.padStart(originalPaddedLength, '0')
            }
            // console.log("originalZeroPaddedStr: ", originalZeroPaddedStr)
            // 01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710

            // Split with 4 into each coordinates like x1, y1, x2, y2
            const splitedDvalsStrArr = splitStringIntoFour(originalZeroPaddedStr)
            // Split into chunks
            const chunkedDvalsStr = splitedDvalsStrArr.map(str => chunk(str, numberOfChunks))
            // console.log("chunkedDvalsStr: ", chunkedDvalsStr)
            // (4) [Array(19), Array(19), Array(19), Array(19)]
            //     0: (19) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23']
            //     1: (19) ['00', '00', '00', '15', '20', '05', '00', '00', '15', '00', '00', '28', '24', '00', '11', '16', '19', '22', '08']
            //     2: (19) ['01', '04', '06', '10', '08', '11', '24', '26', '24', '28', '30', '20', '08', '24', '23', '22', '24', '31', '26']
            //     3: (19) ['26', '25', '23', '21', '23', '00', '05', '24', '22', '25', '27', '31', '22', '09', '17', '20', '23', '27', '10']

            // Parse as Number
            const decodedAbsDvalsArr = chunkedDvalsStr.map(subArray => subArray.map(Number))
            // console.log("decodedAbsDvalsArr: ", decodedAbsDvalsArr)
            // (4) [Array(19), Array(19), Array(19), Array(19)]
            //     0: (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]
            //     1: (19) [0, 0, 0, 15, 20, 5, 0, 0, 15, 0, 0, 28, 24, 0, 11, 16, 19, 22, 8]
            //     2: (19) [1, 4, 6, 10, 8, 11, 24, 26, 24, 28, 30, 20, 8, 24, 23, 22, 24, 31, 26]
            //     3: (19) [26, 25, 23, 21, 23, 0, 5, 24, 22, 25, 27, 31, 22, 9, 17, 20, 23, 27, 10]length: 4[[Prototype]]: Array(0)


        } else if (v.three_flags[1] === '2') {
            console.log("This group has encoded with 'swap63-enc'")

            const dictMapToDec = generateSwap63DictToDec()
            // Map(63) { 0 → -31, 1 → -30, 2 → -29, 3 → -28, 4 → -27, 5 → -26, 6 → -25, 7 → -24, 8 → -23, 9 → -22, … }

            dividedDvals = divideStringEqually(v.encoded_dvals, 4)
            //console.log("dividedDvals: ", dividedDvals)
            // (4) ['wyyvtuDwtzxifJxuvun', 'v56nudvqm96wo9xuuuc', 'vvuzvzAwvvvyzxsvxDy', 'VUSByqATCUWytEBzzAx']

            const decodedRelDvals = dividedDvals.map(dval => decodeSwap63(dval, dictMapToDec))
            //console.log("decodedRelDvals: ", decodedRelDvals)
            // (4) [Array(19), Array(19), Array(19), Array(19)]

            decodedRelDvalsMap.set(
                groupId, {
                x1: decodedRelDvals[0],
                y1: decodedRelDvals[1],
                x2: decodedRelDvals[2],
                y2: decodedRelDvals[3],
            })
        }
    }

    return decodedRelDvalsMap
}