// For the number value of freq dict to embed for bruteforce53-enc

function base52Decode(str) {
    const alphabet = getAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length;
    let decoded = 0;

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i]);
        decoded += index * Math.pow(base, str.length - i - 1);
    }

    return decoded;
}

// console.log(base52Decode('a'))    // 0
// console.log(base52Decode('b'))    // 1
// console.log(base52Decode('A'))    // 26
// console.log(base52Decode('B'))    // 27
// console.log(base52Decode('Z'))    // 51
// console.log(base52Decode('ba'))   // 52
// console.log(base52Decode('ZZ'))   // 2703
// console.log(base52Decode('baa'))  // 2704
// console.log(base52Decode('ZZZ'))  // 140607
// console.log(base52Decode('baaa')) // 140608





// To decode the number of freq dict

function base52DecodeForFreqDictValue(str) {
    let encodedStr = str

    // base52エンコードした結果が3文字の場合に付けた 先頭のアンダースコアを削除
    if (str.length === 4) {
        encodedStr = encodedStr.slice(1)
    }

    // Base52 decode
    let rawDecoded = base52Decode(encodedStr);

    // UIntX の値に応じた 正の数だけにするために 加えていた数値を 取り除く
    decoded = subtractNumAfterDecodeForBase52ForFreqDictValue(rawDecoded)

    //console.log('decoded, rawDecoded, encodeStr: ', decoded, rawDecoded, encodedStr) // -2 1018 tE

    return decoded
}
