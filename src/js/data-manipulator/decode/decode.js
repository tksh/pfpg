// Decode from URL Params to SVG
decode()

function decode() {
    const urlParamsAsTwoMaps = readUrlParamsAsMaps()
    const artworkDataMap = urlParamsAsTwoMaps[0]
    const strokesValuesMap = urlParamsAsTwoMaps[1]

    console.log("artworkDataMap: ", artworkDataMap)
    // Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uint_n' => 5, 'bg_color' => '9999'}

    console.log("strokesValuesMap: ", strokesValuesMap)
    // Map(5) {1 => {…}, 2 => {…}, 3 => {…}, 4 => {…}, 5 => {…}}
    // key  : Group ID (seq num)
    // value: Object
    //            group_colors  : Object {g_stroke: '#000000', g_opacity: 1, g_stroke-opacity: 1}
    //            {three_flags  : Array(3)}
    //            {width_count  : Map(1)}
    //            {encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}


    const decodedRelDvalsMap = decodeStrokesValues(strokesValuesMap)
    console.log("decodedRelDvalsMap: ", decodedRelDvalsMap)

    generateSvg(artworkDataMap, strokesValuesMap, decodedRelDvalsMap)

}


function decodeStrokesValues(strokesValuesMap) {
    const decodedRelDvalsMap = new Map()

    for ([groupId, v] of strokesValuesMap) {
        //console.log("v: ", v)
        // {group_colors: {…}, three_flags: Array(3), width_count: Map(1), encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}

        if (v.three_flags[1] === '2') {
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

        } else if (v.three_flags[1] === '1') {
            console.log("This group has encoded with 'bigint64-enc'")



        } else if (v.three_flags[1] === '0') {
            console.log("This group has encoded with 'bruteforce52-enc'")
        }
    }

    return decodedRelDvalsMap
}