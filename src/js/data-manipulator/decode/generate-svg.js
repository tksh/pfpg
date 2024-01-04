/////// 0. Get the artwork data
/////// 1. Generate the header tags (before <path> tags)
/////// 2. Generate the strokes tags
/////// 2.1 Generate the <g>> tags
/////// 2.2 Generate the <path> tags as relative or absolute
/////// 2.3 Merge the <g> and <path> tags
/////// 3. Merge and join the whole SVG tags


function generateSvg(isRelOrAbsBool, artworkDataMap, strokesValuesMap, decodedRelDvalsMap, decodedAbsDvalsMap) {

    // Read the values from Artwork Data
    const viewboxValue = getViewBoxValue(artworkDataMap.get('grid_size')) // '0 0 31 31'
    const artworkIdValue = artworkDataMap.get("artwork_id")               // '202308_001'
    const rectFillValue = artworkDataMap.get("bg_color")                  // '9999'

    // Set the tab size
    const tabSpace = '    ' // Four spaces


    // Generate the header and other (exclude <g> and <path>) tags
    const tagsBeforeStrokes = generateTagsBeforeStrokes(tabSpace, viewboxValue, artworkIdValue, rectFillValue)
    const tagsAfterStrokes = generateTagsAfterStrokes(tabSpace)


    // Strokes tags ( <g> and <path> )

    // Generate the open and close <g> tags
    const gTagOpenByGroup = generateGTagOpenByGroup(tabSpace, strokesValuesMap)
    const gTagCloseByGroup = generateGTagCloseByGroup(tabSpace, strokesValuesMap)


    // Generate the <path> tags as relative or absolute
    const pathTagsByGroup = generatePathTags(isRelOrAbsBool, tabSpace, strokesValuesMap, decodedRelDvalsMap, decodedAbsDvalsMap)


    // Merge the <g> tags and <path> tags
    const strokesTags = mergeGAndPathTags(strokesValuesMap, gTagOpenByGroup, pathTagsByGroup, gTagCloseByGroup)

    // Relative:
    // console.log('strokesTags: ', strokesTags)
    //  0: "        <g stroke=\"#000000\" opacity=\"1\" stroke-opacity=\"1\">"
    //  1: "            <path stroke-width=\"3\" d=\"m1 0 0 26m3-26 0 25m3-25-1 23m0-8 4 6m ...
    //  2: "        </g>"
    //  3: "        <g stroke=\"#000000\" opacity=\"1\" stroke-opacity=\"1\">"
    //  4: "            <path stroke-width=\"2\" d=\"m0 0 31 1m-22 2 5-3m-7 8 2-6m-3 8 2 7m ...
    //  5: "        </g>"
    //  6: "        <g stroke=\"#000000\" opacity=\"1\" stroke-opacity=\"1\">"
    //  7: "            <path stroke-width=\"1\" d=\"m1 26-1 1m7-20 1 4m-1-6 1 4m-1 3 1-3m4 ...
    //  8: "        </g>"
    //  9: "        <g stroke=\"#eeeeee\" opacity=\"1\" stroke-opacity=\"1\">"
    // 10: "            <path stroke-width=\"1\" d=\"m14 6-5 2m0-2 5-2m-4 0 2-1m-1 6 0 1m2 ...
    // 11: "        </g>"
    // 12: "        <g stroke=\"#ffffff\" opacity=\"1\" stroke-opacity=\"1\">"
    // 13: "            <path stroke-width=\"1\" d=\"m12 21 0 2m-1-19-2 3m2-1-1 2m1 3-2 3m ...
    // 14: "        </g>"


    // Merge and join the whole SVG tags to return
    const wholeSvgTags = [...tagsBeforeStrokes, ...strokesTags, ...tagsAfterStrokes]
    return wholeSvgTags.join('\n')
}





function generateRelPathTags(tabSpace, strokesValuesMap, decodedRelDvalsMap) {

    const relPathTagsByGroup = new Map()

    for (let [groupId, v] of strokesValuesMap) {
        const dvalsObj = decodedRelDvalsMap.get(groupId)
        console.log('dvalsObj: ', dvalsObj) // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}

        const widthArr = v.width_count.width
        const firstlineArr = v.width_count.firstline
        const lastlineArr = v.width_count.lastline

        for (let i = 0; i < widthArr.length; i++) {
            const width = widthArr[i]
            const firstlineIndex = firstlineArr[i] - 1 // Subtract 1 to convert as index number
            const lastlineIndex = lastlineArr[i] - 1   // Subtract 1 to convert as index number

            //console.log('firstlineArr[i], firstlineIndex: ', firstlineArr[i], firstlineIndex)
            //console.log('lastlineArr[i], lastlineIndex: ', lastlineArr[i], lastlineIndex)

            const pathTagStart = tabSpace.repeat(3) + `<path stroke-width="${width}" d="`
            // '            <path stroke-width="3" d="'
            const pathTagEnd = '" />'
            // '" />'

            // Generate the path tag d values
            let pathTagDval = ""
            for (let i = firstlineIndex; i <= lastlineIndex; i++) {
                let eachDval = `m${dvalsObj.x1[i]} ${dvalsObj.y1[i]} ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}`
                eachDval = eachDval.replace(/ -/g, '-') // Delete unnecesally spaces before the minus mark '-'
                pathTagDval += eachDval
            }

            // Join the whole <path> tags
            eachWidthPathTag = pathTagStart + pathTagDval + pathTagEnd
            //console.log('eachWidthPathTag: ', eachWidthPathTag)
            // "            <path stroke-width=\"3\" d=\"m1 0 0 26m3-26 0 25m3-25-1 23m0-8 4 6m-2-1 0 3m-1-18 4-5m8 0 5 5m1-5 1 24m-2-9 0 7m4-22 0 25m2-25 0 27m-13 1 3 3m-16-7 4-2m14-22 2 9m2 2-3 6m-1-1 0 4m0-1 2 4m-1-1 8 5\" />"

            relPathTagsByGroup.set(groupId, eachWidthPathTag)
        }
    }
    //console.log('relPathTagsByGroup: ', relPathTagsByGroup)
    // 0: {1 => "            <path stroke-width=\"3\" d=\"m1 0 0 26m3-26 0 25m3-25-1 2 ... m-1-1 8 5\" />"}
    // 1: {2 => "            <path stroke-width=\"2\" d=\"m0 0 31 1m-22 2 5-3m-7 8 2-6 ... m1-8 0 2\" />"}
    // 2: {3 => "            <path stroke-width=\"1\" d=\"m1 26-1 1m7-20 1 4m-1-6 1 4m ... m21 17 2 3\" />"}
    // 3: {4 => "            <path stroke-width=\"1\" d=\"m14 6-5 2m0-2 5-2m-4 0 2-1m- ... m0 2 3-2\" />"}
    // 4: {5 => "            <path stroke-width=\"1\" d=\"m12 21 0 2m-1-19-2 3m2-1-1 2 ... m2 5 2 1\" />"}
    return relPathTagsByGroup
}




function generateAbsPathTags(strokesValuesMap) {

    const absPathTagsByGroup = new Map()

}





function getViewBoxValue(gridSize) {
    width = gridSize.split('x')[0]
    height = gridSize.split('x')[1]
    return `0 0 ${width} ${height}`
}

function generateTagsBeforeStrokes(tabSpace, viewboxValue, artworkIdValue, rectFillValue) {

    const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewboxValue}" shape-rendering="crispEdges">`
    const title = tabSpace.repeat(1) + `<title>${artworkIdValue}</title>`

    // Trimming shape <defs> tag (has no variables)
    const trimmingShapeDefs =
        tabSpace.repeat(1) + '<defs>' + '\n' +
        tabSpace.repeat(2) + '<clipPath id="clipShape">' + '\n' +
        tabSpace.repeat(3) + '<rect width="100%" height="100%" />' + '\n' +
        tabSpace.repeat(2) + '</clipPath>' + '\n' +
        tabSpace.repeat(1) + '</defs>'

    // clip-path: <rect> in <g>
    const clipPathGroupOpen = tabSpace.repeat(1) + '<g clip-path="url(#clipShape)">'
    const backgroundRect = tabSpace.repeat(2) + `<rect width="100%" height="100%" fill="#${rectFillValue}" />`

    return [svgOpen, title, trimmingShapeDefs, clipPathGroupOpen, backgroundRect]
}

function generateTagsAfterStrokes(tabSpace) {
    // Close </g> tag for clip-path
    const clipPathGroupClose = tabSpace.repeat(1) + '</g>'
    const svgClose = '</svg>'
    return [clipPathGroupClose, svgClose]
}


function generateGTagOpenByGroup(tabSpace, strokesValuesMap) {
    const gTagOpenByGroup = new Map()
    for (let [groupId, v] of strokesValuesMap) {
        // Generate stroke color group
        const groupColors = v.group_colors

        const colorGroupTagOpen = tabSpace.repeat(2)
            + `<g stroke="${groupColors['g_stroke']}" opacity="${groupColors['g_opacity']}" stroke-opacity="${groupColors['g_stroke-opacity']}">`
        //         <g stroke="#000000" opacity="1" stroke-opacity="1">

        gTagOpenByGroup.set(groupId, colorGroupTagOpen)

    }
    return gTagOpenByGroup
}

function generateGTagCloseByGroup(tabSpace, strokesValuesMap) {
    const gTagCloseByGroup = new Map()
    for (let [groupId, v] of strokesValuesMap) {
        const colorGroupTagClose = tabSpace.repeat(2) + '</g>'
        //         </g>
        gTagCloseByGroup.set(groupId, colorGroupTagClose)
    }
    return gTagCloseByGroup
}


function generatePathTags(isRelOrAbsBool, tabSpace, strokesValuesMap, decodedRelDvalsMap, decodedAbsDvalsMap) {
    if (isRelOrAbsBool === true) {         // true = relative and merged
        return generateRelPathTags(tabSpace, strokesValuesMap, decodedRelDvalsMap)
    } else if (isRelOrAbsBool === false) { // false = absolute and separated
        return generateAbsPathTags(tabSpace, strokesValuesMap, decodedAbsDvalsMap)
    }
}

function mergeGAndPathTags(strokesValuesMap, gTagOpenByGroup, pathTagsByGroup, gTagCloseByGroup) {
    const groupId = strokesValuesMap.keys()
    let strokesTags = []
    for (let id of groupId) {
        strokesTags.push(gTagOpenByGroup.get(id))
        strokesTags.push(pathTagsByGroup.get(id))
        strokesTags.push(gTagCloseByGroup.get(id))
    }
    return strokesTags
}
