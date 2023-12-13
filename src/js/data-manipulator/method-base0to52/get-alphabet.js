// Get the string for frequency dictionary and baseX encodings

const wholeAlphabet = `AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz`

function getAlphabetForDict(dictSize) {
    // 文字列の後ろから dictSize の文字数分を取り出す
    if (dictSize == 0) {
        console.log('dictSize is 0, return the empty string.')
        return "";
    } else {
        const alphabetForDict = wholeAlphabet.slice(-dictSize);
        return alphabetForDict
    }
}

function getAlphabetForBaseX(baseXNum) {
    const alphabetForBaseX = wholeAlphabet.substring(0, baseXNum)
    return alphabetForBaseX
}

// console.log(getAlphabetForDict()) // IiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz
// console.log(getAlphabetForBaseX()) // AaBbCcDdEeFfGgHh


// Test
//console.log(getAlphabetForDict(0))  //
//console.log(getAlphabetForDict(1))  // z
//console.log(getAlphabetForDict(3))  // yZz
//console.log(getAlphabetForDict(26)) // NnOoPpQqRrSsTtUuVvWwXxYyZz
//console.log(getAlphabetForDict(52)) // AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz


//console.log(getAlphabetForBaseX(0))  //
//console.log(getAlphabetForBaseX(1))  // A
//console.log(getAlphabetForBaseX(3))  // AaB
//console.log(getAlphabetForBaseX(26)) // AaBbCcDdEeFfGgHhIiJjKkLlMm
//console.log(getAlphabetForBaseX(52)) // AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz




