import { tryDeleteHash } from 'color-formatter/hex-shorten'

export
    { normalizedFromHex
    , hexToUint8
    , hexToRgbMap
    , hexToRgb
    }


// 2桁のHEX文字列を引数として受け取り
// 0から1の範囲に正規化された数値として返す関数
function normalizedFromHex(hex) {
    // 16進数を10進数に変換
    const decimalValue = parseInt(hex, 16)
    // 0から255の範囲を0から1の範囲に正規化
    const normalizedValue = decimalValue / 255
    // 制度を小数点以下第2位までに調整
    const normalizedValueFixed = Number(normalizedValue.toFixed(2))
    return normalizedValueFixed
}

// Test
// console.log(normalizedFromHex('FF')) // 1
// console.log(normalizedFromHex('CC')) // 0.8
// console.log(normalizedFromHex('03')) // 0.01
// console.log(normalizedFromHex('00')) // 0



// 2桁のHEX文字列をuint8（0から255の範囲の整数）に変換する関数
function hexToUint8(twoDigitsHex) {
    // 入力が2桁の16進数文字列であることを確認
    if (!/^[0-9A-Fa-f]{2}$/.test(twoDigitsHex)) {
        return "Invalid hex string"
    }
    // 16進数文字列を10進数の整数に変換
    const num = parseInt(twoDigitsHex, 16)
    return num
}

// 6桁のHEX文字列をRGBオブジェクトに変換する関数
function hexToRgbMap(sixDigitsHex) {
    // 入力が6桁の16進数文字列であることを確認
    if (!/^[0-9A-Fa-f]{6}$/.test(sixDigitsHex)) {
        return "Invalid hex string"
    }
    // 文字列を2桁ずつに分割
    const r = sixDigitsHex.substring(0, 2)
    const g = sixDigitsHex.substring(2, 4)
    const b = sixDigitsHex.substring(4, 6)

    // 各色をuint8に変換してオブジェクトを作成
    return new Map([
        ['r', hexToUint8(r)],
        ['g', hexToUint8(g)],
        ['b', hexToUint8(b)]
    ])
}

// // テスト
// console.log(hexToUint8("00"))  // 0
// console.log(hexToUint8("FF"))  // 255
// console.log(hexToRgbMap("000000"))  // { r: 0, g: 0, b: 0 }
// console.log(hexToRgbMap("FFFFFF"))  // { r: 255, g: 255, b: 255 }
// console.log(hexToRgbMap("FF8000"))  // { r: 255, g: 128, b: 0 }

function hexToRgb(hexStr) {
    const rgbMap = hexToRgbMap(tryDeleteHash(hexStr))
    return `rgb(${[...rgbMap.values()].join(',')})`
}

