import { getInitialOpacitySteps }               from 'init/get-initial-opacity-steps'
import { getState }                             from 'state/settings-defaults'
import { getStateUrl }                          from 'state/state-as-url-params'
import { decodeGroupColors }                    from 'tab-lines/decode-colors-as-array'
import { generateGroupColorsHtmlElements
       , generateGroupColorsSvgTags }           from 'tab-lines/group-colors'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { changeOpacitySelectOptionsAsNewStep
       , updateSvgForNewStep}                   from 'tab-lines/opacity-steps'
import { getNumberOfGroups }                    from 'utils/get-number-of-groups'
import { replaceAtIndex }                       from 'utils/replace-at-index'
import { toggleDisplay
       , updateSvgWithSelectedShapePath}        from 'tab-canvas/shape-to-trim'
import { replaceShapeRendering }                from 'tab-render/shape-rendering'
import { switchViewScaling }                    from 'tab-ui/view-scaling'
import { toggleCheckerboardBg }                 from 'tab-ui/checkerboard-bg'
import { toggleTextWrapping }                   from 'tab-ui/text-wrapping'

export
    { applyCustomization
    , applyUiConfiguration
    }


function applyCustomization(svgString, resvgOption) {

    let updatedSvg = svgString

    ////////////////////////////////////////////////// colorFormat //////////////////////////////////////////////////
    // Generate the HTML elements of group attrs color-pickers
    // Default value of color-format is 'rgb'
    // Require to generate the initial group colors input elements, even if there is no 'colorFormat' in url param,
    // Because below 'changeOpacitySelectOptionsAsNewStep()` needs pre-generated input elements.
    const colorFormat = getState('colorFormat')
    document.getElementById("color-format").value = colorFormat

    // Create the group colors input elements
    generateGroupColorsHtmlElements(svgString, colorFormat, getInitialOpacitySteps())

    ////////////////////////////////////////////////// opacitySteps //////////////////////////////////////////////////
    // First, try to retrieve the value via url param with 'getStateUrl()' instead of 'getState()' like others
    // 'opacitySteps' does not have default value before decoding in 'settingsDefaults'.
    // The only way to get the default value of current artwork is calculate from original lines data.

    let opacitySteps = getStateUrl('opacitySteps')
    if (opacitySteps) {
        document.getElementById("opacity-steps").value = opacitySteps
        changeOpacitySelectOptionsAsNewStep(updatedSvg, opacitySteps)  // Update the group colors input elements
        updatedSvg = updateSvgForNewStep(updatedSvg)                   // Extract the steps value from input elements selected
    } else {
        opacitySteps = getInitialOpacitySteps()
    }

    ////////////////////////////////////////////////// groupColors //////////////////////////////////////////////////
    // Apply the image customization values via url params if exists
    const groupColors = getState('groupColors')
    if (groupColors) {
        updatedSvg = applyGroupColors(svgString, resvgOption, groupColors)
    }

    ////////////////////////////////////////////////// shapeToTrim //////////////////////////////////////////////////
    /////////////////////////// includes: widthNarrowness, topHeavyRatio, cropSideMargins ///////////////////////////
    const shapeToTrim = getState('shapeToTrim')
    console.log("shapeToTrim from url param: ", shapeToTrim)
    updatedSvg = updateSvgWithSelectedShapePath(shapeToTrim, updatedSvg)

    // 'squircleSlimmed'が 選ばれた時だけ表示される
    // 2つのオプション選択用の<select>要素 と 横幅クロップ用の<label>&<input>要素 を取得し 表示または非表示にする
    const elementsToToggle = ['width-narrowness-div', 'top-heavy-ratio-div', 'crop-side-margins-div']

    if (shapeToTrim === 'squircleSlimmed') {
        toggleDisplay(elementsToToggle, 'inline')
    } else {
        toggleDisplay(elementsToToggle, 'none')
    }

    ////////////////////////////////////////////////// shapeRendering //////////////////////////////////////////////////
    const shapeRendering = getState('shapeRendering')
    document.getElementById("shape-rendering").value = shapeRendering
    updatedSvg = replaceShapeRendering(updatedSvg, shapeRendering)

    ////////////////////////////////////////////////// widthPixelSize //////////////////////////////////////////////////
    const widthPixelSize = parseInt(getState('widthPixelSize'), 10)
    resvgOption.fitTo.value = widthPixelSize

    document.querySelector('#png-size-number').value = widthPixelSize
    document.querySelector('#png-size-range').value = widthPixelSize

    return updatedSvg
}


function applyUiConfiguration() {
    ///////////////////////////// viewScaling /////////////////////////////
    const viewScaling = getState('viewScaling')  // 'fit'|'actual'
    document.getElementById('view-scaling').value = viewScaling
    switchViewScaling(viewScaling)

    //////////////////////////// checkerboardBg ////////////////////////////
    const isCheckerboardBg = getState('checkerboardBg')  // bool
    document.getElementById('checkerboard-bg').checked = isCheckerboardBg
    toggleCheckerboardBg(isCheckerboardBg)

    ///////////////////////////// textWrapping /////////////////////////////
    const isTextWrapping = getState('textWrapping')  // bool
    console.log("||||isTextWrapping: ", isTextWrapping)
    document.getElementById('text-wrapping').checked = isTextWrapping
    toggleTextWrapping(isTextWrapping)


}


function applyGroupColors(svgString, resvgOption, value) {

    // Decode the group colors value
    // - from: Hex string that has joined whole groups with '_'
    // -   to: Array structured same as regex '.match()' method returns.
    // - Type: Array of arrays
    const colorFormat = getState('colorFormat')
    const groupColorsByGroups = decodeGroupColors(value, colorFormat)

    // Generate the <g> element string
    // - Type: Array of strings
    const gElemByGroups = groupColorsByGroups.map(groupColorsArr => generateGroupColorsSvgTags(groupColorsArr))
    console.log('gElemByGroups: ', gElemByGroups)
    // e.g.: (3) ['<g stroke="#38AA34" opacity="1" stroke-opacity="1">', '<g stroke="#000" opacity="1" stroke-opacity="1">', '<g stroke="#FFF" opacity="1" stroke-opacity="1">']

    // Replace the whole groups <g> element, via group ID = index number of array
    const pattern = /<g stroke=[^>]*>/g
    let updatedSvg = svgString

    // Replace each group element
    gElemByGroups.forEach((gElem, gId) => {
        // Here, assign the result of replaceAtIndex back to updatedSvg
        updatedSvg = replaceAtIndex(updatedSvg, pattern, gElem, gId);
    })

    // HTMLを 新しい表示フォーマットの js-color input に更新
    // generateGroupColorsHtmlElements(colorFormat, getState('opacitySteps'))
    generateGroupColorsHtmlElements(updatedSvg, colorFormat, getState('opacitySteps'))
    // Add event listener for new format js-color inputs and opacity selectors
    const numberOfGroups = getNumberOfGroups(svgString)
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOption, 'stroke-opacity')

    return updatedSvg
}
