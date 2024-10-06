import { tabSpace }           from 'constants'
import { svgWithNewShapeViewbox
       , extractViewboxValues
       }                      from 'tab-canvas/crop-side-margins'
import { roundToTwoDecimals } from 'utils/number-rounding'
import { getState }           from 'state/state-as-map-obj'
import { updateState }        from 'state/state-as-map-obj'

export
    { toggleDisplay
    , updateSvgWithSelectedShapePath
    }


// Function to toggle display of elements
function toggleDisplay(elements, display) {
    elements.forEach(element => {
        document.getElementById(element).style.display = display
    })
}


// Update SVG with selected shape path
function updateSvgWithSelectedShapePath(shape, inputSvg) {
    updateState('shapeToTrim', shape)

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
                : `<path d="M 0,${center}Q 0,0 ${center},0T ${gridSize},${center} ${center},${gridSize} 0,${center}" />` // shape === 'squircle'


    // Replace to new shape <clipPath>
    const patternForClippathShape = /<clipPath id="shape-to-trim">(\n?).*(\n?).*<\/clipPath>/g
    const removeNewlines = getState('removeNewlines')
    const newClippathSvg = removeNewlines
        ? inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">${shapePath}</clipPath>`)
        : inputSvg.replace(patternForClippathShape, `<clipPath id="shape-to-trim">\n${tabSpace.repeat(3)}${shapePath}\n${tabSpace.repeat(2)}</clipPath>`)

    // Update the <textarea>
    const hasCropSideMargins = getBoolOfCropSideMargins()
    const clippathAndViewboxUpdatedSvg = svgWithNewShapeViewbox(shape, hasCropSideMargins, newClippathSvg)

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
    return `<path d="M ${left},${center}Q ${topInflationAmount},0 ${center},0T ${right},${center} ${center},${gridSize} ${left},${center}" />`
}

// Get center (the half of grid size)
function getCenter(gridSize) {
    const center = roundToTwoDecimals(gridSize / 2)
    return center
}

// Three options for 'Squircle, slimmed'

// Width narrowness
function getWidthNarrowness() {
    const selectWidthNarrowness = document.getElementById('width-narrowness')
    const value = selectWidthNarrowness.value
    console.log('Value of widthNarrowness: ', value)
    updateState('widthNarrowness', value)
    return value
}

// Top-heavy ratio
function getTopHeavyRatio() {
    const selectTopHeavyRatio = document.getElementById('top-heavy-ratio')
    const value = selectTopHeavyRatio.value
    console.log('Value of topHeavyRatio: ', value)
    updateState('topHeavyRatio', value)
    return value
}

// 'Crop side margins' checked or not
function getBoolOfCropSideMargins() {
    const cropCheckbox = document.getElementById('crop-side-margins')

    // チェックボックスがチェックされているかどうかを確認
    if (cropCheckbox.checked) {
        console.log('"Crop side margins: " checkbox has checked')
        updateState('cropSideMargins', true)
        return true
    } else {
        console.log('"Crop side margins: " checkbox has un-checked')
        updateState('cropSideMargins', false)
        return false
    }
}
