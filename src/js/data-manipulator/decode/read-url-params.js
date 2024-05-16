function readUrlParamsAsMaps(isDataManipulatorOrIndexBool) {
    // URLSearchParamsオブジェクトを作成
    const params = new URLSearchParams(window.location.search);
    console.log('params: ', params) // URLSearchParams {size: 6}

    if (params != 0) { // Decode if URL Params exists

        const paramsArray = [...params.entries()]; // entries()メソッドでキーと値のペアを取得
        return decodeAsTwoMaps(paramsArray)

    } else {
        // No URL params in index.html
        // Decode the string that stored in index.html for sample
        if (isDataManipulatorOrIndexBool === false) {
            const sampleArtworkEncodedStr = document.getElementById("sample-artwork-encoded-string").textContent
            const paramsArray = parseStrAsUrlParams(sampleArtworkEncodedStr)
            return decodeAsTwoMaps(paramsArray)

        } else {
            // No URL params in data-manipulator.html
            // Do nothing
            return null
        }
    }
}

function decodeAsTwoMaps(paramsArray) {
    console.log('paramsArray.length: ', paramsArray.length) // 6

    // Get Basic Data as Map
    // e.g.: ?202308_001=31x31-9999&
    const basicDataMap = new Map()

    const artworkParam = paramsArray[0]
    console.log("artworkParam: ", artworkParam) // Error (2) ["\n        '?202308_001", '31x31-9999']
    // (2) ['202308_001', '31x31-9999']
    // [[Prototype]]: Array(0)

    // Artwork ID
    const artworkId = artworkParam[0]              // 202308_001

    // Size
    const gridSize = artworkParam[1].split("-")[0] // 31x31
    const splitByX = gridSize.split('x')           // (2) ['31', '31']
    const max = Math.max(...splitByX)              // 255
    const uintN = getUintN(max)                    // 5 (2 の 何乗か？)

    // Base color
    const bgColor = artworkParam[1].split("-")[1]  // 9999


    // Set into Map
    basicDataMap.set("artwork_id", artworkId)  // String
    basicDataMap.set("grid_size", gridSize)    // String
    basicDataMap.set("uintN", uintN)          // Number
    basicDataMap.set("bg_color", bgColor)      // String

    console.log('basicDataMap: ', basicDataMap)
    // Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uintN' => 5, 'bg_color' => '9999'}



    // Get Lines Data as Map
    // 2番目([1])以降のストローク情報の key, value を ループで取り出し

    const strokesValuesMap = new Map()
    // key = groupId (seq num)
    // value = Object[
    //                "group_colors"  => {
    //                                 "g_stroke"         => "#000" <String>,
    //                                 "g_opacity"        => 1 <Number>,
    //                                 "g_stroke-opacity" => 1 <Number>
    //                                },
    //                three_flags   => [Three Chars Array],
    //                width_count   => {
    //                                 "list_of_stroke_width" <Number> => "count_by_stroke_width" <Number> ...,
    //                                },
    //                encoded_dvals => "Encoded_Strings" <String>
    //               ]

    for (let i = 1; i <= paramsArray.length - 1; ++i) { // `1` is first stroke color group

        console.log('paramsArray[i]: ', paramsArray[i])

        // Group-Colors as Object
        const hex10Chars = hexExpandTo10(paramsArray[i][0])         // 000000ffff
        const decodedColorsObj = decodeColors(hex10Chars) // Return as Object with 3 elements
        // group_colors: {g_stroke: '#ffffff', g_opacity: 1, g_stroke-opacity: 1}

        // 3 Flags as Array
        const splittedThreeFlags = paramsArray[i][1].slice(0, 3).split('')   // ['1', '2', 'n']
        // three_flags: (3) ['1', '2', 'n']

        // Width-and-Counts as Map
        let strokesValues = paramsArray[i][1].slice(3)
        //console.log("strokesValues(Before URLComp expand): ", strokesValues)
        // 3t-BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G

        if (Number(splittedThreeFlags[0]) === 1) { // Decomp if URLCompressor applied
            strokesValues = URLCompressor.expand(strokesValues)
        }

        console.log("strokesValues(After URLComp expand): ", strokesValues)

        const encodedWidthAndCounts = strokesValues.split('-')[0]
        console.log("encodedWidthAndCounts: ", encodedWidthAndCounts) // 3t

        // Decode the count and width, and generate the firstline and lastline
        const decodedWidthCount = decodeWidthCountAsObj(encodedWidthAndCounts)
        // width_count: Map(1) {3 => 19}

        // Get the lines data
        // Extract an encoded string of whole d values
        // Not split into x1, y1, x2, y2
        const encodedDvalsStr = extractAfterFirstHyphen(strokesValues)
        console.log("encodedDvalsStr: ", encodedDvalsStr)
        // BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G



        // Set into Map by group ID
        strokesValuesMap.set(i, {
            group_colors: decodedColorsObj,
            three_flags: splittedThreeFlags,
            width_count: decodedWidthCount,
            encoded_dvals: encodedDvalsStr
        })
    }
    return {artwork_data:basicDataMap, strokes_values:strokesValuesMap}

}