// Argument SVG is a set of element and string as object
// Returned SVG is a just string only
function svgWithNewShapeViewbox(shape, hasCropSideMargins, svg) {

    // Update 'viewBox'

    // Get back original 'viewBox' value when
    // 1. the shapes excepts 'squircleSlimmed' selected, or
    // 2. 'squircleSlimmed' and not checked for 'Crop side margins' checkbox

    console.log('hasCropSideMargins: ', hasCropSideMargins) // boolean, true=cropped[checked], false=un-cropped[!checked]

    if (shape == 'squircleSlimmed' && hasCropSideMargins == true) {
        return viewboxSlimmed(svg)
    } else { // shape == 'square | circle | squircle'
        console.log(`"viewBox" value will be replaced to original size, \n
                      because selected shape is ${shape}, and hasCropSideMargins is ${hasCropSideMargins}`)
        return viewboxUnSlimmed(svg)
    }

}

// Change the viewBox size fit to Squircle, slimmed.
// And textarea replaced as it.
function viewboxSlimmed(svg) {
    const viewboxStr = getViewboxStr(svg.string)
    const viewboxValues = extractViewboxValues(viewboxStr)

    const slimmedWidthValues = getSlimmedViewboxXW(svg.string)
    //console.log('slimmedWidthValues.x: ', slimmedWidthValues.x) // e.g.: 1.55
    //console.log('slimmedWidthValues.w: ', slimmedWidthValues.w) // e.g.: 27.9

    // Generate new string
    const newViewboxString = `viewBox="${slimmedWidthValues.x} ${viewboxValues.y} ${slimmedWidthValues.w} ${viewboxValues.h}"`
    console.log('newViewboxString: ', newViewboxString) // e.g.: viewBox="1.55 0 27.9 31"

    // Replace the textarea value with new string
    const patternForViewboxStr = /viewBox="([^"]+)"/; // viewBox属性を抽出する正規表現
    const updatedSVG = svg.string.replace(patternForViewboxStr, newViewboxString);
    svg.element.value = updatedSVG

    return updatedSVG
}



// Get the viewBox string
function getViewboxStr(svgString) {
    const patternForViewboxStr = /viewBox="([^"]+)"/; // viewBox属性を抽出する正規表現
    const matches = patternForViewboxStr.exec(svgString);

    // 配列の 0番目には全体のマッチ結果, 1番目にはグルーピングした部分
    const viewboxStr = matches[0]        // e.g.: viewBox="0 0 31 31"
    //const vieBoxValueStr = matches[1]  // e.g.: 0 0 31 31

    return viewboxStr
}

// Get the slimmed width size and 'x' position (= same number as how much reduced each sides)
function getSlimmedViewboxXW(svgString) {
    const patternToGetSquircleSlimmedPathStr = /<path d="M ([\d\.]+),.*Q.*T ([\d\.]+),/; // viewBox属性を抽出する正規表現
    const matches = patternToGetSquircleSlimmedPathStr.exec(svgString);
    //console.log('matches: ', matches)       // e.g.: Array(3) [ '<path d="M 1.55,15.5Q 1.24,0 15.5,0T 29.45,', "1.55", "29.45" ]
    //console.log('matches[1]: ', matches[1]) // e.g.: 1.55
    //console.log('matches[2]: ', matches[2]) // e.g.: 29.45

    return {
        x: toFixedTrimmed(parseFloat(matches[1])),             // viewBox start position | e.g.: 1.55
        w: toFixedTrimmed(parseFloat(matches[2] - matches[1])) // new viewBox width size | e.g.: 27.9 (= 29.45 - 1.55)
    }
}

// Get viewBox four numbers as Object
function extractViewboxValues(viewBoxString) {
    // Use a regular expression to match the four numbers in the viewBox string
    const match = viewBoxString.match(/viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/);

    // Check if the match was successful
    if (match && match.length === 5) {
        // Extract the four numbers and return them as an object
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            w: parseFloat(match[3]),
            h: parseFloat(match[4])
        };
    } else {
        // Return null or throw an error if the match was not successful
        return null;
    }
}
// e.g.: 'viewBox="2.325 0 26.35 31"' => Object { x: 2.325, y: 0, w: 26.35, h: 31 }



/////// When un-check the checkbox, Get back the viewBox as square ///////

function viewboxUnSlimmed(svg) {
    console.log('svg: ', svg)
    //console.log('svg.string: ', svg.string)
    //console.log('svg.element: ', svg.element)

    // Read original artwork data from url params
    const isDataManipulatorOrIndexBool = false
    const urlParamsAsTwoMaps = readUrlParamsAsMaps(isDataManipulatorOrIndexBool)
    const artworkDataMap = urlParamsAsTwoMaps.artwork_data
    // e.g.: Map(4) {'artwork_id' => '202308_001', 'grid_size' => '31x31', 'uint_n' => 5, 'bg_color' => '9999'}

    const gridSize = artworkDataMap.get('grid_size') // e.g: '31x31'
    const splitByX = gridSize.split('x')             // e.g.: '31', '31'

    // Generate new string with original viewBox size
    const originalViewboxString = `viewBox="0 0 ${splitByX[0]} ${splitByX[1]}"` // e.g.: viewBox="0 0 31 31"

    // Replace the textarea value with new string
    const patternForViewboxStr = /viewBox="([^"]+)"/
    const updatedSVG = svg.string.replace(patternForViewboxStr, originalViewboxString)
    svg.element.value = updatedSVG

    return updatedSVG
}