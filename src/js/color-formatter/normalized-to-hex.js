// 0から1の範囲に正規化された数値を引数として受け取り
// 2桁のHEX文字列として返す関数
export function normalizedToHex(num) {
    // 数値が0から1の範囲にあるかチェックする
    if (num < 0 || num > 1) {
        // 範囲外であればエラーを返す
        return "Invalid number";
    }
    // 数値を255倍して整数にする
    const int = Math.round(num * 255);
    // 整数を16進数に変換する
    const hex = int.toString(16);
    // 16進数が一桁の場合は先頭に0を付ける
    const padded = hex.length === 1 ? "0" + hex : hex;
    // 大文字に変換して返す
    return padded.toUpperCase();
}

// Test
// console.log(normalizedToHex(1))    // FF
// console.log(normalizedToHex(0.8))  // CC
// console.log(normalizedToHex(0.01)) // 03
// console.log(normalizedToHex(0))    // 00
