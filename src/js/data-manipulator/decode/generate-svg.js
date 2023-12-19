function generateSvg(artworkDataMap, strokesValuesMap, decodedRelDvalsMap) {

    console.log('strokesValuesMap!!!: ', strokesValuesMap)
    console.log('decodedRelDvalsMap!!!: ', decodedRelDvalsMap)
    // Read the values from Artwork Data
    const uint_n = artworkDataMap.get('uint_n')                           // 5
    const viewboxValue = getViewBoxValue(artworkDataMap.get('grid_size')) // '0 0 31 31'
    const artworkIdValue = artworkDataMap.get("artwork_id")               // '202308_001'
    const rectFillValue = artworkDataMap.get("bg_color")                  // '9999'


    // Generate header and other (exclude strokes) tags strings

    const headerTags = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewboxValue}" shape-rendering="crispEdges">
        <title>${artworkIdValue}</title>`

    // Open <g> tag for clip-path
    const clipPathGroupOpen = '    <g clip-path="url(#clipShape)">'

    const backgroundRect = `        <rect width="100%" height="100%" fill="#${rectFillValue}" />`

    // Close </g> tag for clip-path
    const clipPathGroupClose = '    </g>'

    // Trimming shape <defs> tag (has no variables)
    const trimmingShapeDefs = `    <defs>
            <clipPath id="clipShape">
                <rect width="100%" height="100%" />
            </clipPath>
        </defs>`

    const svgClose = '</svg>'

    const tabSpace = '    ' // Four spaces
    //////////////////////////////////////////////


    // Strokes tags

    let wholeColorStrokesTags = []

    console.log('strokesValuesMap: ', strokesValuesMap)

    //    const strokesValuesMap = values.get("groupedStrokes")
    for (let [groupId, v] of strokesValuesMap) {

        // Generate stroke color group
        const groupColors = v.group_colors

        const colorGroupTagOpen = tabSpace.repeat(2)
            + `<g stroke="${groupColors['g_stroke']}" opacity="${groupColors['g_opacity']}" stroke-opacity="${groupColors['g_stroke-opacity']}">`
        //         <g stroke="#000000" opacity="1" stroke-opacity="1">

        const colorGroupTagClose = tabSpace.repeat(2) + '</g>'
        //         </g>

    }
}








function getViewBoxValue(gridSize) {
    width = gridSize.split('x')[0]
    height = gridSize.split('x')[1]
    return `0 0 ${width} ${height}`
}