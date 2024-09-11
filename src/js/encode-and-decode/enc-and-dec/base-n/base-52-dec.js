import { subtractToRestoreOriginalAfterDecode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { getAlphabets52 }                       from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'

export
    { base52Dec
    , base52DecodeForRefDict
    }

    // For the number value of freq dict to embed for bruteforce53-enc

function base52Dec(str) {
    const alphabet = getAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length
    let decoded = 0

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i])
        decoded += index * Math.pow(base, str.length - i - 1)
    }

    return decoded
}

// console.log(base52Dec('a'))    // 0
// console.log(base52Dec('b'))    // 1
// console.log(base52Dec('A'))    // 26
// console.log(base52Dec('B'))    // 27
// console.log(base52Dec('Z'))    // 51
// console.log(base52Dec('ba'))   // 52
// console.log(base52Dec('ZZ'))   // 2703
// console.log(base52Dec('baa'))  // 2704
// console.log(base52Dec('ZZZ'))  // 140607
// console.log(base52Dec('baaa')) // 140608

// console.log(base52Dec('aa'))   // 0
// console.log(base52Dec('aaa'))  // 0
// console.log(base52Dec('aaaa')) // 0



// To decode the number of freq dict

function base52DecodeForRefDict(str) {
    let encodedStr = str

    // base52エンコードした結果が3文字の場合に付けた 先頭のアンダースコアを削除
    if (str.length === 4) {
        encodedStr = encodedStr.slice(1)
    }

    // Base52 decode
    const rawDecoded = base52Dec(encodedStr)

    // UIntX の値に応じた 正の数だけにするために 加えていた数値を 取り除く
    const decoded = subtractToRestoreOriginalAfterDecode(rawDecoded)

    console.log('decoded, rawDecoded, encodeStr: ', decoded, rawDecoded, encodedStr) // -2 1018 tE

    return decoded
}
