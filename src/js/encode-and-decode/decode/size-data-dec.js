import { getUintN } from 'common-utils/get-uint-n'

// Return the object includes:
//   - width
//   - height
//   - viewbox
//   - uintN

// viewbox: string
// String value for 'viewBox'.
// The x and y positions of 'viewBox' are fixed at 0, formatted as '0 0 width height'.
// The [0]-indexed group contains one or two lines representing the canvas size.
// Values are calculated from absolute coordinates.
// Used in 'crop-side-margin.js'.

// uintN: number
// The 'N' in 'UIntNPortray'.
// Smallest power of two (in bits) that can represent the longer side length of the canvas.
// Used in 'bruteforce53-enc.js' and 'bigint64-enc.js'.


export function sizeDataDec(linesDataMapIndexZero) {
    console.log('linesDataMapIndexZero: ', linesDataMapIndexZero)
    // absDvalsObj: {x1: Array(2), y1: Array(2), x2: Array(2), y2: Array(2)}
    // encodedDvals: "NWrTPcKpRSjaX"
    // groupColors: {g_stroke: '#AAAAAA', g_opacity: 1, g_stroke_opacity: 1}
    // relDvalsObj: {x1: Array(2), y1: Array(2), x2: Array(2), y2: Array(2)}
    // threeFlags: (3) ['0', '1', '3']
    // widthAndCounts: {firstline: Array(1), lastline: Array(1), width: Array(1)}
    // [[Prototype]]: Object

    const absDvalsObj = linesDataMapIndexZero.absDvalsObj

    // Get the 'width' and 'height' attrs
    let sizeDataObj = calculateCanvasSize(absDvalsObj)

    // Define the 'viewBox' value
    // viewboxStartX and viewboxStartY represent the starting position of the viewBox,
    // which is always at the origin (0,0) in this context.
    const viewboxStartX = 0; // Starting X position of the viewBox
    const viewboxStartY = 0; // Starting Y position of the viewBox
    const viewboxStr = `${viewboxStartX} ${viewboxStartY} ${sizeDataObj.width} ${sizeDataObj.height}`

    // Get the uintN number
    const longerSideValue = Math.max(sizeDataObj.width, sizeDataObj.height)
    const uintN = getUintN(longerSideValue)

    // Add the 'viewBox' and 'uintN' attrs and include 'width' and 'height' for completeness
    sizeDataObj = { viewbox: viewboxStr, uintN: uintN, ...sizeDataObj }

    return sizeDataObj
}


function calculateCanvasSize(d) {
    //console.log('d: ', d)
    // e.g.:
    // x1: (2) [63, 64]
    // x2: (2) [63, 64]
    // y1: (2) [0, 0]
    // y2: (2) [127, 127]
    // [[Prototype]]: Object

    let width, height

    if (d.x1.length === 2) {
        // Vertical strokes
        if (d.x1[0] === d.x2[0]) {
            width  = d.x1[0] + d.x1[1]
            height = d.y1[0] + d.y2[0]
        }
        // Horizontal strokes
        else if (d.y1[0] === d.y2[0]) {
            width  = d.y1[0] + d.y1[1]
            height = d.x1[0] + d.x2[0]
        }
    }

    else if (d.x1.length === 1) {
        // Vertical stroke
        if (d.x1[0] === d.x2[0]) {
            width  = d.y1[0] + d.y2[0]
            height = d.x1[0] + d.x2[0]
        }
        // Horizontal stroke
        else if (d.y1[0] === d.y2[0]) {
            width  = d.x1[0] + d.x2[0]
            height = d.y1[0] + d.y2[0]
        }
    }

    else {
        console.error("Invalid coordinates.")
    }

    return { width, height }
}

/*
// Test

// Longer side value is odd number => Base-canvas made by two strokes

// 127 x 127 (square, from top to bottom strokes)
const d_twoStrokes_topToBottom = {
    x1: [63, 64],
    y1: [0, 0],
    x2: [63, 64],
    y2: [127, 127]
}
const strokeWidth_twoStrokes_topToBottom = [127, 127]

// 255 x 127 (landscape, from bottom to top strokes)
const d_twoStrokes_bottomToTop = {
    x1: [127, 128],
    y1: [127, 127],
    x2: [127, 128],
    y2: [0, 0]
}
const strokeWidth_twoStrokes_bottomToTop = [255, 255]


// Longer side value is even number => Base-canvas made by one stroke

// 79 x 128 (portrait, from left to right stroke)
const d_oneStroke_leftToRight = {
    x1: [0],
    y1: [64],
    x2: [79],
    y2: [64]
}
const strokeWidth_oneStroke_leftToRight = [128]

// 128 x 128 (square, from right to left stroke)
const d_oneStroke_rightToLeft = {
    x1: [128],
    y1: [64],
    x2: [0],
    y2: [64]
}
const strokeWidth_oneStroke_rightToLeft = [128]

console.log(calculateCanvasSize(d_twoStrokes_topToBottom, strokeWidth_twoStrokes_topToBottom))
console.log(calculateCanvasSize(d_twoStrokes_bottomToTop, strokeWidth_twoStrokes_bottomToTop))
console.log(calculateCanvasSize(d_oneStroke_leftToRight, strokeWidth_oneStroke_leftToRight))
console.log(calculateCanvasSize(d_oneStroke_rightToLeft, strokeWidth_oneStroke_rightToLeft))
*/