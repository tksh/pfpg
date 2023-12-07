function base52Encode(num) {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let base = alphabet.length;
    let encoded = '';

    if (num === 0) {
        return alphabet[0];
    }

    while (num) {
        let remainder = num % base;
        num = Math.floor(num / base);
        encoded = alphabet[remainder] + encoded;
    }

    return encoded;
}

//console.log(base52Encode(183)) // dB
//console.log(base52Encode(92)) // bO
//console.log(base52Encode(12)) // m
//console.log(base52Encode(5)) // f
//console.log(base52Encode(37)) // L

//console.log('0: ', base52Encode(0)) // a
//console.log('1: ', base52Encode(1)) // b
//console.log('2703: ', base52Encode(2703)) // ZZ
//console.log('2704: ', base52Encode(2704)) // baa (52*52=2704)
//console.log(base52Encode(140607)) // ZZZ
//console.log(base52Encode(140608)) // baaa



// To encode the number of freq dict

function base52EncodeForFreqDictValue(num) {
    const encoded = base52Encode(addNumBeforeEncodeForBase52ForFreqDictValue(num));

    // base52エンコードした結果が3文字の場合、先頭にアンダースコアを追加
    if (encoded.length === 3) {
        return '_' + encoded;
    }

    // それ以外の場合、結果の文字列を二文字に揃える
    return encoded.padStart(2, 'a');
}
