// Convert 10 digits hex to three group colors as Object

// 10 digits hex string will convert to:
// [0-5] g_stroke         = 6 digits hex (with '#' prefix),
// [6-7] g_opacity        = [0-1] number,
// [8-9] g_stroke-opacity = [0-1] number

// Input : "ffffffffff"
// Output: group_colors: {g_stroke: '#ffffff', g_opacity: 1, g_stroke-opacity: 1}

function decodeColors(tenDigitsHex) {
    const groupColors = new Object()

    // Convert
    const stroke = '#' + tenDigitsHex.slice(0, 6)
    const opacity = normalizedFromHex(tenDigitsHex.slice(6, 8))
    const strokeOpacity = normalizedFromHex(tenDigitsHex.slice(8))

    // Set into Object
    groupColors["g_stroke"]         = stroke
    groupColors["g_opacity"]        = opacity
    groupColors.g_stroke_opacity = strokeOpacity
    return groupColors
}