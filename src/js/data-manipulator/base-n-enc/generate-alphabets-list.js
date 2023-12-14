// Generate an alphabets string for encoding
// Using for base52Encode(), baseXEnc(), and frequency dictionary of bruteforce52Enc

// アルファベットの文字コードのスタート位置を定義する
const lowerStart = 97; // 'a'の文字コード
const upperStart = 65; // 'A'の文字コード

function generateAlphabets52() {
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
// console.log(generateAlphabets52())
// abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
