function showStringSize(nameOfInput, inputStr, outputElemId) {
    console.log(`//////////////////////// Result of ${nameOfInput} encoding ////////////////////////`)

    // Show the size in html
    const outputText = document.getElementById(`${outputElemId}`)
    outputText.textContent = `Encoded ${nameOfInput} size: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Encoded as ${nameOfInput} successfully, Size: `, inputStr.length);
}

function showProcessingTime(nameOfInput, inputNum, outputElemId) {
    // Show the time in html
    const outputText = document.getElementById(`${outputElemId}`)
    outputText.textContent = `Processing time of ${nameOfInput}: ${inputNum} milliseconds`

    // Show the time in console
    console.log(`Processing time of ${nameOfInput}: `, inputNum, ' ms');
}

function showDetailsByGroup(encodingMethodName, nameOfInput, encodedStrByGroupMap) {
    // Get the stats of encodedStrByGroupMap
    const keys = [...encodedStrByGroupMap.keys()]
    const values = [...encodedStrByGroupMap.values()]
    const lengthOfValues = values.map((value) => value.length)                        // `=`までの部分を切り出し
    const groupColors = values.map((value) => value.split('=')[0])                    // `=`までの部分を切り出し
    const threeCharsAsFlag = values.map((value) => value.split('=')[1].slice(0, 3))   // `=`の直後から3文字目までの部分を切り出し
    const flag1CompressionMethod = threeCharsAsFlag.map((value) => value[0])          // 1文字目
    const flag2EncodingMethod = threeCharsAsFlag.map((value) => value[1])             // 2文字目

    let flag3ConfigForEnc
    let flag3DescText
    if (encodingMethodName === 'bruteforce52-enc') {
        flag3ConfigForEnc = threeCharsAsFlag.map((value) => base52Decode(value[2])) // 3文字目を Base52デコードして 表示
        flag3DescText = 'Base X number'
    } else {
        flag3ConfigForEnc = threeCharsAsFlag.map((value) => value[2])               // 3文字目を そのまま 表示
            if (encodingMethodName === 'bigint64-enc') {
                flag3DescText = 'Chunk size to zero padded'
            } else if (encodingMethodName === 'swap63-enc') {
                flag3DescText = '\'n\' means null, skip it for decoding'
            }
    }

    // Show the encoding result of each group in console
    console.log(`//////////////////////// Result of ${nameOfInput} encoding details by group ////////////////////////`)
    console.log('Group key numbers: ', keys) // (5) ['1', '2', '3', '4', '5']
    console.log('Group colors encoded: ', groupColors) // (5) ['0', '0', '0', 'e', 'f']
    console.log('Length of encoded strings: ', lengthOfValues)
    //console.log('values: ', values) // (5) ['0=10Z9CaIjM0hFnr79M-RQycZuCGl9FiVAIsPJkb1_yGO0qTXC…kMPwqfZoKHnlHcFOXIt17RN8nWJB1RS3s_csHGL423JjS_SwK', '0=10i9 ...
    console.log(' 3 chars as flag: ', threeCharsAsFlag) // (5) ['10Z', '10i', '10X', '10b', '10Z']
    console.log('flag 1, Compression method (None[0], URLCompressor[1]): ', flag1CompressionMethod) // (5) ['1', '1', '1', '1', '1']
    console.log('flag 2, Encoding method (bruteforce52-enc[0], bigint64-enc[1], swap63-enc[2]): ', flag2EncodingMethod) // (5) ['0', '0', '0', '0', '0']
    console.log(`flag 3, Configuration for encoding (${flag3DescText}): `, flag3ConfigForEnc) // (5) [51, 8, 49, 1, 51]
}