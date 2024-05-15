function encodeGroupColors(linesDataMap){
    const encodedColors = new Map();

    for (let linesData of linesDataMap.values()) {

        let colorsStr = ""

        // Normalize three color values
        const gStroke           = hexExpandTo6(linesData.g_stroke.slice(1)) // Remove '#'
        const gOpacity       = normalizedToHex(linesData.g_opacity)         // Number to Hex
        const gStrokeOpacity = normalizedToHex(linesData.g_stroke_opacity)  // Number to Hex

        // Merge
        colorsStr = gStroke + gOpacity + gStrokeOpacity
        console.log("colorsStr: ", colorsStr)

        // Shorten if could, 10 chars => 5 chars
        colorsStr = hexShortenFrom10(colorsStr)

        // Set into Map
        encodedColors.set(linesData.g_id, colorsStr)
    }
    return encodedColors
}
