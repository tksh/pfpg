// 1. Choose smaller size string, compressed or not
// 2. Add the prefix chars into chosen one

function chooseSmallerAndAddPrefix(applyCompOrNotBoolean, compressedStr, rawStr, compMethodName, valueOf3rdChar) {
    // Result string
    let smallerStrWithPrefix = ""

    // Init the flags
    let numFor2ndFlag = 0
    let valueFor3rdFlag = ""

    // Change the flags values as each encode method specific
    if (compMethodName === 'swap63-enc') {
        numFor2ndFlag = 2
        valueFor3rdFlag = null
    } else if (compMethodName === 'bigint-enc') {
        numFor2ndFlag = 1
        valueFor3rdFlag = valueOf3rdChar
    } else if (compMethodName === 'baseX-enc') {
        numFor2ndFlag = 0
        valueFor3rdFlag = valueOf3rdChar
    }


    if (applyCompOrNotBoolean === true) { // Compression applied
        smallerStrWithPrefix = addPrefixAsFlags(compressedStr,
            1,              // Flag for 1st char as URLComp applied
            numFor2ndFlag,  // Flag for 2nd char as swap63Enc applied
            valueFor3rdFlag // No flag needed for 3rd char when swap63Enc applied
        )
    } else { // Compression not applied
        smallerStrWithPrefix = addPrefixAsFlags(rawStr,
            0,              // Flag for 1st char as URLComp not applied
            numFor2ndFlag,  // Flag for 2nd char as swap63Enc applied
            valueFor3rdFlag // No flag needed for 3rd char when swap63Enc applied
        )
    }
    return smallerStrWithPrefix
}
