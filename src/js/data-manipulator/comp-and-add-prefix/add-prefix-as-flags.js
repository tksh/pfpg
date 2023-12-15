// Add the chars for flags that indicates encoding method settings

// 1st char(Compression-method):
//     [0] Raw
//     [1] URLCompressor
// 2nd char(Encoding-methods):
//     [0] bruteforce52-enc
//     [1] bigint64-enc
//     [2] swap63-enc
// 3rd char(Config value for Encoding-methods):
//     [char or number]:
//         [0] bruteforce52-enc => Base X number
//         [1] bigint64-enc     => X digits to split into each chunks
//         [2] swap63-enc       => 'n' ('n' means null, skip it when decoding.)

function addPrefixAsFlags(inputStr, numOf1stChar, numOf2ndChar, numOf3rdChar) {
    let strWithFlag = inputStr

    // Add 3rd char
    if (numOf3rdChar === null) {
        // for swap63-enc
        strWithFlag = 'n' + strWithFlag

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