import { tryDeleteHash }  from 'color-formatter/hex-shorten'
import { hexExpandToSix } from 'color-formatter/hex-expand'

export
    { normalizedFromHex
    , hexToUint8
    , hexToRgbMap
    , hexToRgb
    }


// 2桁のHEX文字列を引数として受け取り
// 0から1の範囲に 正規化された数値として 返す関数
function normalizedFromHex(hex) {
    // 16進数を 10進数に変換
    const decimalValue = parseInt(hex, 16)
    // 0から255の範囲を 0から1の範囲 に 正規化
    const normalizedValue = decimalValue / 255
    // 精度を 小数点以下第2位まで に 調整
    const normalizedValueFixed = Number(normalizedValue.toFixed(2))
    return normalizedValueFixed
}

// Test
// console.log(normalizedFromHex('FF')) // 1
// console.log(normalizedFromHex('CC')) // 0.8
// console.log(normalizedFromHex('03')) // 0.01
// console.log(normalizedFromHex('00')) // 0



// 2桁のHEX文字列を uint8（0から255の範囲の整数）に 変換する関数
function hexToUint8(twoDigitsHex) {
    // 入力が 2桁の16進数文字列 であることを確認
    if (!/^[0-9A-Fa-f]{2}$/.test(twoDigitsHex)) {
        return "Invalid hex string"
    }
    // 16進数文字列を 10進数の整数に変換
    const num = parseInt(twoDigitsHex, 16)
    return num
}

// 3|6桁のHEX文字列を RGBオブジェクトに 変換する関数
function hexToRgbMap(threeOrSixDigitsHex) {
    const hexWithoutHash = tryDeleteHash(threeOrSixDigitsHex)
    const sixDigitsHex = hexExpandToSix(hexWithoutHash)

    // 入力が 6桁の16進数文字列 であることを確認
    if (!/^[0-9A-Fa-f]{6}$/.test(sixDigitsHex)) {
        return "Invalid hex string"
    }
    // 文字列を 2桁ずつに分割
    const r = sixDigitsHex.substring(0, 2)
    const g = sixDigitsHex.substring(2, 4)
    const b = sixDigitsHex.substring(4, 6)

    // 各色をuint8に変換して オブジェクトを作成
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

