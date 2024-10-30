import { compressToEncodedURIComponent } from 'common-utils/compression-stream'
import { FLAGS_MAP
       , ENCODING_METHOD_AND_CONFIG_MAP} from 'constants'
import { getEncodedAttrsExceptsDvals }   from 'encode/get-attrs-excepts-dvals'
import { URLCompressor }                 from 'libs/url-comp-0-1-0/url-comp'
import { resultInfo }                    from 'state/result-info'


// Try compress, choose shorter, then add prefix to form:
//   [group_colors]=[encoding_method_flag][widths_and_counts]-[d_values]
//
//   1. Prepend the [encoded stroke-width values and counts] and [encoding method flag]
//        to the beginning of [encoded d values].
//   2. Compress the above combined string and choose the shorter one.
//   3. Prepend the [encoded group-colors value] to the chosen string.

export async function tryCompress(encodedDval, encodingMethodName, encodingConfigValue) {
    const encodedWidthsAndCounts = getEncodedAttrsExceptsDvals().widthsAndCounts
    const encodedGroupColors     = getEncodedAttrsExceptsDvals().groupColors

    const compressedByGroups = new Map()

    // For storing results for logging
    let flagsArr = []
    let lengthBeforeComp = []
    let lengthAfterComp = []
    const groupCount = encodedDval.size
    const ampersandCount = groupCount - 1

    // For storing results for processing
    let compressingResultArr = []

    for (const [gId, dvalEncodedStr] of encodedDval) {
        // Merge to form: [2nd_flag_for_encoding_method][widths_and_counts]-[d_values]
        const charOf2ndFlag = FLAGS_MAP.get('2nd').get(encodingMethodName)
        const widthsAndCountsEncoded = encodedWidthsAndCounts.get(gId)
        const uncompressed = charOf2ndFlag + widthsAndCountsEncoded + '-' + dvalEncodedStr

        // Try compress with all compression methods,
        const { bestCompressedData, bestCompMethodName } = await compressAndSelectBest(uncompressed)
        console.log(`group ID ${gId} (method: ${encodingMethodName}, config: ${encodingConfigValue}), best compression result ${bestCompressedData.length} made by: `, bestCompMethodName)

        // Prepend 1st flag to best result to form:
        //   [1st_flag_for_compression_method][2nd_flag_for_encoding_method][widths_and_counts]-[d_values]
        const charOf1stFlag = FLAGS_MAP.get('1st').get(bestCompMethodName)
        const encodedWidthAndDvalsAsValue   = charOf1stFlag + bestCompressedData

        // Prepend the color value as key to form: [key(group_colors)]=[value(width_and_dvals)]
        const encodedAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue)

        // Set it as value into Map with group ID key
        compressedByGroups.set(gId, encodedAsKvPair)


        // Store results for logging

        flagsArr.push([charOf1stFlag, charOf2ndFlag])
        lengthBeforeComp.push(uncompressed.length + 1)
        lengthAfterComp.push(bestCompressedData.length + 1)

        // [group ID, length of uncompressed encoded lines data, length of best compression result of encoded lines data, name of best compression method]
        compressingResultArr.push([gId, uncompressed.length + 1, bestCompressedData.length + 1, bestCompMethodName])

        // Append the data to Map with group ID key like `bruteforce53_gId=0`
        const previousBaseXData = resultInfo.get(`${encodingMethodName} gId=${gId}`)
            ?? [['gId', `${ENCODING_METHOD_AND_CONFIG_MAP.get(encodingMethodName)}`, 'uncompressed', 'bestCompressed', 'bestCompMethodName']]
        const currentBaseXDataAdded = [...previousBaseXData, [gId, encodingConfigValue, uncompressed.length + 1, bestCompressedData.length + 1, bestCompMethodName]]
        resultInfo.set(`${encodingMethodName} gId=${gId}`, currentBaseXDataAdded)
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount)

    // Store results for logging
    resultInfo.set(`${encodingMethodName} Flags`, flagsArr)

    return { compressedByGroups, compressingResultArr }
}


async function compressAndSelectBest(inputString) {

    // Methods names and functions list
    const compressionMethods = {
        'uncompressed' : async () => inputString,
        'URLCompressor': async () => URLCompressor.compress(inputString),
        'deflateRaw'   : async () => compressToEncodedURIComponent(inputString, 'deflate-raw')
    }

    // Execute all compression methods concurrently
    const results = await Promise.all(
        Object.entries(compressionMethods).map(async ([method, compressFunc]) => {
            const compressedData = await compressFunc()
            return { method, compressedData, length: compressedData.length }
        })
    )

    // Find best result size and method name
    let bestResult = results[0] // Start with the first result
    for (const result of results) {
        console.log(`Method name: ${result.method} \t Result string length: ${result.length}`)
        if (result.length < bestResult.length) {
            bestResult = result
        }
    }

    return {
        bestCompressedData: bestResult.compressedData,
        bestCompMethodName: bestResult.method
    }
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
