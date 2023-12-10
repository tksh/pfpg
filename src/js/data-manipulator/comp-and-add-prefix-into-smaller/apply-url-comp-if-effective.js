function applyUrlCompIfEffective(encodedDvalByGroup, encodedWidthCountByGroup, encodedColorsByGroup) {

    // Store smaller length strings
    const wholeEncodedValuesByGroup = new Map();

    // For JUST comparing between URLComp applied or not
    let lengthBeforeURLComp = [];
    let lengthAfterURLComp = [];


    for (const [groupId, dvalSwap63EncodedStr] of encodedDvalByGroup) {

        // Get encoded width count that have same group_id as a key
        const widthCountEncoded = encodedWidthCountByGroup.get(groupId)
        //console.log('widthCountEncoded: ', widthCountEncoded) // 3t

        // Join the [width count] and [swap63 encoded dvals] with `-` (hyphen)
        // [width count]-[x1, y1, x2, y2]
        const widthCountAndDval = widthCountEncoded + '-' + dvalSwap63EncodedStr


        // Compress with URLCompressor
        const widthCountAndDvalURLCompressed = URLCompressor.compress(widthCountAndDval)

        // Judge the URLCompressor should be applied or not
        const applyURLCompressorOrNot = compareLengthOfString(groupId, widthCountAndDval, widthCountAndDvalURLCompressed)
        // URLCompressor is effective for color #000, so should be applied it: 488 => 395
        // URLCompressor is effective for color #000, so should be applied it: 492 => 400
        // console.log('applyURLCompressorOrNot: ', applyURLCompressorOrNot) // true


        const smallerStrWithPrefix = chooseSmallerAndAddPrefix(
            applyURLCompressorOrNot,        // Boolean of apply the compression or not
            widthCountAndDvalURLCompressed, // Compressed string
            widthCountAndDval,              // Raw string
            'swap63-enc',                   // Encode method name
            null                            // Value for 3rd char
        )

        console.log('smallerStrWithPrefix: ', smallerStrWithPrefix)
        // 129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha


        // Add color attrs for group (stroke, opacity, stroke-opacity) encoded as 3|5|6|10 chars hex
        const groupColorsPrefixAddedByGroup = encodedColorsByGroup.get(groupId) + '=' + smallerStrWithPrefix
        // console.log('groupColorsPrefixAddedByGroup: ', groupColorsPrefixAddedByGroup)
        // 000=129CaKJG9uDH6Ub8FA_44xqpELIDubncH66-6LAeIn74oUwF1I_W8g-tWyUdjEaFTpKSmXLj1CUhUaha

        // Set to Map the whole stroke groups
        wholeEncodedValuesByGroup.set(groupId, groupColorsPrefixAddedByGroup)



        // For JUST comparing between URLComp applied or not

        // Join the encoded group colors and strokes values (without flags)
        const joinedAsURLParamsBeforeURLComp = encodedColorsByGroup.get(groupId) + '=' + widthCountAndDval
        const joinedAsURLParamsAfterURLComp = encodedColorsByGroup.get(groupId) + '=' + widthCountAndDvalURLCompressed
        // Push to the array for whole colors, `+ 2` means length of 2 chars flags
        lengthBeforeURLComp.push(joinedAsURLParamsBeforeURLComp.length + 2)
        lengthAfterURLComp.push(joinedAsURLParamsAfterURLComp.length + 2)
    }

    // For JUST comparing between URLComp applied or not
    console.log('Before URLComp (Each group encoded string length): ', lengthBeforeURLComp) // (5) [85, 73, 258, 85, 37]
    console.log('After URLComp  (Each group encoded string length): ', lengthAfterURLComp)  // (5) [84, 70, 206, 73, 34]
    const totalLengthBefore = lengthBeforeURLComp.reduce((a, b) => a + b, 0)
    const totalLengthAfter = lengthAfterURLComp.reduce((a, b) => a + b, 0)
    console.log('Before URLComp (Total encoded string length): ', totalLengthBefore) // 538
    console.log('After URLComp  (Total encoded string length): ', totalLengthAfter)  // 467
    console.log("Ratio (totalLengthAfter / totalLengthBefore): ", totalLengthAfter / totalLengthBefore) // 0.8680297397769516

    return wholeEncodedValuesByGroup
}
