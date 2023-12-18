function encodeColors(strokesAttrsMap){
    const encodedColorsByGroup = new Map();

    // Color attrs for group like ...
    // "g_stroke": "#000",
    // "g_opacity": 1,
    // "g_stroke-opacity": 1,

    for ([groupId, attrsObj] of strokesAttrsMap) {

        let colorsStr = ""

        // Normalize three color values
        const gStroke = expandHex(attrsObj.g_stroke.slice(1))                // Remove '#'
        const gOpacity = normalizedToHex(attrsObj.g_opacity)                 // Number to Hex
        const gStrokeOpacity = normalizedToHex(attrsObj["g_stroke-opacity"]) // Number to Hex

        // Merge
        colorsStr = gStroke + gOpacity + gStrokeOpacity
        console.log("colorsStr: ", colorsStr)

        // Shorten if could, 10 chars => 5 chars
        colorsStr = hexShortenFrom10(colorsStr)

        // Set into Map
        encodedColorsByGroup.set(groupId, colorsStr)
    }
    return encodedColorsByGroup
}
