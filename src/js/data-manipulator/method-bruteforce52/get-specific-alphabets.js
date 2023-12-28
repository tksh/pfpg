// Get the alphabets string for frequency dictionary and baseX encodings

function getAlphabets52() {
    // アルファベットの文字コードのスタート位置を定義する
    const lowerStart = 97; // 'a'の文字コード
    const upperStart = 65; // 'A'の文字コード

    // 空の文字列を用意する
    let result = '';

    // アルファベットの数だけ繰り返す

    // Lower case
    for (let i = 0; i < 26; i++) {
        let lowerCode = lowerStart + i;
        result += String.fromCharCode(lowerCode)
    }

    // Upper case
    for (let i = 0; i < 26; i++) {
        let upperCode = upperStart + i;
        result += String.fromCharCode(upperCode)
    }

    return result;
}
// console.log(getAlphabets52())
// abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ


function getAlphabetsForDict(dictSize) {
    const alphabets52 = getAlphabets52()
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
    const alphabets52 = getAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    const alphabetForBaseX = alphabets52.substring(0, baseXNum)
    return alphabetForBaseX
}
