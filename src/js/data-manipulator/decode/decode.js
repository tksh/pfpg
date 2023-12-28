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
    //console.log("decodedRelDvalsMap: ", decodedRelDvalsMap)
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
        // console.log("v.encoded_dvals: ", v.encoded_dvals) // "x1 + y1 + x2 + y2"
        // H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w

        let decodedRelDvals = []

        if (v.three_flags[1] === '0') {
            console.log(`Group ${groupId} has encoded with 'bruteforce52-enc'`)
            //console.log("v.encoded_dvals: ", v.encoded_dvals) // ok
            decodedRelDvals = decodeBruteforce52Enc(v.encoded_dvals, v.three_flags)

        } else if (v.three_flags[1] === '1') {
            console.log("This group has encoded with 'bigint64-enc'")
            decodedRelDvals = decodeBigint64Enc(v.encoded_dvals)

        } else if (v.three_flags[1] === '2') {
            console.log("This group has encoded with 'swap63-enc'")
            decodedRelDvals = decodeSwap63Enc(v.encoded_dvals)

        } else {
            console.log('Error! This group has unknown flag for encoding method.')
        }

        // Set into Map
        decodedRelDvalsMap.set(
            groupId, {
            x1: decodedRelDvals[0],
            y1: decodedRelDvals[1],
            x2: decodedRelDvals[2],
            y2: decodedRelDvals[3],
        })

    }

    return decodedRelDvalsMap
}