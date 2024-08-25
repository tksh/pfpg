import { flagsMap } from 'constants'


export function tryCompress(encodedDval, encodedAttrsExceptsDvals, encodingMethodName, charOf3rdFlag) {
    const encodedWidthAndCounts = encodedAttrsExceptsDvals.widthAndCounts
    const encodedGroupColors    = encodedAttrsExceptsDvals.groupColors

    const wholeGroupValues = new Map();
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];
    const groupCount = encodedDval.size;
    const ampersandCount = groupCount - 1;

    for (const [gId, dvalEncodedStr] of encodedDval) {
        // Merge the width, dvals and flags like: [2nd flag][2nd flag][width(stroke-width values and counts)]-[d values]
        const charOf2ndFlag = flagsMap.get('2nd').get(encodingMethodName)
        const widthAndCountsEncoded = encodedWidthAndCounts.get(gId);
        const uncompressed = charOf2ndFlag + charOf3rdFlag + widthAndCountsEncoded + '-' + dvalEncodedStr;

        // Try compress with all compression methods, and add 1st flag into best result.
        const { bestCompressedData, bestMethodName } = compressAndSelectBest(uncompressed);
        console.log(`In group ID ${gId}, best compression result made by: `, bestMethodName)
        const encodedWidthAndDvalsAsValue   = add1stFlag(bestCompressedData, bestMethodName);

        // Prepend the color value like: [key(group colors)]=[value(width and dvals)]
        const valueAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue);

        wholeGroupValues.set(gId, valueAsKvPair);

        lengthBeforeURLComp.push(uncompressed.length + 1);  // `+ 1` means 1st char length
        lengthAfterURLComp.push(bestCompressedData.length + 1);
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount);

    return wholeGroupValues;
}


function compressAndSelectBest(inputString) {
    // Methods list
    const compressionMethods = {
         'uncompressed': inputString,
        'URLCompressor': URLCompressor.compress(inputString)
    };

    // To store best method name and size
    let bestMethodName = 'uncompressed';
    let smallestSize = inputString.length;

    // Find best result size and method name
    for (const [method, compressedData] of Object.entries(compressionMethods)) {

        console.log(`Method name: ${method} \t Result string length: ${compressedData.length}`)

        if (compressedData.length < smallestSize) {
            smallestSize = compressedData.length;
            bestMethodName = method;
        }
    }

    // Get best result string
    const bestCompressedData = compressionMethods[bestMethodName];

    return { bestCompressedData, bestMethodName };
}

function add1stFlag(bestCompressedData, bestMethodName) {
    return flagsMap.get('1st').get(bestMethodName) + bestCompressedData
}

function addColorAsKey(encodedColors, gId, shorterStrWithPrefix) {
    return `${encodedColors.get(gId)}=${shorterStrWithPrefix}`;
}


// Calculate and compare the length of finished strings to output to console.

function calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount) {
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, ampersandCount);
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, ampersandCount);
    console.log('Before compressed (Total encoded string length): ', totalLengthBefore);
    console.log('After compressed  (Total encoded string length): ', totalLengthAfter);
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore);
}
