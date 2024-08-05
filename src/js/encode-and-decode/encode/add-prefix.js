import { base53Enc } from 'enc-and-dec/base-n/base-53-enc'

export
    { addGroupColorPrefix
    , addPrefixToShorter
    }


// Add group-colors prefix

function addGroupColorPrefix(encodedColors, gId, shorterStrWithPrefix) {
    return `${encodedColors.get(gId)}=${shorterStrWithPrefix}`;
}



// 1. Choose shorter size string from compressed with URLCompressor or not
// 2. Add the prefix three chars into chosen one

function addPrefixToShorter(shouldApply, compressed, original, encodingMethodName, valueFor3rdChar) {
    //const str = shouldApply ? compressed : original;
    // 前置文字列の選択と追加のロジック
    // Result string = [three-chars-flag][shorter-string-of-encoded-dvals-compressed-with-url-compressor]
    let shorterStrWithPrefix = ""

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


    if (shouldApply === true) { // Compression applied
        shorterStrWithPrefix = addPrefixAsFlags(compressed,
            1,            // Flag for 1st char as URLComp applied
            numOf2ndChar, // Flag for 2nd char as swap63Enc applied
            numOf3rdChar  // No flag needed for 3rd char when swap63Enc applied
        )
    } else { // Compression not applied
        shorterStrWithPrefix = addPrefixAsFlags(original,
            0,            // Flag for 1st char as URLComp not applied
            numOf2ndChar, // Flag for 2nd char as swap63Enc applied
            numOf3rdChar  // No flag needed for 3rd char when swap63Enc applied
        )
    }

    return shorterStrWithPrefix
}


// Add the chars for flags that indicates encoding method settings

// 1st char(Compression-method):
//     [0] None (uncompressed)
//     [1] URLCompressor
// 2nd char(Encoding-methods):
//     [0] bruteforce53-enc
//     [1] bigint64-enc
//     [2] swap63-enc
// 3rd char(Config value for Encoding-methods):
//     [char or number]:
//         [0] bruteforce53-enc => Base X number (Base53 encoded)
//         [1] bigint64-enc     => Number of digits used to split into each chunk.
//         [2] swap63-enc       => 'n' ('n' means null, skip it when decoding.)

function addPrefixAsFlags(inputStr, numOf1stChar, numOf2ndChar, numOf3rdChar) {
    let strWithFlag = inputStr

    // Add 3rd char
    if (numOf3rdChar === null) {
        // for swap63-enc
        strWithFlag = 'n' + strWithFlag

    } else if (numOf2ndChar === 0) {
        // for bruteforce53-enc
        const base53EncodedChar = base53Enc(numOf3rdChar)
        strWithFlag = `${base53EncodedChar}` + strWithFlag

    } else {
        // for bigint64-enc
        strWithFlag = `${numOf3rdChar}` + strWithFlag
    }


    // Add 2nd char
    if (numOf2ndChar >= 3) {
        console.log("Invalid number for 2nd flag.")
    } else {
        strWithFlag = `${numOf2ndChar}` + strWithFlag
    }


    // Add 1st char
    if (numOf1stChar >= 2) {
        console.log("Invalid number for 1st flag.")
    } else {
        strWithFlag = `${numOf1stChar}` + strWithFlag
    }


    return strWithFlag
}