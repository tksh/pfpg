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

function showDetailsByGroup(nameOfInput, encodedStrByGroupMap) {
    // Get the details of encoding result
    const keys = [...encodedStrByGroupMap.keys()]
    const values = [...encodedStrByGroupMap.values()]
    const lengthOfValues = values.map((value) => value.length)                        // `=`までの部分を切り出し
    const groupColors = values.map((value) => value.split('=')[0])                    // `=`までの部分を切り出し
    const threeCharsAsFlag = values.map((value) => value.split('=')[1].slice(0, 3))   // `=`の直後から3文字目までの部分を切り出し
    const flag1CompressionMethodName = threeCharsAsFlag.map((value) => {              // 1st char value
        if (Number(value[0]) === 0) {
            return 'None(Uncompressed)'
        } else if (Number(value[0]) === 1) {
            return 'URLCompressor'
        }
    })
    const flag2EncodingMethodName = threeCharsAsFlag.map((value) => {                 // 2nd char value
        if (Number(value[1]) === 0) {
            return 'bruteforce53'
        } else if (Number(value[1]) === 1) {
            return 'bigint64'
        } else if (Number(value[1]) === 2) {
            return 'swap63'
        }
    })
    const flag3ConfigurationValueName = threeCharsAsFlag.map((value, index) => {        // 3rd char value
        if (flag2EncodingMethodName[index] === 'bruteforce53') {
            return base53Decode(value[2])
        } else {
            return value[2]
        }
    })

    // Show in console
    console.log(`//////////////////////// Result of ${nameOfInput} encoding details by group ////////////////////////`)
    console.log('Group key numbers: ', keys) // (5) ['1', '2', '3', '4', '5']
    console.log('Group colors encoded: ', groupColors) // (5) ['0', '0', '0', 'e', 'f']
    console.log('Length of encoded strings: ', lengthOfValues)
    console.log('3 chars prefix as flag: ', threeCharsAsFlag) // (5) ['10Z', '10i', '10X', '10b', '10Z']
    console.log('flag 1, Compression method name', flag1CompressionMethodName) // (5) 
    console.log('flag 2, Encoding method name', flag2EncodingMethodName) // (5)
    console.log('flag 3, Configuration value for encoding indicates:\nBase X number for bruteforce53-enc | Chunk size for bigint64-enc | \'n\' (=null, skip it for decoding) for swap63-enc')
    console.log('flag 3, Configuration value for encoding', flag3ConfigurationValueName) // (5) 
}
