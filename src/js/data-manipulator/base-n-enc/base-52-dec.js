function base52Decode(str) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let base = alphabet.length;
    let decoded = 0;

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i]);
        decoded += index * Math.pow(base, str.length - i - 1);
    }

    return decoded;
}

//console.log(base52Decode('ca')) // 104
//console.log(base52Decode('dm')) // 168
//console.log(base52Decode('dB')) // 183
//console.log(base52Decode('bO')) // 92
//console.log(base52Decode('m')) // 12
//console.log(base52Decode('f')) // 5
//console.log(base52Decode('L')) // 37
//console.log(base52Decode('aL')) // 37



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

