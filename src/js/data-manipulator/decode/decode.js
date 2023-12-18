// Decode from URL Params to SVG
decode()

function decode() {
    const urlParamsAsTwoMaps = readUrlParamsAsMaps()
    const artworkDataMap = urlParamsAsTwoMaps[0]
    const strokesValuesMap = urlParamsAsTwoMaps[1]

    console.log("artworkDataMap: ", artworkDataMap)
    // Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uint_n' => 5, 'bg_color' => '9999'}

    console.log("strokesValuesMap: ", strokesValuesMap)
    // Map(5) {1 => Array(4), 2 => Array(4), 3 => Array(4), 4 => Array(4), 5 => Array(4)}

    // value: Array(4)
    //     0: group_colors: {g_stroke: '#000000', g_opacity: 1, g_stroke-opacity: 1}
    //        [[Prototype]]: Object
    //     1: {three_flags: Array(3)}
    //     2: {width_count: Map(1)}
    //     3: {encoded_dvals: 'wyyvtuDwtzxifJxuvunv56nudvqm96wo9xuuucvvuzvzAwvvvyzxsvxDyVUSByqATCUWytEBzzAx'}
}
