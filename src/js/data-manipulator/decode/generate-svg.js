// Output SVG string like:

// In relative and merged style

// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="crispEdges">
//     <title>202308_001</title>
//     <defs>
//         <clipPath id="clipShape">
//             <rect width="100%" height="100%" />
//         </clipPath>
//     </defs>
//     <g clip-path="url(#clipShape)">
//         <rect width="100%" height="100%" fill="#9999" />
//         <g stroke="#000000" opacity="1" stroke-opacity="1">
//             <g stroke-width="3">
//                 <path d="m1 0 0 26m3-26 0 25m3-25-1 ... 8 5m-8-19 3 2" />
//             </g>
//         </g>
//         <g stroke="#000000" opacity="1" stroke-opacity="1">
//             <g stroke-width="2">
//             ...
//                 <path d="m12 21 0 2m-1-19-2 3m2-1-1 2m1 3-2 3m2 1-1 1m2 5 2 1m-1 1 2 1" />
//             </g>
//         </g>
//     </g>
// </svg>


// In absolute and separate style

// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="crispEdges">
//     <title>202308_001</title>
//     <defs>
//         <clipPath id="clipShape">
//             <rect width="100%" height="100%" />
//         </clipPath>
//     </defs>
//     <g clip-path="url(#clipShape)">
//         <rect width="100%" height="100%" fill="#9999" />
//         <g stroke="#000000" opacity="1" stroke-opacity="1">
//             <g stroke-width="3">
//                 <path d="M 1 0 L 1 26" />
//                 <path d="M 4 0 L 4 25" />
//                 ...
//                 <path d="M 12 21 L 14 22" />
//                 <path d="M 13 23 L 15 24" />
//             </g>
//         </g>
//     </g>
// </svg>




function generateSvg(isRelOrAbsBool, basicDataMap, strokesValuesMap, decodedRelDvalsMap, decodedAbsDvalsMap) {

    // Read the values from Basic Data
    const viewboxValue = getViewBoxValue(basicDataMap.get('grid_size')) // e.g. '0 0 31 31'
    const artworkIdValue = basicDataMap.get("artwork_id")               // e.g. '202308_001'
    const rectFillValue = basicDataMap.get("bg_color")                  // e.g. '9999'

    // Set the tab size
    const tabSpace = '    ' // Four spaces


    // Generate tags except stroke tags
    const tagsBeforeStrokes = generateTagsBeforeStrokes(tabSpace, viewboxValue, artworkIdValue, rectFillValue)
    const tagsAfterStrokes = generateTagsAfterStrokes(tabSpace)


    // Strokes tags ( group-id-<g> and <path> )

    // Generate the open and close group-id-<g> tags
    const gTagOpenByGroup = generateGTagOpenByGroup(tabSpace, strokesValuesMap)
    const gTagCloseByGroup = generateGTagCloseByGroup(tabSpace, strokesValuesMap)

    // Generate the <path> tags (as relative or absolute, switched by isRelOrAbsBool)
    const pathTagsByGroup = generatePathTags(
        isRelOrAbsBool,
        tabSpace,
        strokesValuesMap,
        decodedRelDvalsMap,
        decodedAbsDvalsMap
    )

    // Merge the group-id-<g> tags and <path> tags
    const strokesTags = mergeGAndPathTags(
        strokesValuesMap,
        gTagOpenByGroup,
        pathTagsByGroup,
        gTagCloseByGroup
    )

    // Join the whole tags
    const wholeSvgTags = [...tagsBeforeStrokes, ...strokesTags, ...tagsAfterStrokes]
    return wholeSvgTags.join('\n')
}



function generateRelPathTags(tabSpace, strokesValuesMap, decodedRelDvalsMap) {

    const relPathTagsByGroup = new Map()

    for (let [groupId, v] of strokesValuesMap) {
        const dvalsObj = decodedRelDvalsMap.get(groupId)
        console.log('dvalsObj: ', dvalsObj) // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}

        const widthArr = v.width_count.width // list of stroke-width
        const firstlineArr = v.width_count.firstline
        const lastlineArr = v.width_count.lastline

        let pathTagUnderGroup = [] // Group has one or more number of stroke-width

        for (let i = 0; i < widthArr.length; i++) { // loop for each stroke-width
            const width = widthArr[i]
            const firstlineIndex = firstlineArr[i] - 1 // Subtract 1 to convert as index number
            const lastlineIndex = lastlineArr[i] - 1   // Subtract 1 to convert as index number


            // Open and close <path> tag
            const pathTagOpenWithWidth = tabSpace.repeat(3) + `<path stroke-width="${width}" d="`
            // e.g. '            <path stroke-width="3" d="'
            const pathTagClose = '" />'
            // e.g. '" />'

            // d values for <path> tag
            let pathTagDval = ""
            for (let i = firstlineIndex; i <= lastlineIndex; i++) {
                let eachDval = `m${dvalsObj.x1[i]} ${dvalsObj.y1[i]} ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}`
                eachDval = eachDval.replace(/ -/g, '-') // Delete unnecessary spaces before the minus mark '-'
                pathTagDval += eachDval
            }

            // Join the whole <path> tag parts
            pathTag = pathTagOpenWithWidth + pathTagDval + pathTagClose
            // e.g. "                <path stroke-width="3" d=\"m1 0 0 26m3-26 0 25m ... m0-1 2 4m-1-1 8 5\" />"

            // Push the <path> tag string into same color group array
            pathTagUnderGroup.push(pathTag)
            // pathTagUnderGroup.push(pathTag.join('\n'))
        }
        // Set whole tags string that under same color group as value with group ID key
        const wholeTagsUnderGroup = pathTagUnderGroup.join('\n')
        relPathTagsByGroup.set(groupId, wholeTagsUnderGroup)
    }
    // console.log('relPathTagsByGroup: ', relPathTagsByGroup)
    // Map(5) { 
    //     1 => '            <g stroke-width="3">\n                <path d="m1 0 0 26m3 ... " />\n            </g>'
    //     2 => '            <g stroke-width="2">\n                <path d="m0 0 31 1m- ... " />\n            </g>'
    //     3 => '            <g stroke-width="1">\n                <path d="m1 26-1 1m7 ... " />\n            </g>'
    //     4 => '            <g stroke-width="1">\n                <path d="m14 6-5 2m0 ... " />\n            </g>'
    //     5 => '            <g stroke-width="1">\n                <path d="m12 21 0 2m ... " />\n            </g>'
    // }

    return relPathTagsByGroup
}



function generateAbsPathTags(tabSpace, strokesValuesMap, decodedAbsDvalsMap) {

    const absPathTagsByGroup = new Map()

    for (let [groupId, v] of strokesValuesMap) {
        const dvalsObj = decodedAbsDvalsMap.get(groupId)
        console.log('dvalsObj: ', dvalsObj) // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}

        const widthArr = v.width_count.width // list of stroke-width
        const firstlineArr = v.width_count.firstline
        const lastlineArr = v.width_count.lastline

        let gAndPathTagsUnderGroup = [] // Group has one or more number of stroke-width

        for (let i = 0; i < widthArr.length; i++) { // loop for each stroke-width
            const width = widthArr[i]
            const firstlineIndex = firstlineArr[i] - 1 // Subtract 1 to convert as index number
            const lastlineIndex = lastlineArr[i] - 1   // Subtract 1 to convert as index number

            // Generate open and close <g> tags
            const widthGTagOpen = tabSpace.repeat(3) + `<g stroke-width="${width}">`
            // e.g. '            <g stroke-width="3">'
            const widthGTagClose = tabSpace.repeat(3) + '</g>'
            // e.g. '            </g>'

            // Define the array with open <g> tag
            let eachWidthTags = [widthGTagOpen]

            // Generate to append the separated <path> tags with d values
            for (let i = firstlineIndex; i <= lastlineIndex; i++) {
                let pathTag =

                    tabSpace.repeat(4) +
                    `<path d="M ${dvalsObj.x1[i]} ${dvalsObj.y1[i]} L ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}" />`
                    // e.g. <path d="M 1 0 L 1 26" />

                    eachWidthTags.push(pathTag)
            }

            // Push the close <g> tag
            eachWidthTags.push(widthGTagClose)

            // Push the <g> and <path> tags as joined string into same color group array
            gAndPathTagsUnderGroup.push(eachWidthTags.join('\n'))
        }
        // Set whole tags string that under same color group as value with group ID key
        const wholeTagsUnderGroup = gAndPathTagsUnderGroup.join('\n')
        absPathTagsByGroup.set(groupId, wholeTagsUnderGroup)
    }
    console.log('absPathTagsByGroup: ', absPathTagsByGroup)
    // Map(5) {
    //     1 => '            <path stroke-width="3" d="M 1 0 L 1 26" />\n                <path d="M 4 0  ... " />\n            </g>',
    //     2 => '            <path stroke-width="2" d="M 0 0 L 31 1" />\n                <path d="M 9 3  ... " />\n            </g>',
    //     3 => '            <path stroke-width="1" d="M 1 26 L 0 27" />\n                <path d="M 7 7 ... " />\n            </g>',
    //     4 => '            <path stroke-width="1" d="M 14 6 L 9 8" />\n                <path d="M 9 6  ... " />\n            </g>',
    //     5 => '            <path stroke-width="1" d="M 12 21 L 12 23" />\n                <path d="M 1 ... " />\n            </g>',
    // }
    return absPathTagsByGroup
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
    const baseRect = tabSpace.repeat(2) + `<rect width="100%" height="100%" fill="#${rectFillValue}" />`

    return [svgOpen, title, trimmingShapeDefs, clipPathGroupOpen, baseRect]
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
