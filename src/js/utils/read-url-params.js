export
    { readUrlParamsAsMaps
    , getUrlParams
    }

function readUrlParamsAsMaps(isDataManipulatorPage) {
    // URLSearchParamsオブジェクトを作成
    const params = new URLSearchParams(window.location.search);
    console.log('params: ', params) // URLSearchParams {size: 6}

    // Get the URL params from right source
    const paramsArray = getUrlParams(params, isDataManipulatorPage)

    if (paramsArray != null) {
        return decodeAsTwoMaps(paramsArray)
    } else {
        console.log('There is NO url params to decode.')
    }
}


// Get the URL params from right source

function getUrlParams(params, isDataManipulatorPage) {
    // If at index.html and there is no URL Params => get sample strings from textContent element
    if (params != 0) {
        // At both index.html or data-manipulator.html,
        // Decode if URL Params exists.

        const paramsArray = [...params.entries()]; // entries()メソッドでキーと値のペアを取得
        return paramsArray

    } else if (isDataManipulatorPage === false) {
        // At index.html and if there is No URL Params,
        // Get the encoded string from '<script type="text/plain"> with id.

        const sampleArtworkEncodedStr = document.getElementById("sample-artwork-encoded-string").textContent
        const paramsArray = parseStrAsUrlParams(sampleArtworkEncodedStr)
        return paramsArray

    } else {
        // At data-manipulator.html and if there is No URL Params,
        // Do nothing.
        return null
    }
}



// Parse the string into array of KV pairs array like decoding from URL params

function parseStrAsUrlParams(str) {
    console.log("str: ", str)
    const deleteQustion = deleteQustionAtStartIfExists(str.trim())
    const splitByAmpersand = deleteQustion.split('&')
    console.log("splitByAmpersand: ", splitByAmpersand)
    const splitByEqual = splitByAmpersand.map(entry => entry.split('='))
    return splitByEqual
}

function deleteQustionAtStartIfExists(str) {
    // 文字列の先頭が?ならば削除する
    if (str.startsWith("?")) {
        // 先頭の1文字を除いた文字列を取得する
        return str.slice(1);
    } else {
        return str
    }
}


function decodeAsTwoMaps(paramsArray) {
    console.log('paramsArray.length: ', paramsArray.length) // 6

    // Get Basic Data as Map from URL Params
    // e.g.: ?202404_001=31-fff&

    const basicDataMap = getBasicDataFromUrlParam(paramsArray)
    console.log('basicDataMap: ', basicDataMap)
    // Map(4) { title → "202404_001", viewbox → "0 0 31 31", uintN → 5, rectFill → "fff" }


    // Get Lines Data as Map
    // 2番目([1])以降のストローク情報の key, value を ループで取り出し

    const linesDataMap = new Map()
    // key = gId (seq num)
    // value = Object[
    //                "groupColors"  => {
    //                                 "g_stroke"         => "#000" <String>,
    //                                 "g_opacity"        => 1 <Number>,
    //                                 "g_stroke_opacity" => 1 <Number>
    //                                },
    //                threeFlags   => [Three Chars Array],
    //                widthAndCounts   => {
    //                                 "list_of_stroke_width" <Number> => "count_by_stroke_width" <Number> ...,
    //                                },
    //                encodedDvals => "Encoded_Strings" <String>
    //               ]

    for (let i = 1; i <= paramsArray.length - 1; ++i) { // `1` is first lines-group

        console.log('paramsArray[i]: ', paramsArray[i])

        // Group-Colors as Object
        const hex10Chars = hexExpandToTen(paramsArray[i][0])        // 000000ffff
        const decodedGroupColorsObj = decodeGroupColors(hex10Chars) // Return as Object with 3 elements
        // groupColors: {g_stroke: '#ffffff', g_opacity: 1, g_stroke_opacity: 1}

        // 3 Flags as Array
        const splittedThreeFlags = paramsArray[i][1].slice(0, 3).split('')   // ['1', '2', 'n']
        // threeFlags: (3) ['1', '2', 'n']

        // Width-and-Counts as Map
        let linesData = paramsArray[i][1].slice(3)
        //console.log("linesData(Before URLComp expand): ", linesData)
        // 3t-BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G

        if (Number(splittedThreeFlags[0]) === 1) { // Decompress if URLCompressor applied
            linesData = URLCompressor.expand(linesData)
        }

        console.log("linesData(After URLComp expand): ", linesData)

        const encodedWidthAndCounts = linesData.split('-')[0]
        console.log("encodedWidthAndCounts: ", encodedWidthAndCounts) // 3t

        // Decode the count and width, and generate the firstline and lastline
        const decodedWidthAndCounts = decodeWidthAndCounts(encodedWidthAndCounts)
        // widthAndCounts: Map(1) {3 => 19}

        // Get the lines data
        // Extract an encoded string of whole d values
        // Not split into x1, y1, x2, y2
        const encodedDvalsStr = extractAfterFirstHyphen(linesData)
        console.log("encodedDvalsStr: ", encodedDvalsStr)
        // BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G



        // Set into Map by group ID
        linesDataMap.set(i, {
            groupColors: decodedGroupColorsObj,
            threeFlags: splittedThreeFlags,
            widthAndCounts: decodedWidthAndCounts,
            encodedDvals: encodedDvalsStr
        })
    }

    return {basicData:basicDataMap, linesData:linesDataMap}

}




function extractAfterFirstHyphen(str) {
    // ハイフンの位置を取得
    const index = str.indexOf("-");
    console.log("index: ", index)
    // ハイフンの次の位置から末尾までを切り出す
    const result = str.slice(index + 1);

    return result
}
