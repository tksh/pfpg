import { hexToRgbArr
       , rgbStringify }    from 'color-formatter/normalized-from-hex'
import { rgbToHex
       , rgbStrToRgbArr  } from 'color-formatter/normalized-to-hex'

export
    { convertColorFormat
    , convertColorFormatForArray
    , convertToRgbArr
    }


// 単一の色情報の文字列を指定の形式に変換する
function convertColorFormat(color, colorFormat) {
    const currentFormat = detectColorFormat(color)
    if (currentFormat === colorFormat) {
        // 形式が一致している場合は何もせずに元の値を返す
        return color
    } else {
        // 形式が一致していない場合は変換処理を行う
        if (colorFormat === 'rgb') {
            return rgbStringify(hexToRgbArr(color)) // HEXからRGBへの変換関数を呼び出す
        } else {
            return rgbToHex(color) // RGBからHEXへの変換関数を呼び出す
        }
    }
}

// 色情報の文字列の配列を指定の形式に変換する
function convertColorFormatForArray(strokeArr, colorFormat) {
    return strokeArr.map(color => convertColorFormat(color, colorFormat))
}

// RGB形式かHEX形式かを判定する関数
function detectColorFormat(colorString) {
    return colorString.startsWith('rgb') ? 'rgb' : 'hex'
}


// Convert input to RGB array (handles both RGB and HEX formats)
function convertToRgbArr(colorString) {
    const currentFormat = detectColorFormat(colorString)
    if (currentFormat === 'rgb') {
        return rgbStrToRgbArr(colorString) // rgb string => rgb array
    } else {
        return hexToRgbArr(colorString)    // hex string => rgb array
    }
}