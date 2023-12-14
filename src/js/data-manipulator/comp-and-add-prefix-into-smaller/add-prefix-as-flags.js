// Add the chars for flags that indicates encoding method settings

// 1st char(Encode-type-A): [0] Raw       / [1] URLCompressor
// 2nd char(Encode-type-B): [0] baseX-enc / [1] bigint64-enc / [2] swap63-enc
// 3rd char(Config value for Encode-type-B): Base52 encoded char
//                                           For [0] baseX-enc  => Base X number
//                                           For [1] bigint64-enc => X digits to split into each chunks
//                                           For [2] swap63-enc => Nothing (Encoded values start at 3rd char)]
function addPrefixAsFlags(inputStr, numOf1stChar, numOf2ndChar, numOf3rdChar) {
    let strWithFlag = inputStr

    // Add 3rd char
    if (numOf3rdChar === null) {
        // for swap63-enc
        console.log("The encode method now using is Swap63, Not need to add any char as 3rd flag. Encoded value starts at 3rd char")

    } else if (numOf2ndChar === 0) {
        // for bruteforce52-enc
        base52EncodedChar = base52Encode(numOf3rdChar)
        strWithFlag = `${base52EncodedChar}` + strWithFlag

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