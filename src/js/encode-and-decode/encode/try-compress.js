import { flagsMap }            from 'constants'


export function tryCompress(encodedDval, encodedAttrsExceptsDvals, encodingMethodName, charOf3rdFlag) {
    const encodedWidthAndCounts = encodedAttrsExceptsDvals.widthAndCounts
    const encodedGroupColors    = encodedAttrsExceptsDvals.groupColors

    const wholeGroupValues = new Map();
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];
    const groupCount = encodedDval.size;
    const ampersandCount = groupCount - 1;

    for (const [gId, dvalEncodedStr] of encodedDval) {
        const charOf2ndFlag = flagsMap.get('2nd').get(encodingMethodName)
        const widthAndCountsEncoded = encodedWidthAndCounts.get(gId);
        const uncompressed = charOf2ndFlag + charOf3rdFlag + widthAndCountsEncoded + '-' + dvalEncodedStr;

        const {compressed, shouldApply} = compressAndCompare(uncompressed, gId);

        const encodedWidthAndDvalsAsValue   = add1stFlagToShorter(shouldApply, compressed, uncompressed);

        // [Key(group-colors)]=[Value(width-and-dvals)]
        const valueAsKvPair = addColorAsKey(encodedGroupColors, gId, encodedWidthAndDvalsAsValue);

        wholeGroupValues.set(gId, valueAsKvPair);

        lengthBeforeURLComp.push(uncompressed.length + 1);  // `+ 1` means 1st char length
        lengthAfterURLComp.push(compressed.length + 1);
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount);

    return wholeGroupValues;
}


function compressAndCompare(uncompressed, gId) {
    // Compress and compare
    const compressed = URLCompressor.compress(uncompressed);
    const shouldApply = compressed.length < uncompressed.length

    // Output the result details
    if (shouldApply === true) {
        // before の方が長い場合 = URLCompressor が効果的である場合
        console.log(`URLCompressor is effective for group #${gId}, so should be applied it:`, uncompressed.length, '=>', compressed.length)
    } else {
        // before の方が短いか 同じ 場合 = URLCompressor が効果的ではない場合
        console.log(`URLCompressor is not effective for group #${gId}, so should be passed it:`, uncompressed.length, '=>', compressed.length)
    }

    return {compressed, shouldApply};
}

function add1stFlagToShorter(shouldApply, compressed, uncompressed) {
    if (shouldApply === true) {  // Compression applied
        return flagsMap.get('1st').get('URLCompressor') + compressed
    } else {                     // Compression not applied
        return flagsMap.get('1st').get('uncompressed') + uncompressed
    }
}

function addColorAsKey(encodedColors, gId, shorterStrWithPrefix) {
    return `${encodedColors.get(gId)}=${shorterStrWithPrefix}`;
}


// Calculate and compare the length of finished strings to output to console.

function calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount) {
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, ampersandCount);
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, ampersandCount);
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore);
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter);
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore);
}
