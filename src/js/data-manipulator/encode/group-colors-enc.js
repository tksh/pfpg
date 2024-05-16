function encodeGroupColors(){
    // Read the lines data from .json as Map()
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')

    const encodedStrByGroup = new Map();

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
        encodedStrByGroup.set(linesData.g_id, colorsStr)
    }
    return encodedStrByGroup
}
