// 2桁のHEX文字列を引数として受け取り
// 0から1の範囲に正規化された数値として返す関数
function normalizedFromHex(hex) {
    // 16進数を10進数に変換
    const decimalValue = parseInt(hex, 16);
    // 0から255の範囲を0から1の範囲に正規化
    const normalizedValue = decimalValue / 255;
    // 制度を小数点以下第2位までに調整
    const normalizedValueFixed = Number(normalizedValue.toFixed(2));
    return normalizedValueFixed;
}

// Test
// console.log(normalizedFromHex('FF')) // 1
// console.log(normalizedFromHex('CC')) // 0.8
// console.log(normalizedFromHex('03')) // 0.01
// console.log(normalizedFromHex('00')) // 0
