function tryCompress(encodedDval, encodedAttrsExceptsDvals, encodingMethodName, valueFor3rdChar) {
    const encodedWidthAndCounts = encodedAttrsExceptsDvals.widthAndCounts
    const encodedGroupColors    = encodedAttrsExceptsDvals.groupColors

    const wholeEncodedValues = new Map();
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];
    const groupCount = encodedDval.size;
    const ampersandCount = groupCount - 1;

    for (const [gId, dvalEncodedStr] of encodedDval) {
        const widthAndCountsEncoded = encodedWidthAndCounts.get(gId);
        const widthAndCountsAndDval = widthAndCountsEncoded + '-' + dvalEncodedStr;

        const {compressed, shouldApply} = compressAndCompare(widthAndCountsAndDval, gId);

        const shorterStrWithPrefix   = addPrefixToShorter(shouldApply, compressed, widthAndCountsAndDval, encodingMethodName, valueFor3rdChar);
        const groupColorsPrefixAdded = addGroupColorPrefix(encodedGroupColors, gId, shorterStrWithPrefix);

        wholeEncodedValues.set(gId, groupColorsPrefixAdded);

        lengthBeforeURLComp.push(groupColorsPrefixAdded.length + 3);
        lengthAfterURLComp.push(compressed.length + 3);
    }

    // Calculate and compare the length of finished strings to output to console.
    calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount);

    return wholeEncodedValues;
}
function compressAndCompare(widthAndCountsAndDval, gId) {
    // Compress and compare
    const compressed = URLCompressor.compress(widthAndCountsAndDval);
    const shouldApply = compressed.length < widthAndCountsAndDval.length

    // Output the result details
    if (shouldApply === true) {
        // before の方が長い場合 = URLCompressor が効果的である場合
        console.log(`URLCompressor is effective for group #${gId}, so should be applied it:`, widthAndCountsAndDval.length, '=>', compressed.length)
    } else {
        // before の方が短いか 同じ 場合 = URLCompressor が効果的ではない場合
        console.log(`URLCompressor is not effective for group #${gId}, so should be passed it:`, widthAndCountsAndDval.length, '=>', compressed.length)
    }

    return {compressed, shouldApply};
}

// Calculate and compare the length of finished strings to output to console.
function calculateLengths(lengthBeforeURLComp, lengthAfterURLComp, ampersandCount) {
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, ampersandCount);
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, ampersandCount);
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore);
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter);
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore);
}
