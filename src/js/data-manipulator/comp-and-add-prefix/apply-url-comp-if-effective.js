function applyUrlCompIfEffective(
    encodedDvalByGroup,
    encodedWidthCountByGroup,
    encodedColorsByGroup,
    encodingMethodName,
    valueFor3rdChar) {

    // Encoded string structure: [color]=[1stFlagChar][2ndFlagChar]([3rdFlagChar])[widthCount]-[dval]
    // URLCompressor applied to: [widthCount]-[dval]

    // Store smaller length strings
    const wholeEncodedValuesByGroup = new Map();

    // For JUST comparing between URLComp applied or not
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];
    // Get number of '&' mark to get correct finished string length
    const groupCount = encodedDvalByGroup.size
    const ampersandCount = groupCount - 1 // '&' will added between each groups


    for (const [groupId, dvalEncodedStr] of encodedDvalByGroup) {

        // Get encoded width count that have same group_id as a key
        const widthCountEncoded = encodedWidthCountByGroup.get(groupId)
        //console.log('widthCountEncoded: ', widthCountEncoded) // 3t

        // Join the [width count] and [swap63 encoded dvals] with `-` (hyphen)
        // [width count]-[x1, y1, x2, y2]
        const widthCountAndDval = widthCountEncoded + '-' + dvalEncodedStr


        // Compress with URLCompressor
        const widthCountAndDvalURLCompressed = URLCompressor.compress(widthCountAndDval)

        // Judge the URLCompressor should be applied or not
        const applyURLCompressorOrNot = compareLength(groupId, widthCountAndDval, widthCountAndDvalURLCompressed)
        // console.log('applyURLCompressorOrNot: ', applyURLCompressorOrNot) // true


        /////// Check
        console.log('groupId: ', groupId)
        console.log('(Comp) widthCountAndDvalURLCompressed: ', widthCountAndDvalURLCompressed)
        console.log('(Raw) widthCountAndDval: ', widthCountAndDval)

        // Add prefix chars
        const smallerStrWithPrefix = chooseSmallerAndAddPrefix(
            applyURLCompressorOrNot,        // Boolean of apply the compression or not
            widthCountAndDvalURLCompressed, // Compressed string
            widthCountAndDval,              // Raw string
            encodingMethodName,             // Encode method name
            valueFor3rdChar                 // Value for 3rd char
        )
        //console.log('smallerStrWithPrefix: ', smallerStrWithPrefix)
        // 129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha


        // Add color attrs for group (stroke, opacity, stroke-opacity) encoded as 1|3|5|6|10 chars hex
        const groupColorsPrefixAddedByGroup = encodedColorsByGroup.get(groupId) + '=' + smallerStrWithPrefix
        // console.log('groupColorsPrefixAddedByGroup: ', groupColorsPrefixAddedByGroup)
        // 000=129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha

        // Set the whole groups into Map
        wholeEncodedValuesByGroup.set(groupId, groupColorsPrefixAddedByGroup)



        // For JUST comparing between URLComp applied or not

        // Join the encoded group colors and lines data (without flags)
        const joinedAsURLParamsBeforeURLComp = encodedColorsByGroup.get(groupId) + '=' + widthCountAndDval
        const joinedAsURLParamsAfterURLComp  = encodedColorsByGroup.get(groupId) + '=' + widthCountAndDvalURLCompressed
        // Push to the array for whole colors, `+ 3` means length of 3 chars flags
        lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 3)
        lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 3)
    }

    // For JUST comparing between URLComp applied or not
    console.log('Before URLComp (Each group encoded string length): ', lengthBeforeURLComp) // (5) [85, 73, 258, 85, 37]
    console.log('After URLComp  (Each group encoded string length): ', lengthAfterURLComp)  // (5) [84, 70, 206, 73, 34]
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, ampersandCount)
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, ampersandCount)
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore) // 538
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter)  // 467
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore) // 0.8680297397769516

    return wholeEncodedValuesByGroup
}
