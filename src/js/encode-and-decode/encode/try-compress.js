import { flagsMap
       , resultInfo
       , encodingMethodAndConfig }     from 'constants'
import { getEncodedAttrsExceptsDvals } from 'encode/get-attrs-excepts-dvals'
import { URLCompressor }               from 'libs/url-comp-0-1-0/url-comp'


// Try compress, choose shorter, then add prefix to form:
//   [group_colors]=[encoding_method_flag][widths_and_counts]-[d_values]
//
//   1. Prepend the [encoded stroke-width values and counts] and [encoding method flag]
//        to the beginning of [encoded d values].
//   2. Compress the above combined string and choose the shorter one.
//   3. Prepend the [encoded group-colors value] to the chosen string.

export function tryCompress(encodedDval, encodingMethodName, encodingConfigValue) {
    const encodedWidthsAndCounts = getEncodedAttrsExceptsDvals().widthsAndCounts
    const encodedGroupColors     = getEncodedAttrsExceptsDvals().groupColors

    const compressedByGroups = new Map()

    // For storing result info
    let flagsArr = []
    let lengthBeforeComp = []
    let lengthAfterComp = []
    const groupCount = encodedDval.size
    const ampersandCount = groupCount - 1

    // To store info
    let compressingResultArr = []

    for (const [gId, dvalEncodedStr] of encodedDval) {
        // Merge to form: [2nd_flag_for_encoding_method][widths_and_counts]-[d_values]
        const charOf2ndFlag = flagsMap.get('2nd').get(encodingMethodName)
        const widthsAndCountsEncoded = encodedWidthsAndCounts.get(gId)
        const uncompressed = charOf2ndFlag + widthsAndCountsEncoded + '-' + dvalEncodedStr

        // Try compress with all compression methods,
        const { bestCompressedData, bestMethodName } = compressAndSelectBest(uncompressed)
        console.log(`In group ID ${gId}, best compression result made by: `, bestMethodName)

        // Prepend 1st flag to best result to form:
        //   [1st_flag_for_compression_method][2nd_flag_for_encoding_method][widths_and_counts]-[d_values]
        const charOf1stFlag = flagsMap.get('1st').get(bestMethodName)
        const encodedWidthAndDvalsAsValue   = charOf1stFlag + bestCompressedData

        // Prepend the color value as key to form: [key(group_colors)]=[value(width_and_dvals)]
        const encodedAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue)

        // Set it as value into Map with group ID key
        compressedByGroups.set(gId, encodedAsKvPair)


        // Info for console.log output
        flagsArr.push([charOf1stFlag, charOf2ndFlag])
        lengthBeforeComp.push(uncompressed.length + 1)
        lengthAfterComp.push(bestCompressedData.length + 1)

        // [group ID, length of uncompressed encoded lines data, length of best compression result of encoded lines data, name of best compression method]
        compressingResultArr.push([gId, uncompressed.length + 1, bestCompressedData.length + 1, bestMethodName])

        // Append the data to Map with group ID key like `bruteforce53_gId=0`
        const previousBaseXData = resultInfo.get(`${encodingMethodName} gId=${gId}`)
            ?? [['gId', `${encodingMethodAndConfig.get(encodingMethodName)}`, 'uncompressed', 'bestCompressed', 'bestMethodName']]
        const currentBaseXDataAdded = [...previousBaseXData, [gId, encodingConfigValue, uncompressed.length + 1, bestCompressedData.length + 1, bestMethodName]]
        resultInfo.set(`${encodingMethodName} gId=${gId}`, currentBaseXDataAdded)
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount)

    // Store result info
    resultInfo.set(`${encodingMethodName} Flags`, flagsArr)

    return { compressedByGroups, compressingResultArr }
}


function compressAndSelectBest(inputString) {
    // Methods list
    const compressionMethods = {
         'uncompressed': inputString,
        'URLCompressor': URLCompressor.compress(inputString)
    }

    // To store best method name and size
    let bestMethodName = 'uncompressed'
    let shortestSize = inputString.length

    // Find best result size and method name
    for (const [method, compressedData] of Object.entries(compressionMethods)) {

        console.log(`Method name: ${method} \t Result string length: ${compressedData.length}`)

        if (compressedData.length < shortestSize) {
            shortestSize = compressedData.length
            bestMethodName = method
        }
    }

    // Get best result string
    const bestCompressedData = compressionMethods[bestMethodName]

    return { bestCompressedData, bestMethodName }
}


function addColorAsKey(encodedColors, gId, shorterStrWithPrefix) {
    return `${encodedColors.get(gId)}=${shorterStrWithPrefix}`
}


// Calculate and compare the length of finished strings to output to console.

function calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount) {
    const totalLengthBefore = lengthBeforeComp.reduce((a, b) => a + b, ampersandCount)
    const totalLengthAfter = lengthAfterComp.reduce((a, b) => a + b, ampersandCount)
    console.log('Before compressed (Total encoded string length): ', totalLengthBefore)
    console.log('After compressed  (Total encoded string length): ', totalLengthAfter)
    console.log("Ratio (totalLengthAfter / totalLengthBefore): "   , totalLengthAfter / totalLengthBefore)
}
