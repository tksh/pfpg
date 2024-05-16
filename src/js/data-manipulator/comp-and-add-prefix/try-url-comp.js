function tryOptimizeWithURLComp(
    encodedDval,
    encodedWidthAndCounts,
    encodedGroupColors,
    encodingMethodName,
    valueFor3rdChar
) {
    // Encoded string structure: [color]=[1stFlagChar][2ndFlagChar]([3rdFlagChar])[widthAndCounts]-[dval]
    // URLCompressor applied to: [widthAndCounts]-[dval]

    // Store smaller length strings
    const wholeEncodedValues = new Map();

    // For JUST comparing between URLComp applied or not
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];
    // Get number of '&' mark to get correct finished string length
    const groupCount = encodedDval.size
    const ampersandCount = groupCount - 1 // '&' will added between each groups


    for (const [g_id, dvalEncodedStr] of encodedDval) {

        // Get encoded width count that have same group_id as a key
        const widthAndCountsEncoded = encodedWidthAndCounts.get(g_id)
        //console.log('widthAndCountsEncoded: ', widthAndCountsEncoded) // 3t

        // Join the [width count] and [swap63 encoded dvals] with `-` (hyphen)
        // [width count]-[x1, y1, x2, y2]
        const widthAndCountsAndDval = widthAndCountsEncoded + '-' + dvalEncodedStr


        // Compress with URLCompressor
        const widthAndCountsAndDvalURLCompressed = URLCompressor.compress(widthAndCountsAndDval)

        // Judge the URLCompressor should be applied or not
        const applyURLCompOrNot = compareLength(g_id, widthAndCountsAndDval, widthAndCountsAndDvalURLCompressed)
        // console.log('applyURLCompOrNot: ', applyURLCompOrNot) // true


        /////// Check
        console.log('g_id: ', g_id)
        console.log('(Comp) widthAndCountsAndDvalURLCompressed: ', widthAndCountsAndDvalURLCompressed)
        console.log('(Raw) widthAndCountsAndDval: ', widthAndCountsAndDval)

        // Add prefix chars
        const smallerStrWithPrefix = chooseSmallerAndAddPrefix(
            applyURLCompOrNot,              // Boolean of apply the compression or not
            widthAndCountsAndDvalURLCompressed, // Compressed string
            widthAndCountsAndDval,              // Raw string
            encodingMethodName,             // Encode method name
            valueFor3rdChar                 // Value for 3rd char
        )
        //console.log('smallerStrWithPrefix: ', smallerStrWithPrefix)
        // 129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha


        // Add color attrs for group (stroke, opacity, stroke-opacity) encoded as 1|3|5|6|10 chars hex
        const groupColorsPrefixAdded = encodedGroupColors.get(g_id) + '=' + smallerStrWithPrefix
        // console.log('groupColorsPrefixAdded: ', groupColorsPrefixAdded)
        // 000=129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha

        // Set the whole groups into Map
        wholeEncodedValues.set(g_id, groupColorsPrefixAdded)



        // For JUST comparing between URLComp applied or not

        // Join the encoded group colors and lines data (without flags)
        const joinedAsURLParamsBeforeURLComp = encodedGroupColors.get(g_id) + '=' + widthAndCountsAndDval
        const joinedAsURLParamsAfterURLComp  = encodedGroupColors.get(g_id) + '=' + widthAndCountsAndDvalURLCompressed
        // Push to the array for whole colors, `+ 3` means length of 3 chars flags
        lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 3)
        lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 3)
    }

    // For JUST comparing between URLComp applied or not
    console.log('Before URLComp (Each group encoded string length): ', lengthBeforeURLComp) // (5) [85, 73, 258, 85, 37]
    console.log('After URLComp  (Each group encoded string length): ', lengthAfterURLComp)  // (5) [84, 70, 206, 73, 34]
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, ampersandCount)
    const totalLengthAfter  = lengthAfterURLComp.reduce((a, b)  => a + b, ampersandCount)
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore) // 538
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter)  // 467
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore) // 0.8680297397769516

    return wholeEncodedValues
}
