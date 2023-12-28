// 1. Choose smaller size string, compressed or not
// 2. Add the prefix chars into chosen one

function chooseSmallerAndAddPrefix(
    applyCompOrNotBoolean,
    compressedStr,
    rawStr,
    encodingMethodName,
    valueFor3rdChar
) {
    // Result string
    let smallerStrWithPrefix = ""

    // Init the flags
    let numOf2ndChar = 0
    let numOf3rdChar = 0

    // Change the flags values as each encode method specific
    if (encodingMethodName === 'swap63-enc') {
        numOf2ndChar = 2
        numOf3rdChar = null
    } else if (encodingMethodName === 'bigint64-enc') {
        numOf2ndChar = 1
        numOf3rdChar = valueFor3rdChar
    } else if (encodingMethodName === 'bruteforce53-enc') {
        numOf2ndChar = 0
        numOf3rdChar = valueFor3rdChar
    }


    if (applyCompOrNotBoolean === true) { // Compression applied
        smallerStrWithPrefix = addPrefixAsFlags(compressedStr,
            1,            // Flag for 1st char as URLComp applied
            numOf2ndChar, // Flag for 2nd char as swap63Enc applied
            numOf3rdChar  // No flag needed for 3rd char when swap63Enc applied
        )
    } else { // Compression not applied
        smallerStrWithPrefix = addPrefixAsFlags(rawStr,
            0,            // Flag for 1st char as URLComp not applied
            numOf2ndChar, // Flag for 2nd char as swap63Enc applied
            numOf3rdChar  // No flag needed for 3rd char when swap63Enc applied
        )
    }

    return smallerStrWithPrefix
}
