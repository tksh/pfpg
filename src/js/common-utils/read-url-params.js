import { hexExpandToTen }           from 'color-formatter/hex-expand'
import { getBasicDataFromUrlParam } from 'enc-and-dec/basic-data/basic-data-dec'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'
import { decodeGroupColors }        from 'enc-and-dec/lines-data/group-colors/group-colors-dec'
import { decodeWidthAndCounts }     from 'enc-and-dec/lines-data/width-and-counts/width-and-counts-dec'
import { isNonEmpty }              from 'common-utils/is-non-empty'

export
    { readUrlParamsAsMaps
    , getUrlParams
    }

function readUrlParamsAsMaps(isDataManipulatorPage) {
    // Get the url params from right source
    const params = getUrlParams(isDataManipulatorPage)

    if (params != null) {
        return decodeAsTwoMaps(paramsArray)
    } else {
        console.log('There is NO url params to decode.')
    }
}


// Get the url params from right source

function getUrlParams(isDataManipulatorPage) {
    let paramsExists = isNonEmpty(URLSearchParams(window.location.search))

    // If at index.html and there is no url params => get sample strings from textContent element
    if (paramsExists === true) {
        // At both index.html or data-manipulator.html,
        // Decode the url params if it exists.
        return new URLSearchParams(window.location.search);

    } else if (isDataManipulatorPage === false) {
        // At index.html and if there is No url params,
        // Get the encoded string from '<script type="text/plain"> tag
        const sampleArtworkEncodedStr = document.getElementById("sample-artwork-encoded-string").textContent
        return parseStrAsUrlParams(sampleArtworkEncodedStr)

    } else {
        // At data-manipulator.html and if there is No url params,
        // Do nothing.
        return null
    }
}



// Parse the string of KV pairs array to url params structure

function parseStrAsUrlParams(str) {
    // Split as array
    const deleteQuestion = tryDeleteQuestionAtStart(str.trim())
    const splitByAmpersand = deleteQuestion.split('&')
    const splitByEqual = splitByAmpersand.map(entry => entry.split('='))

    // Set into Map object to keep order of elements
    const map = new Map();
    splitByEqual.forEach(([key, value]) => {
        map.set(key, value);
    });

    return new URLSearchParams(map)
}

function tryDeleteQuestionAtStart(str) {
    // 文字列の先頭が?ならば削除する
    if (str.startsWith("?")) {
        // 先頭の1文字を除いた文字列を取得する
        return str.slice(1);
    } else {
        return str
    }
}

// // test
// const params_like_str = "?title=202401_001&desc=~2J6DBxK74JRDIQ5EfH43&A=013127b-NWrTPcKpRSjaX&0=0135n3ap2bI1fR"
// console.log(parseStrAsUrlParams(params_like_str))
// // URLSearchParams(4) { title → "202401_001", desc → "~2J6DBxK74JRDIQ5EfH43", A → "013127b-NWrTPcKpRSjaX", 0 → "0135n3ap2bI1fR" }
// console.log(typeof(parseStrAsUrlParams(params_like_str)))
// // object





function decodeAsTwoMaps(paramsArray) {
    console.log('paramsArray.length: ', paramsArray.length) // 6

    // Get Basic Data as Map from url params
    // e.g.: ?202404_001=31-fff&

    const basicDataMap = getBasicDataFromUrlParams(paramsArray)
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
