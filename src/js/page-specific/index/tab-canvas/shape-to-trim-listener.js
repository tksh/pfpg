import { getSvgString }              from 'button/download-as-file'
import { adjustLayoutIfNotMobile }   from 'init/adjust-layout'
import { svg2pngOption }             from 'state/resvg-option'
import { updateState }               from 'state/url-state-manager'
import { executeSvg2png }            from 'svg-to-png'
import { updateSvgWithNewShapePath } from 'tab-canvas/shape-to-trim'
import { cropSideMargins
       , resetSideMargins }          from 'tab-canvas/crop-side-margins'

export
    { initShapeToTrimSelect
    , initWidthNarrownessSelect
    , initTopHeavyRatioSelect
    , initCropSideMarginsCheckbox
    , toggleDisplay
    }


// Event listener for 'Shape to trim'
function initShapeToTrimSelect() {

    document.getElementById('shape-to-trim').addEventListener("change", (event) => {

        // 選択された値を取得
        const shapeToTrim = event.target.value  // square|circle|squircle|squircleSlimmed
        updateState('shapeToTrim', shapeToTrim)

        // 'squircleSlimmed'が 選ばれた時だけ表示される
        // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
        const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']

        if (shapeToTrim === 'squircleSlimmed') {
            toggleDisplay(elementsToToggle, 'inline')
            adjustLayoutIfNotMobile('optionDisplayed')
        } else {
            toggleDisplay(elementsToToggle, 'none')
            adjustLayoutIfNotMobile('optionDisplayed')
        }


        // Update the SVG string with new clip shape path and viewBox
        const inputSvg = getSvgString()
        const updatedSvg = updateSvgWithNewShapePath(shapeToTrim, inputSvg)


        document.querySelector('#svg-string').value = updatedSvg        // Update the textarea
        executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption)  // Render to PNG

    })
}

// Function to toggle display of below two <select> elements
function toggleDisplay(elements, display) {
    elements.forEach(element => {
        document.getElementById(element).style.display = display
    })
}


// Event listeners for options that will be activated when 'Squircle, slimmed' is selected:
// - 'Width narrowness'
// - 'Top-heavy ratio'

function initWidthNarrownessSelect() {
    document.getElementById('width-narrowness').addEventListener('change', (event) => {
        const widthNarrowness = event.target.value
        console.log('widthNarrowness: ', widthNarrowness)
        updateState('widthNarrowness', widthNarrowness)

        const updatedSvg = updateSvgWithNewShapePath('squircleSlimmed', getSvgString())

        document.querySelector('#svg-string').value = updatedSvg        // Update the textarea
        executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption)  // Render to PNG
    })
}

function initTopHeavyRatioSelect() {
    document.getElementById('top-heavy-ratio').addEventListener('change', (event) => {
        const topHeavyRatio = event.target.value
        console.log('topHeavyRatio: ', topHeavyRatio)
        updateState('topHeavyRatio', topHeavyRatio)

        const updatedSvg = updateSvgWithNewShapePath('squircleSlimmed', getSvgString())

        document.querySelector('#svg-string').value = updatedSvg        // Update the textarea
        executeSvg2png({ target: { value: updatedSvg } }, svg2pngOption)  // Render to PNG
    })
}


// Event listener for 'Crop side margins'

function initCropSideMarginsCheckbox() {
    document.getElementById('crop-side-margins').addEventListener('change', (event) => {
        const svgString = getSvgString()
        event.target.checked ? cropSideMargins(svgString) : resetSideMargins(svgString)
    })
}
