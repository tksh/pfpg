import { hexExpandToTen }            from 'color-formatter/hex-expand'
import { getCanvasSize }             from 'decode/get-canvas-size'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'
import { decodeGroupColors }         from 'enc-and-dec/lines-data/group-colors/group-colors-dec'
import { decodeWidthAndCounts }      from 'enc-and-dec/lines-data/width-and-counts/width-and-counts-dec'
import { decodeDvals }               from 'decode/decode'

export
    { decodeUrlParams
    , getUrlParams
    }

function decodeUrlParams(isDataManipulatorPage) {
    // Get the url params from right source
    const params = getUrlParams(isDataManipulatorPage)

    if (params != null) {
        return decodeAsThreeData(params)
    } else {
        console.log('There is NO url params to decode.')
    }
}


// Retrieve URL parameters or fallback to alternative source

function getUrlParams(isDataManipulatorPage) {
    // Check url params exists
    const params = new URLSearchParams(window.location.search)
    // toString() returns an empty string for no parameters, otherwise a truthy value.
    const paramsExists = params.toString() !== '';

    // index.html has url params               => decode it
    // index.html has no url params            => decode the alternative text
    // data-manipulator.html has url params    => decode it
    // data-manipulator.html has no url params => do nothing
    if (paramsExists === true) {
        // At both index.html or data-manipulator.html
        console.log(`There is a url params to decode.`)
        return params

    } else if (isDataManipulatorPage === false) {
        console.log(`At index.html and there is no url params to decode, fetch the alternative text from the HTML element.`)
        const sampleArtworkEncodedStr = document.getElementById("sample-artwork-encoded-string").textContent
        return parseStrAsUrlParams(sampleArtworkEncodedStr)

    } else {
        console.log('At data-manipulator.html and there is no url params to decode, skipping processing.')
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





function decodeAsThreeData(urlSearchParams) {

    // Get Basic Data as Map from url params
    // e.g.: ?202404_001=31-fff&

    const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
    console.log('basicDataObj: ', basicDataObj)
    // e.g.:
    // {title: '202401_001', desc: 'Portrait of a woman'}
    // [[Prototype]]: Object


    // Get Lines Data as Map
    // ストローク情報の key, value を ループで取り出し

    // 除外するキーのリスト
    const excludeKeys = ['version', 'title', 'desc', 'metadata', 'colors'];

    // 結果を格納する配列（順序を保持するため）
    const linesDataKvArray = [];

    // URLパラメータをイテレート
    for (const [key, value] of urlSearchParams.entries()) {
        // 除外リストに含まれていないキーのみを処理
        if (!excludeKeys.includes(key)) {
            linesDataKvArray.push([key, value]);
        }
    }

    console.log("linesDataKvArray.length: ", linesDataKvArray.length)

    const linesDataMap = new Map()

    for (let i = 0; i < linesDataKvArray.length; ++i) {
        // `i` as a group ID (gId, "g_id") number.
        // First group (i = 0) represents canvas-base color and size,
        // After second group represents actual drawing strokes.

        console.log('linesDataKvArray[i]: ', linesDataKvArray[i])  // e.g.: (2) ['A', '013127b-NWrTPcKpRSjaX']
        console.log('linesDataKvArray[i][0]: ', linesDataKvArray[i][0])

        // Group-colors as Object
        const hex10Chars = hexExpandToTen(linesDataKvArray[i][0])    // e.g.: 000000ffff
        const decodedGroupColorsObj = decodeGroupColors(hex10Chars)  // Return as Object with three attrs
        // groupColors: {g_stroke: '#ffffff', g_opacity: 1, g_stroke_opacity: 1}

        // 3 chars flag as Array
        const decodedThreeFlagsArray = linesDataKvArray[i][1].slice(0, 3).split('')   // ['1', '2', 'n']
        // threeFlags: (3) ['1', '2', 'n']

        // Lines data encoded string
        //   stroke-width and coordinates data joined with '-' like:
        //   [encoded-width-data]-[encoded-coordinates-data]
        let linesData = linesDataKvArray[i][1].slice(3)
        //console.log("linesData(Before URLComp expand): ", linesData)
        // 3t-BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G

        if (Number(decodedThreeFlagsArray[0]) === 1) { // Decompress if URLCompressor applied
            linesData = URLCompressor.expand(linesData)
        }

        // Lines data decoded string
        console.log("linesData(After URLComp expand): ", linesData)

        // Extract the encoded width data ('stroke-width' values and counts)
        const encodedWidthAndCounts = linesData.split('-')[0]
        console.log("encodedWidthAndCounts: ", encodedWidthAndCounts)
        // e.g.: 3t

        // 'stroke-width' values and generated firstline and lastline indices as Map
        const decodedWidthAndCountsMap = decodeWidthAndCounts(encodedWidthAndCounts)
        console.log("decodedWidthAndCountsMap: ", decodedWidthAndCountsMap)
        // e.g.: Map(1) {3 => 19}

        // Coordinates data ('d' value) encoded
        // It has own structure by its encoding method (defined by second char of flag)
        const encodedDvalsStr = extractAfterFirstHyphen(linesData)
        console.log("encodedDvalsStr: ", encodedDvalsStr)
        // BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G

        // Set into Map by group ID, temporary to decode the d values.
        linesDataMap.set(
            i,
            {
                groupColors:    decodedGroupColorsObj,
                threeFlags:     decodedThreeFlagsArray,
                widthAndCounts: decodedWidthAndCountsMap,
                encodedDvals:   encodedDvalsStr
            }
        )

        // Decode the d values
        const decodedAbsAndRelDvals = decodeDvals(linesDataMap)
        const decodedRelDvalsObj = decodedAbsAndRelDvals.relative
        const decodedAbsDvalsObj = decodedAbsAndRelDvals.absolute

        // Set into Map by group ID, overwrite to return.
        linesDataMap.set(
            i,
            {
                groupColors:    decodedGroupColorsObj,
                threeFlags:     decodedThreeFlagsArray,
                widthAndCounts: decodedWidthAndCountsMap,
                encodedDvals:   encodedDvalsStr,
                relDvalsObj:    decodedRelDvalsObj,
                absDvalsObj:    decodedAbsDvalsObj
            }
        )

    }
    // Decode the data about canvas size from [0]-indexed (group ID = 0) lines group
    const sizeDataObj = getCanvasSize(linesDataMap.get(0))

    return { basicData: basicDataObj, linesData: linesDataMap, sizeData: sizeDataObj }
}


function extractAfterFirstHyphen(str) {
    // ハイフンの位置を取得
    const indexOfHyphen = str.indexOf("-");
    // ハイフンの次の位置から末尾までを切り出す
    return str.slice(indexOfHyphen + 1);
}
