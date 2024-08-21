import { normalizedFromHex } from 'color-formatter/normalized-from-hex'
import { hexToRgbMap }       from 'color-formatter/normalized-from-hex'

// Convert 10 digits hex to three group colors as Object

// 10 digits hex string will convert to:
// [0-5] g_stroke         = 6 digits hex (with '#' prefix)
// [6-7] g_opacity        = [0-1] number
// [8-9] g_stroke_opacity = [0-1] number

// Input : "ffffffffff"
// Output: groupColors: {g_stroke_hex: '#ffffff', g_stroke_rgb: rgb(255,255,255), g_opacity: 1, g_stroke_opacity: 1}

export function decodeGroupColors(tenDigitsHex) {

    // Convert
    const stroke_hex = tenDigitsHex.slice(0, 6)
    const strokeRgbMap = hexToRgbMap(stroke_hex)
    const strokeRgbStr = `rgb(${[...strokeRgbMap.values()].join(',')})`
    const opacity = normalizedFromHex(tenDigitsHex.slice(6, 8))
    const strokeOpacity = normalizedFromHex(tenDigitsHex.slice(8))

    return {
        g_stroke_hex    : '#' + stroke_hex,
        g_stroke_rgb    : strokeRgbStr,
        g_opacity       : opacity,
        g_stroke_opacity: strokeOpacity
    }
}