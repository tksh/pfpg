import { decodeUrlParams } from 'common-utils/read-url-params'
import { strToSha256 }     from 'utils/hashing'

export async function calculateArtworkHash() {

    // Start time
    const calcArtworkHashStartTime = performance.now()
    console.log('Start the calculating artwork hash ...')

    // Retrieve URL parameters and extract lines data
    const decodedParams = decodeUrlParams()
    const linesData = decodedParams.linesData

    // Generate a consolidated numeric sequence by processing the entire lines data
    const compositeSequence = generateCompositeSequence(linesData)
    console.log("compositeSequence: ", compositeSequence)                // 01701701702552551272_6364 ...
    console.log("compositeSequence.length: ", compositeSequence.length)  // e.g.: 7578 (202404_001)

    // Get an artwork hash
    const { hashArray, hashHex } = await strToSha256(compositeSequence)
    console.log("hashArray, hashHex: ",  hashArray, hashHex)

    // End time
    const calcArtworkHashEndTime = performance.now()
    const elapsedTime = Math.floor(calcArtworkHashEndTime - calcArtworkHashStartTime)
    console.log('elapsedTime of calculating artwork hash: ', elapsedTime, ' ms')

    return hashHex
}

function generateCompositeSequence(linesData) {
    // Join whole groups sequences with underscore '_' to form:
    // [group_0_values] "_" [group_0_digits] "_" [group_1_values] "_" [group_1_digits] ...

    return Array.from(linesData).map(([key, value]) => createGroupSequence(key, value)).join('_')
}

function createGroupSequence(key, value) {
        // Get two strings of number sequence { values, digits } from each attrs
        const {         gIdVal,         gIdDig } = getSequenceOfGroupId(key)
        const {      colorsVal,      colorsDig } = getSequenceOfColors(value.groupColors)
        const { strokeWidthVal, strokeWidthDig } = getSequenceOfStrokeWidth(value.widthsAndCounts)
        const {    absDvalsVal,    absDvalsDig } = getSequenceOfAbsDvals(value.absDvalsObj)

        // Join whole sequences to form:
        //   values: [g_id] [g_stroke] [g_opacity] [g_stroke_opacity] [widths] [counts] "_" [abs_x1] [abs_y1] [abs_x2] [abs_y2]
        //   digits: [g_id] [g_stroke] [g_opacity] [g_stroke_opacity] [widths] [counts] "_" [abs_x1] [abs_y1] [abs_x2] [abs_y2]

        const valuesSequence = gIdVal + colorsVal + strokeWidthVal + '_' + absDvalsVal
        // e.g.: 2255255255255255_646263596669706366675462656768705860768287929857474967636 ... 33536393739127127127127124

        const digitsSequence = gIdDig + colorsDig + strokeWidthDig + '_' + absDvalsDig
        // e.g.: 133333_22222222222222222222222222222222222222222333332222222222222222222222222222222222222222233333

        return valuesSequence + '_' + digitsSequence
}


function getDigits(number) {
    return number.toString().length
}

function getSequenceOfGroupId(groupId) {
    const gIdVal = groupId.toString()  // e.g.: 0
    const gIdDig = getDigits(groupId)  // e.g.: 1
    return { gIdVal, gIdDig }
}

function getSequenceOfColors(groupColors) {

    // values
    const gStroke        = [...groupColors.gStrokeRgbArr].join('')     // e.g. '170170170'
    const gOpacity       = groupColors.gOpacityUint8.toString()        // e.g. '255'
    const gStrokeOpacity = groupColors.gStrokeOpacityUint8.toString()  // e.g. '255'
    const colorsVal = gStroke + gOpacity + gStrokeOpacity              // 170170170255255

    // digits
    const gStrokeDig = [...groupColors.gStrokeRgbArr].map(value => getDigits(value)).join('')  // e.g. '333'
    const gOpacityDig = getDigits(gOpacity)                                                             // e.g. '1'
    const gStrokeOpacityDig = getDigits(gStrokeOpacity)                                                 // e.g. '1'
    const colorsDig = gStrokeDig + gOpacityDig + gStrokeOpacityDig

    return { colorsVal, colorsDig }
}

function getSequenceOfStrokeWidth(widthsAndCounts) {
    const widths     = [...widthsAndCounts.widths.values()].join('')
    const counts     = [...widthsAndCounts.counts.values()].join('')
    const widthsDig  = [...widthsAndCounts.widths.values()].map(value => getDigits(value)).join('')
    const countsDig  = [...widthsAndCounts.counts.values()].map(value => getDigits(value)).join('')
    const strokeWidthVal = widths    + counts
    const strokeWidthDig = widthsDig + countsDig
    return { strokeWidthVal, strokeWidthDig }
}

function getSequenceOfAbsDvals(absDvalsObj) {
    // values
    const absDValX1 = [...absDvalsObj.x1.values()].join('')            // e.g.: 6364
    const absDValY1 = [...absDvalsObj.y1.values()].join('')            // e.g.: 00
    const absDValX2 = [...absDvalsObj.x2.values()].join('')            // e.g.: 6364
    const absDValY2 = [...absDvalsObj.y2.values()].join('')            // e.g.: 127127
    const absDvalsVal = absDValX1 + absDValY1 + absDValX2 + absDValY2  // e.g.: 6364006364127127

    // digits
    const absDValDigitsX1 = [...absDvalsObj.x1.values()].map(value => getDigits(value)).join('')  // e.g.: 22
    const absDValDigitsY1 = [...absDvalsObj.y1.values()].map(value => getDigits(value)).join('')  // e.g.: 11
    const absDValDigitsX2 = [...absDvalsObj.x2.values()].map(value => getDigits(value)).join('')  // e.g.: 22
    const absDValDigitsY2 = [...absDvalsObj.y2.values()].map(value => getDigits(value)).join('')  // e.g.: 33
    const absDvalsDig = absDValDigitsX1 + absDValDigitsY1 + absDValDigitsX2 + absDValDigitsY2     // e.g.: 22112233

    return { absDvalsVal, absDvalsDig }
}
