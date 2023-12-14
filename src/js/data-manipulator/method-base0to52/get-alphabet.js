// Get the alphabets string for frequency dictionary and baseX encodings

function getAlphabetsForDict(dictSize) {
    const alphabets52 = generateAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // 文字列の後ろから dictSize の文字数分を取り出す
    if (dictSize == 0) {
        console.log('dictSize is 0, return the empty string.')
        return "";
    } else {
        const alphabetsForDict = alphabets52.slice(-dictSize);
        return alphabetsForDict
    }
}

function getAlphabetForBaseX(baseXNum) {
    const alphabets52 = generateAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const alphabetForBaseX = alphabets52.substring(0, baseXNum)
    return alphabetForBaseX
}
