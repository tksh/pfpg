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

    // 文字列の後方から dictSize の値の分を取り出す
    if (dictSize == 0) {
        console.log('dictSize is 0, return the empty string.')
        return "";
    } else {
        const alphabetsForDict = alphabets52.slice(-dictSize);
        return alphabetsForDict
    }
}
// console.log(typeof(getAlphabetsForDict(0))) // string
// console.log(getAlphabetsForDict(0))  // ""
// console.log(getAlphabetsForDict(1))  // Z
// console.log(getAlphabetsForDict(51)) // bcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
// console.log(getAlphabetsForDict(52)) // abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ

function getAlphabetsForBaseX(baseX) {
    const alphabets52 = getAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    // 文字列の前方から baseX の値の分を取り出す
    if (baseX == 0) {
        console.log('baseX is 0, return the empty string.')
        return "";
    } else {
        const alphabetForBaseX = alphabets52.substring(0, baseX)
        return alphabetForBaseX
    }
}

// console.log(typeof(getAlphabetsForBaseX(0))) // string
// console.log(getAlphabetsForBaseX(0))  //
// console.log(getAlphabetsForBaseX(1))  // a
// console.log(getAlphabetsForBaseX(8))  // abcdefgh
// console.log(getAlphabetsForBaseX(51)) // abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXY
// console.log(getAlphabetsForBaseX(52)) // abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ





