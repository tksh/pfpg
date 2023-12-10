// Add the chars for flags that indicates encoding method settings

// 1st char(Encode-type-A): [0] Raw       / [1] URLCompressor
// 2nd char(Encode-type-B): [0] baseX-enc / [1] bigint-enc / [2] swap63-enc
// 3rd char(Config value for Encode-type-B): Base52 encoded char
//                                           For [0] baseX-enc  => Base X number
//                                           For [1] bigint-enc => X digits to split into each chunks
//                                           For [2] swap63-enc => Nothing (Encoded values start at 3rd char)]
function addPrefixAsFlags(inputStr, numFor1stFlag, numFor2ndFlag, valueFor3rdFlag) {
    let strWithFlag = inputStr

    // Add 3rd char
    if (valueFor3rdFlag === null) {
        console.log("The encode method now using is Swap63, Not need to add any char as 3rd flag.")
    } else {
        strWithFlag = `${valueFor3rdFlag}` + strWithFlag
    }

    // Add 2nd char
    if (numFor2ndFlag >= 3) {
        console.log("Invalid number for 2nd flag.")
    } else {
        strWithFlag = `${numFor2ndFlag}` + strWithFlag
    }

    // Add 1st char
    if (numFor1stFlag >= 2) {
        console.log("Invalid number for 1st flag.")
    } else {
        strWithFlag = `${numFor1stFlag}` + strWithFlag
    }

    return strWithFlag
}