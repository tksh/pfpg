import { normalizedFromHex
       , hexToRgbArr
       , rgbStringify
       , hexToUint8}              from 'color-formatter/normalized-from-hex'
import { addDecimalToZeroAndOne } from 'common-utils/format-as-float'


// Convert 10 digits hex to three group colors as Object

// 10 digits hex string will convert to:
// [0-5] g_stroke         = 6 digits hex (with '#' prefix)
// [6-7] gOpacity        = [0-1] number
// [8-9] gStrokeOpacity = [0-1] number

// Input : "ffffffffff"
// Output: groupColors: {g_strokeHex: '#ffffff', gStrokeRgbStr: rgb(255 255 255), gOpacity: 1, gStrokeOpacity: 1}

export function decodeGroupColors(tenDigitsHex) {

    // Convert
    const gStrokeHex = '#' + tenDigitsHex.slice(0, 6)
    const gStrokeRgbArr = hexToRgbArr(gStrokeHex)
    const gStrokeRgbStr = rgbStringify(gStrokeRgbArr)

    const gOpacityUint8 = hexToUint8(tenDigitsHex.slice(6, 8))
    const gOpacityFloat = normalizedFromHex(tenDigitsHex.slice(6, 8))
    const gOpacity = addDecimalToZeroAndOne(gOpacityFloat)

    const gStrokeOpacityUint8 = hexToUint8(tenDigitsHex.slice(8))
    const gStrokeOpacityFloat = normalizedFromHex(tenDigitsHex.slice(8))
    const gStrokeOpacity = addDecimalToZeroAndOne(gStrokeOpacityFloat)

    return {
        gStrokeHex,
        gStrokeRgbArr,
        gStrokeRgbStr,

        gOpacityUint8,
        gOpacityFloat,
        gOpacity,

        gStrokeOpacityUint8,
        gStrokeOpacityFloat,
        gStrokeOpacity
    }
}