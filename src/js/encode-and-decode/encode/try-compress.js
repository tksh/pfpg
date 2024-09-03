import { flagsMap, resultInfo } from 'constants'

export function tryCompress(encodedDval, encodedAttrsExceptsDvals, encodingMethodName) {
    const encodedWidthAndCounts = encodedAttrsExceptsDvals.widthAndCounts
    const encodedGroupColors    = encodedAttrsExceptsDvals.groupColors

    const compressedByGroup = new Map()

    // For storing result info
    let flagsArr = []
    let lengthBeforeComp = []                 // comment
    let lengthAfterComp = []
    const groupCount = encodedDval.size
    const ampersandCount = groupCount - 1

    // To store info
    let compressingResultArr = []

    for (const [gId, dvalEncodedStr] of encodedDval) {
        // Merge the width, dvals and flags to form: [2nd flag][width(stroke-width values and counts)]-[d values]
        const charOf2ndFlag = flagsMap.get('2nd').get(encodingMethodName)
        const widthAndCountsEncoded = encodedWidthAndCounts.get(gId)
        const uncompressed = charOf2ndFlag + widthAndCountsEncoded + '-' + dvalEncodedStr

        // Try compress with all compression methods,
        // And add 1st flag into best result.
        const { bestCompressedData, bestMethodName } = compressAndSelectBest(uncompressed)
        console.log(`In group ID ${gId}, best compression result made by: `, bestMethodName)
        const charOf1stFlag = flagsMap.get('1st').get(bestMethodName)
        const encodedWidthAndDvalsAsValue   = charOf1stFlag + bestCompressedData

        // Prepend the color value to form: [key(group colors)]=[value(width and dvals)]
        const encodedAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue)

        compressedByGroup.set(gId, encodedAsKvPair)

        // Info for console.log output
        flagsArr.push([charOf1stFlag, charOf2ndFlag])
        lengthBeforeComp.push(uncompressed.length + 1)
        lengthAfterComp.push(bestCompressedData.length + 1)

        // [length-of-uncompressed, length-of-best-result, name-of-best-method
        compressingResultArr.push([uncompressed.length + 1, bestCompressedData.length + 1, bestMethodName])
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeComp, lengthAfterComp, ampersandCount)

    // Store result info
    const flags = new Map()
    flags.set('flags', flagsArr)
    resultInfo.set(encodingMethodName, flags)

    // Set result info with 'bruteforce53-analytics--...'
    // the relations of each baseX numbers and result string length
//    const resultByGroup = createMapFromNestedArrays(compressingResultArr)
//    resultInfo.set('bruteforce53-analytics--group_id-base_x_number-encoded_lines_data_length-best_compressed_length-comp_method_name', resultByGroup)


    return { compressedByGroup, compressingResultArr }
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
