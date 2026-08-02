import { TAB_SPACE }            from 'constants'
import { tryRemoveSpaces }      from 'modal/optimize-svg'
import { getState
       , updateState }          from 'state/url-state-manager'
import { viewboxSlimmed
       , viewboxUnSlimmed
       , extractViewboxValues } from 'tab-canvas/crop-side-margins'
import { roundToTwoDecimals }   from 'utils/number-rounding'


// Update SVG with selected shape path
export function updateSvgWithNewShapePath(shape, inputSvg) {
    document.getElementById('shape-to-trim').value = shape

    // Params for generating the 'Squircle' and 'Squircle, slimmed' shape path
    const gridSize = extractViewboxValues(inputSvg).get('h')
    const center = roundToTwoDecimals(gridSize / 2)

    // Generate new shape path to trim
    const shapePath = shape === 'squircleSlimmed'
        ? generateClippathShapeOfSquircleSlimmed(inputSvg, getWidthNarrowness(), getTopHeavyRatio())
        : shape === 'square'
            ? `<rect width="100%" height="100%" />`
            : shape === 'circle'
                ? `<circle cx="50%" cy="50%" r="50%" />`
                : `<path d="M 0 ${center} Q 0 0 ${center} 0 T ${gridSize} ${center} ${center} ${gridSize} 0 ${center}" />` // shape === 'squircle'

    // Optimize the SVG if 'Remove Extra Spaces' checked
    const isSpacesRemoved = getState('removeSpaces')
    updateState('removeSpaces', isSpacesRemoved)
    const shapePathOptimized = tryRemoveSpaces(shapePath, isSpacesRemoved)

    // Replace to new shape <clipPath> (With indentation or not decided by 'Remove Line Breaks' checked)
    const patternForClippathShape = /<clipPath id="shape-to-trim">(\n?).*(\n?).*<\/clipPath>/g
    const isLineBreaksRemoved = getState('removeLineBreaks')
    const newClippathSvg = isLineBreaksRemoved
        ? inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">${shapePathOptimized}</clipPath>`)
        : inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">\n${TAB_SPACE.repeat(3)}${shapePathOptimized}\n${TAB_SPACE.repeat(2)}</clipPath>`)


    // Update the viewBox string
    // - If 'squircleSlimmed' selected, update the viewBox by current 'cropSideMargin' bool.
    // - If 'square|circle|squircle' selected, always apply the viewboxUnSlimmed() to reset the viewBox to original grid dimension.
    const clippathAndViewboxUpdatedSvg = shape === 'squircleSlimmed'
        ? isCropSideMargins()
            ? viewboxSlimmed(newClippathSvg)
            : viewboxUnSlimmed(newClippathSvg)
        : viewboxUnSlimmed(newClippathSvg)

    return clippathAndViewboxUpdatedSvg
}


// For 'Squircle, slimmed' selected

// Generate the path string of 'Squircle, slimmed'
function generateClippathShapeOfSquircleSlimmed(inputSvg, widthNarrowness, topHeavyRatio) {
    // function generateClippathShapeOfSquircleSlimmed(widthNarrowness, topHeavyRatio) {
    console.log('widthNarrowness, topHeavyRatio: ', widthNarrowness, topHeavyRatio)

    const gridSize = extractViewboxValues(inputSvg).get('h')
    const center = getCenter(gridSize)

    // generate the path of squircle slimmed
    const eachSideWidthForNarrowing = ((gridSize / 100) * (widthNarrowness / 2))
    const left = roundToTwoDecimals(0 + eachSideWidthForNarrowing)
    //console.log('left: ', left)
    const right = roundToTwoDecimals(gridSize - eachSideWidthForNarrowing)
    //console.log('right: ', right)
    const topInflationAmount = roundToTwoDecimals(left - ((gridSize / 100) * topHeavyRatio))
    //console.log('topInflationAmount: ', topInflationAmount)
    return `<path d="M ${left} ${center} Q ${topInflationAmount} 0 ${center} 0 T ${right} ${center} ${center} ${gridSize} ${left} ${center}" />`
}

// Get center (the half of grid size)
function getCenter(gridSize) {
    const center = roundToTwoDecimals(gridSize / 2)
    return center
}



// Three options for 'Squircle, slimmed'

// "Width narrowness" value: number
function getWidthNarrowness() {
    // Get the value from url param
    const widthNarrowness = getState('widthNarrowness')
    if (widthNarrowness) {
        document.getElementById('width-narrowness').value = widthNarrowness
        return widthNarrowness

    // Get the value from html elem
    } else {
        const widthNarrowness = document.getElementById('width-narrowness').value
        updateState('widthNarrowness', widthNarrowness)
        return widthNarrowness
    }
}

// "Top-heavy ratio" value: number
function getTopHeavyRatio() {
    // Get the value from url param
    const topHeavyRatio = getState('topHeavyRatio')
    if (topHeavyRatio) {
        document.getElementById('top-heavy-ratio').value = topHeavyRatio
        return topHeavyRatio

    // Get the value from html elem
    } else {
        const topHeavyRatio = document.getElementById('top-heavy-ratio').value
        updateState('topHeavyRatio', topHeavyRatio)
        return topHeavyRatio
    }
}



// "Crop side margins" value: boolean
function isCropSideMargins() {
    const cropCheckbox = document.getElementById('crop-side-margins')

    // Get the value from url param
    const isCropped = getState('cropSideMargins')
    if (isCropped !== undefined && isCropped !== null) {

        // URLパラメータが true ならチェックが入り false ならチェックが外れる
        cropCheckbox.checked = isCropped

    // If 'cropSideMargins' is not exists in url, use the value from html elem
    } else {
        updateState('cropSideMargins', cropCheckbox.checked)
    }

    return cropCheckbox.checked
}
