import { tryAddHash }    from 'color-formatter/hex-expand'
import { tryDeleteHash } from 'color-formatter/hex-shorten'

export
    { normalizedToHex
    , uint8ToHex
    , rgbObjToHex
    , rgbStrToRgbArr
    , rgbToHex
    }

// 0から1の範囲に正規化された数値を引数として受け取り
// 2桁のHEX文字列として返す関数
function normalizedToHex(num) {
    // 数値が0から1の範囲にあるかチェックする
    if (num < 0 || num > 1) {
        // 範囲外であればエラーを返す
        return "Invalid number"
    }
    // 数値を255倍して整数にし、16進数に変換、
    // 2桁になるよう0埋めし、大文字に変換する
    return Math.round(num * 255)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()
}

// Test
// console.log(normalizedToHex(1))    // FF
// console.log(normalizedToHex(0.8))  // CC
// console.log(normalizedToHex(0.01)) // 03
// console.log(normalizedToHex(0))    // 00



// uint8（0から255の範囲の整数）を
// 2桁のHEX文字列に変換する関数
function uint8ToHex(num) {
    // 数値がuint8の範囲（0から255）にあるかチェックする
    if (num < 0 || num > 255 || !Number.isInteger(num)) {
        // 範囲外または整数でない場合はエラーを返す
        return "Invalid number"
    }
    // 整数を16進数に変換し、2桁になるよう0埋めし、大文字に変換する
    return num
        .toString(16)
        .padStart(2, '0')
        .toUpperCase()
}

// // Test
// console.log(uint8ToHex(0))    // 00
// console.log(uint8ToHex(1))    // 01
// console.log(uint8ToHex(255))  // FF

// // 0.0, 1.0 .., it does not make error.
// console.log(uint8ToHex(0.0))  // 00
// console.log(uint8ToHex(1.0))  // 01
// // JavaScriptでは、小数点以下が存在しない場合（たとえば 1.0 や 2.0 など）
// // その数値は整数と見なされ Number.isInteger(1.0) の結果が true になる



function rgbObjToHex(rgbDict) {
    const r = uint8ToHex(rgbDict.r)
    const g = uint8ToHex(rgbDict.g)
    const b = uint8ToHex(rgbDict.b)
    return r + g + b
}

//// Test
//const uint8_rgb_obj_1 = { 'r':0, 'g':0, 'b':0 }
//const uint8_rgb_obj_2 = { 'r':170, 'g':170, 'b':170 }
//const uint8_rgb_obj_3 = { 'r':255, 'g':255, 'b':255 }
//const uint8_rgb_obj_4 = { 'r':256, 'g':256, 'b':256 }
//console.log(rgbObjToHex(uint8_rgb_obj_1)) // 000000
//console.log(rgbObjToHex(uint8_rgb_obj_2)) // AAAAAA
//console.log(rgbObjToHex(uint8_rgb_obj_3)) // FFFFFF
//console.log(rgbObjToHex(uint8_rgb_obj_4)) // Invalid numberInvalid numberInvalid number


function rgbStrToRgbArr(rgbString) {
    // 正規表現で、カンマまたはスペースで区切られたRGB文字列の形式をチェック
    const regex = /^rgb\((\d+)[,\s]+(\d+)[,\s]+(\d+)\)$/
    const match = rgbString.match(regex)

    if (!match) {
        return "Invalid RGB string format"
    }

    // 正規表現の結果からRGB値を抽出し、オブジェクトを作成
    const [, r, g, b] = match

    return [ parseInt(r), parseInt(g), parseInt(b) ]
}

// // テスト
// console.log(rgbStrToRgbArr("rgb(170,170,170)"))      // Array(3) {170, 170, 170}
// console.log(rgbStrToRgbArr("rgb(255, 0, 0)"))        // Array(3) {255, 0, 0}
// console.log(rgbStrToRgbArr("rgb(100 200 50)"))       // Array(3) {100, 200, 50}
// console.log(rgbStrToRgbArr("rgb(100 200 50 0)"))     // Invalid RGB string format


// Array of uint8 rgb values convert to 6 digits hex string
// e.g.: Array(3) {170, 170, 170} => "AAAAAA"
function rgbArrToSixDigitsHex(rgbArr) {
    const rgbTwoDigitsHexArr = [...rgbArr].map(value => uint8ToHex(value))
    return rgbTwoDigitsHexArr.join('')
}

function rgbToHex(rgbStr) {
    const rgbArr = rgbStrToRgbArr(tryDeleteHash(rgbStr))
    const sixDigitsHex = rgbArrToSixDigitsHex(rgbArr)
    return tryAddHash(sixDigitsHex)
}

// test
// console.log(rgbToHex('rgb(127,127,127)'))  // '#7F7F7F'
