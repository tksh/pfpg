import { hexExpandToTen }            from 'color-formatter/hex-expand'
import { decodeDvals }               from 'decode/decode'
import { sizeDataDec }               from 'decode/size-data-dec'
import { tryDecompress }             from 'decode/try-decompress'
import { getBasicDataFromUrlParams } from 'enc-and-dec/basic-data/basic-data-dec'
import { decodeGroupColors }         from 'enc-and-dec/lines-data/group-colors/group-colors-dec'
import { decodeWidthsAndCounts }     from 'enc-and-dec/lines-data/widths-and-counts/widths-and-counts-dec'
import { stateList }                 from 'state/state-as-map-obj'

import { BASIC_DATA_KEYS } from 'constants'

export
    { decodeUrlParams
    , getUrlParamsExceptsStates
    }


// Get the url params

function decodeUrlParams() {

    const urlParams = getUrlParamsExceptsStates()
    const urlParamsExists = urlParams.toString() !== ''

    if (urlParamsExists) {
        return decodeAsThreeData(urlParams)
    } else {
        console.log('There is NO url params to decode.')
    }
}

// function getUrlParamsExceptsStates() {
//     return new URLSearchParams(window.location.search)
// }

function getUrlParamsExceptsStates() {
    const urlParams = new URLSearchParams(window.location.search)
    const stateKeys = Array.from(stateList.keys())
    console.log('stateKeys to exclude: ', stateKeys)

    // stateキーのリストを作成
    const filteredParams = new Map([...urlParams.entries()].filter(([key]) => !stateKeys.includes(key)))

    return filteredParams
}


// Decode the url params as two Obj and one Map
//   return { basicData: basicDataObj, linesData: linesDataMap, sizeData: sizeDataObj }

function decodeAsThreeData(urlSearchParams) {

    // Get Basic Data as Map from url params
    // e.g.: ?title=~202401_001&desc=001kObPFhaNkBHUZJE0kMCGBFCDo8j7lBr_44z9CIqW3Ba7eLr9kVIlASMdS4&metadata=01p0oU...

    const basicDataObj = getBasicDataFromUrlParams(urlSearchParams)
    console.log('urlSearchParams: ', urlSearchParams)

    console.log('basicDataObj: ', basicDataObj)
    // e.g.:
    // {title: '202401_001',
    //  desc: 'A portrait of a woman based on an image from the Unsplash website',
    //  metadata: '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-r…   </rdf:Description>\n    </dc:source>\n</rdf:RDF>'
    // }


    // Get the Lines Data as Map
    // ストローク情報の key, value を ループで取り出し

    // 結果を格納する配列（順序を保持するため）
    const linesDataKvArray = []

    // URLパラメータをイテレート
    for (const [key, value] of urlSearchParams.entries()) {
        // 除外リストに含まれていないキーのみを処理
        if (!BASIC_DATA_KEYS.includes(key)) {
            linesDataKvArray.push([key, value])
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
        // groupColors: {g_stroke: '#ffffff', gOpacity: 1, gStrokeOpacity: 1}

        // Decode the Lines data string
        // Structure: [1st flag][2nd flag][width(stroke-width values and counts)]-[d values]

        // See 1st char, and decompress the string of 2nd char to end
        // Skip decompress if 1st char is '~'
        const linesData = tryDecompress(linesDataKvArray[i][1])

        // Get the char for encoding method flags
        const decodedEncodingMethodFlagChar = linesData[0]


        // Extract the width related values encoded ('stroke-width' values and counts)
        const encodedWidthsAndCounts = extractBeforeFirstHyphen(linesData.slice(1))

        // Decode the width width related values
        // 'stroke-width' values and generated firstline and lastline indices as Map
        const decodedWidthsAndCountsMap = decodeWidthsAndCounts(encodedWidthsAndCounts)
        console.log("decodedWidthsAndCountsMap: ", decodedWidthsAndCountsMap)
        // e.g.: Map(1) {3 => 19}


        // Coordinates data (d value) encoded
        // It has own structure by its encoding method (defined by second char of flag)
        const encodedDvalsStr = extractAfterFirstHyphen(linesData)
        console.log("encodedDvalsStr: ", encodedDvalsStr)
        // BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G

        // Set into Map by group ID, temporary to decode the d values.
        linesDataMap.set(
            i,
            {
                groupColors:        decodedGroupColorsObj,
                encodingMethodFlag: decodedEncodingMethodFlagChar,
                widthsAndCounts:     decodedWidthsAndCountsMap,
                encodedDvals:       encodedDvalsStr
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
                groupColors:        decodedGroupColorsObj,
                encodingMethodFlag: decodedEncodingMethodFlagChar,
                widthsAndCounts:     decodedWidthsAndCountsMap,
                encodedDvals:       encodedDvalsStr,
                relDvalsObj:        decodedRelDvalsObj,
                absDvalsObj:        decodedAbsDvalsObj
            }
        )

    }
    // Decode the data about canvas size from [0]-indexed (group ID = 0) lines group
    const sizeDataObj = sizeDataDec(linesDataMap.get(0))

    return { basicData: basicDataObj, linesData: linesDataMap, sizeData: sizeDataObj }
}


function extractBeforeFirstHyphen(str) {
    // ハイフンの位置を取得
    const indexOfHyphen = str.indexOf("-")
    // 文字列の先頭から ハイフンの直前まで を切り出す
    return str.slice(0, indexOfHyphen)
}

function extractAfterFirstHyphen(str) {
    // ハイフンの位置を取得
    const indexOfHyphen = str.indexOf("-")
    // ハイフンの直後から 末尾まで を切り出す
    return str.slice(indexOfHyphen + 1)
}
