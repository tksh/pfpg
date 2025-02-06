import { isNonEmpty } from 'common-utils/is-non-empty'
import { TAB_SPACE }   from 'constants'

// Output SVG string like:

// In relative and merged style

// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="crispEdges">
//     <title>202308_001</title>
//     <defs>
//         <clipPath id="shape-to-trim">
//             <rect width="100%" height="100%" />
//         </clipPath>
//     </defs>
//     <g clip-path="url(#shape-to-trim)">
//         <g stroke="#000000" opacity="1" stroke-opacity="1">
//             <g stroke-width="3">
//                 <path d="m 1 0 0 26 m 3 -26 0 25 m 3 -25 -1 ... 8 5 m-8 -19 3 2" />
//             </g>
//         </g>
//         <g stroke="#000000" opacity="1" stroke -opacity="1">
//             <g stroke-width="2">
//             ...
//                 <path d="m 12 21 0 2 m  -1 -19 -2 3 m 2 -1 -1 2 m 1 3 -2 3 m 2 1 -1 1 m 2 5 2 1 m -1 1 2 1" />
//             </g>
//         </g>
//     </g>
// </svg>


// In absolute and separate style

// <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" shape-rendering="crispEdges">
//     <title>202308_001</title>
//     <defs>
//         <clipPath id="shape-to-trim">
//             <rect width="100%" height="100%" />
//         </clipPath>
//     </defs>
//     <g clip-path="url(#shape-to-trim)">
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




export function generateSvg(isRelative, decodedParams) {

    // Generate tags except stroke tags
    const tagsBeforeStrokes = generateTagsBeforeStrokes(decodedParams.basicData, decodedParams.sizeData)
    const tagsAfterStrokes = generateTagsAfterStrokes()


    // Strokes tags ( group-id-<g> and <path> )

    // Generate the open and close group-id-<g> tags
    const gTagOpenByGroups = generateGTagOpenByGroups(decodedParams.linesData)
    const gTagCloseByGroups = generateGTagCloseByGroups(decodedParams.linesData)

    // Generate the <path> tags (as relative or absolute, switched by isRelative)
    const pathTagsByGroups = generatePathTags(
        isRelative,
        decodedParams.linesData
    )

    // Merge the group-id-<g> tags and <path> tags
    const strokesTags = mergeGAndPathTags(
        decodedParams.linesData,
        gTagOpenByGroups,
        pathTagsByGroups,
        gTagCloseByGroups
    )

    // Join the whole tags
    const wholeSvgTags = [...tagsBeforeStrokes, ...strokesTags, ...tagsAfterStrokes]
    return wholeSvgTags.join('\n')
}



function generateRelPathTags(linesDataMap) {

    const relPathTagsByGroups = new Map()

    for (let [gId, v] of linesDataMap) {
        const dvalsObj = v.relDvalsObj
        console.log('dvalsObj: ', dvalsObj) // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}

        const widths     = v.widthsAndCounts.widths     // list of stroke-width
        const firstlineIndices = v.widthsAndCounts.firstlineIndices  // e.g.: Array(4) [ 1, 4, 8, 25 ]
        const lastlineIndices  = v.widthsAndCounts.lastlineIndices   // e.g.: Array(4) [ 3, 7, 24, 91 ]

        let pathTagUnderGroup = [] // Group has one or more number of stroke-width

        for (let i = 0; i < widths.length; i++) { // loop for each stroke-width
            const width = widths[i]
            const firstlineIndex = firstlineIndices[i] - 1 // Subtract 1 to convert as index number
            const lastlineIndex = lastlineIndices[i] - 1   // Subtract 1 to convert as index number


            // Open and close <path> tag
            const pathTagOpenWithWidth = TAB_SPACE.repeat(3) + `<path stroke-width="${width}" d="`
            // e.g. '            <path stroke-width="3" d="'
            const pathTagClose = '" />'
            // e.g. '" />'

            // d values for <path> tag
            let pathTagDval = ""
            for (let i = firstlineIndex; i <= lastlineIndex; i++) {
                let eachDval = `m ${dvalsObj.x1[i]} ${dvalsObj.y1[i]} ${dvalsObj.x2[i]} ${dvalsObj.y2[i]}`
                pathTagDval += eachDval
            }

            // Join the whole <path> tag parts
            const pathTag = pathTagOpenWithWidth + pathTagDval + pathTagClose

            // Push the <path> tag string into same color group array
            pathTagUnderGroup.push(pathTag)
            // pathTagUnderGroup.push(pathTag.join('\n'))
        }
        // Set whole tags string that under same color group as value with group ID key
        const wholeTagsUnderGroup = pathTagUnderGroup.join('\n')
        relPathTagsByGroups.set(gId, wholeTagsUnderGroup)
    }
    console.log('relPathTagsByGroups: ', relPathTagsByGroups)

    return relPathTagsByGroups
}



function generateAbsPathTags(linesDataMap) {

    const absPathTagsByGroups = new Map()

    for (let [gId, v] of linesDataMap) {
        const dvalsObj = v.absDvalsObj
        console.log('dvalsObj: ', dvalsObj) // {x1: Array(19), y1: Array(19), x2: Array(19), y2: Array(19)}

        const widths     = v.widthsAndCounts.widths     // list of stroke-width
        const firstlineIndices = v.widthsAndCounts.firstlineIndices  // e.g.: Array(4) [ 1, 4, 8, 25 ]
        const lastlineIndices  = v.widthsAndCounts.lastlineIndices   // e.g.: Array(4) [ 3, 7, 24, 91 ]

        let gAndPathTagsUnderGroup = [] // Group has one or more number of stroke-width

        for (let i = 0; i < widths.length; i++) {      // loop for each stroke-width
            const width = widths[i]
            const firstlineIndex = firstlineIndices[i] - 1   // Subtract 1 to convert as index number
            const lastlineIndex = lastlineIndices[i] - 1     // Subtract 1 to convert as index number

            // Generate open and close <g> tags
            const widthGTagOpen = TAB_SPACE.repeat(3) + `<g stroke-width="${width}">`
            // e.g. '            <g stroke-width="3">'
            const widthGTagClose = TAB_SPACE.repeat(3) + '</g>'
            // e.g. '            </g>'

            // Define the array with open <g> tag
            let eachWidthTags = [widthGTagOpen]

            // Generate to append the separated <path> tags with d values
            for (let i = firstlineIndex; i <= lastlineIndex; i++) {
                let pathTag =

                    TAB_SPACE.repeat(4) +
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
        absPathTagsByGroups.set(gId, wholeTagsUnderGroup)
    }
    console.log('absPathTagsByGroups: ', absPathTagsByGroups)

    return absPathTagsByGroups
}



function generateTagsBeforeStrokes(basicDataObj, sizeDataObj) {

    const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sizeDataObj.viewbox}" shape-rendering="crispEdges">`

    // Optional tags: <title>, <desc> and <metadata>
    const optionalTags = [
        { tag: 'title',    content: basicDataObj.title },
        { tag: 'desc',     content: basicDataObj.desc },
        { tag: 'metadata', content: addNewlineAndIndentation(basicDataObj.metadata) },
    ].filter(({ content }) => isNonEmpty(content))
        .map(({ tag, content }) => TAB_SPACE.repeat(1) + `<${tag}>${content}</${tag}>`)


    // Trimming shape <defs> tag (has no variables)
    const trimmingShapeDefs =
        TAB_SPACE.repeat(1) + '<defs>' + '\n' +
        TAB_SPACE.repeat(2) + '<clipPath id="shape-to-trim">' + '\n' +
        TAB_SPACE.repeat(3) + '<rect width="100%" height="100%" />' + '\n' +
        TAB_SPACE.repeat(2) + '</clipPath>' + '\n' +
        TAB_SPACE.repeat(1) + '</defs>'

    // clip-path: <rect> in <g>
    const clipPathGroupOpen = TAB_SPACE.repeat(1) + '<g clip-path="url(#shape-to-trim)">'

    return [svgOpen, ...optionalTags, trimmingShapeDefs, clipPathGroupOpen]
}

// Indentation justify for <metadata> contents
function addNewlineAndIndentation(inputLines) {
    // If there is no metadata content, keep it as it.
    if (!isNonEmpty(inputLines)) {
        return undefined
    }

    // inputLinesが文字列の場合は配列に変換
    let lines = typeof inputLines === 'string' ? inputLines.split('\n') : inputLines

    // 各行の先頭に インデントを追加
    const indentedLines = lines.map(line => `${TAB_SPACE.repeat(2)}${line}`)

    // 先頭と最後に 改行を追加して 結合後
    // `</metadata>`を 一つ分下げる為のインデントを 最後の改行の後に 加える
    const result = `\n${indentedLines.join('\n')}\n${TAB_SPACE.repeat(1)}`

    return result
}

function generateTagsAfterStrokes() {
    // Close </g> tag for clip-path
    const clipPathGroupClose = TAB_SPACE.repeat(1) + '</g>'
    const svgClose = '</svg>'
    return [clipPathGroupClose, svgClose]
}


function generateGTagOpenByGroups(linesDataMap) {
    const gTagOpenByGroups = new Map()
    for (let [gId, v] of linesDataMap) {
        // Get the values of group colors
        const groupColors = v.groupColors

        const colorGroupTagOpen = TAB_SPACE.repeat(2)
            + `<g id="${gId}" stroke="${groupColors.gStrokeRgbStr}" opacity="${groupColors.gOpacity}" stroke-opacity="${groupColors.gStrokeOpacity}">`
        //         <g id="0" stroke="#000000" opacity="1" stroke-opacity="1">

        gTagOpenByGroups.set(gId, colorGroupTagOpen)

    }
    return gTagOpenByGroups
}

function generateGTagCloseByGroups(linesDataMap) {
    const gTagCloseByGroups = new Map()
    for (let [gId, v] of linesDataMap) {
        const colorGroupTagClose = TAB_SPACE.repeat(2) + '</g>'
        //         </g>
        gTagCloseByGroups.set(gId, colorGroupTagClose)
    }
    return gTagCloseByGroups
}


function generatePathTags(isRelative, linesDataMap) {
    if (isRelative === true) {                                  // true = relative and merged
        return generateRelPathTags(linesDataMap)
    } else if (isRelative === false) {                          // false = absolute and separated
        return generateAbsPathTags(linesDataMap)
    }
}

function mergeGAndPathTags(linesDataMap, gTagOpenByGroups, pathTagsByGroups, gTagCloseByGroups) {
    const gId = linesDataMap.keys()
    let strokesTags = []
    for (let id of gId) {
        strokesTags.push(gTagOpenByGroups.get(id))
        strokesTags.push(pathTagsByGroups.get(id))
        strokesTags.push(gTagCloseByGroups.get(id))
    }
    return strokesTags
}
