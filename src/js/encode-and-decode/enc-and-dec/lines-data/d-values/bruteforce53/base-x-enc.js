import { addNumBeforeEncode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'


// Generate alphabets52 string
// アルファベットの文字コードの範囲を定義する
//const lowerStart = 97; // 'a'の文字コード
//const lowerEnd = 122; // 'z'の文字コード
//const upperStart = 65; // 'A'の文字コード
//const upperEnd = 90; // 'Z'の文字コード
//
//// 文字列を生成する関数を定義する
//function generateAlternatingString() {
//  // 空の文字列を用意する
//  let result = '';
//  // アルファベットの数だけ繰り返す
//  for (let i = 0; i < 26; i++) {
//    // 大文字と小文字の文字コードを計算する
//    let upperCode = upperStart + i;
//    let lowerCode = lowerStart + i;
//    // 文字コードを文字に変換して結果に追加する
//    result += String.fromCharCode(upperCode) + String.fromCharCode(lowerCode);
//  }
//  // 結果を返す
//  return result;
//}
//
//// 関数を実行して結果を表示する
//console.log(generateAlternatingString()); // 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz'



// BaseX encode with `a` padding

export function baseXEnc(numOriginal, baseX) {
    // Add some numbers to shift each number above zero
    let numWithoutMinus = addNumBeforeEncode(numOriginal, baseX)
    console.log("numOriginal, numWithoutMinus: ", numOriginal, numWithoutMinus)

    const alphabet = getAlphabetsForBaseX(baseX)
    let base = alphabet.length;
    let encoded = '';

    if (numWithoutMinus === 0) {
        return alphabet[0] + alphabet[0];
    }

    while (numWithoutMinus) {
        let remainder = numWithoutMinus % base;
        numWithoutMinus = Math.floor(numWithoutMinus / base);
        encoded = alphabet[remainder] + encoded;
    }

    // Padded to 2 digits
    if (encoded.length === 1) {
        console.log("Need to .padStart(2, 'a'): ", encoded)
        encoded = encoded.padStart(2, 'a')
    }
    // Check
    //console.log('typeof(numOriginal), numOriginal, addNumBeforeEncode(numOriginal) and encoded(without pad): ', typeof(numOriginal), numOriginal, addNumBeforeEncode(numOriginal), encoded)

    return encoded
}
