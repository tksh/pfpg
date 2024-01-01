// Generate an string for encoding
// Using for 3rd flag for bruteforce53-enc

function getCharList53() {
    // アルファベットの文字コードのスタート位置を定義する
    const lowerStart = 97; // 'a'の文字コード
    const upperStart = 65; // 'A'の文字コード

    // init with underscore
    let result = '_';

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
// console.log(getCharList53())
// _abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
