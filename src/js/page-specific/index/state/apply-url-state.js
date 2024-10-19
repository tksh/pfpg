import { SETTINGS_DEFAULTS }                    from 'constants'
import { countSvgSize }                         from 'download'
import { getInitialOpacitySteps
       , calculateStepsFromTwoOpacities }       from 'init/initial-opacity-steps'
import { tryRemoveOpacity
       , tryRemoveLineBreaks
       , tryRemoveSpaces }                      from 'modal/optimize-svg'
import { getState
       , updateState
       , getStateUrl }                          from 'state/url-state-manager'
import { applyGroupColors }                     from 'tab-lines/apply-group-colors'
import { decodeGroupColorsAsArray
       , getGroupOpacitiesAsMap }               from 'tab-lines/decode-colors-as-array'
import { generateGroupColorsHtmlElements }      from 'tab-lines/group-colors'
import { changeOpacitySelectOptionsAsNewStep
       , updateSvgForNewStep }                  from 'tab-lines/opacity-steps'
import { toggleDisplay
       , updateSvgWithSelectedShapePath }       from 'tab-canvas/shape-to-trim'
import { replaceShapeRendering }                from 'tab-render/shape-rendering'
import { toggleCheckerboardBg }                 from 'tab-ui/checkerboard-bg'
import { toggleTextWrapping }                   from 'tab-ui/text-wrapping'
import { changeThemeColor
       , getDefaultThemeViaPrefersColorScheme } from 'tab-ui/theme-color'
import { switchViewScaling }                    from 'tab-ui/view-scaling'

export
    { applyImageCustomization
    , applyUiConfiguration
    , applySvgOptimization
    }


function applyImageCustomization(svgString, resvgOption) {

    let updatedSvg = svgString

    ////////////////////////////////////////////////// colorFormat //////////////////////////////////////////////////
    // Generate the HTML elements of group attrs color-pickers
    // Default value of color-format is 'rgb'
    // Require to generate the initial group colors input elements, even if there is no 'colorFormat' in url param,
    // Because below 'changeOpacitySelectOptionsAsNewStep()` needs pre-generated input elements.
    const colorFormat = getState('colorFormat')
    document.getElementById("color-format").value = colorFormat

    // Use possibly temporary 'opacitySteps' value as argument in this timing.
    // Calculate it from original lines data.
    let opacitySteps = getInitialOpacitySteps()                                        // Getting the steps - 1st of 3
    console.log('Default opacitySteps calculated via original lines data: ', opacitySteps)                                                     // Stored as default
    SETTINGS_DEFAULTS.set('opacitySteps', opacitySteps)                                        // Set as default values

    // Update the html elements
    const opacityStepsSelector = document.getElementById("opacity-steps")
    opacityStepsSelector.value = opacitySteps

    // Create the group colors input elements
    generateGroupColorsHtmlElements(svgString, colorFormat, opacitySteps)

    ////////////////////////////////////////////////// groupColors //////////////////////////////////////////////////
    // Apply the image customization values via url params if exists

    const groupColors = getState('groupColors')
    if (groupColors) {
        const groupColorsByGroupsArr = decodeGroupColorsAsArray(groupColors, colorFormat)
        updatedSvg = applyGroupColors(svgString, resvgOption, groupColorsByGroupsArr, opacitySteps)

        // Get the opacitySteps from customized group colors
        const opacitiesByGroupMap = getGroupOpacitiesAsMap(groupColorsByGroupsArr)
        opacitySteps = calculateStepsFromTwoOpacities(opacitiesByGroupMap)             // Getting the steps - 2nd of 3
    }

    ////////////////////////////////////////////////// opacitySteps //////////////////////////////////////////////////
    // Try to retrieve the value via url param with 'getStateUrl()' instead of 'getState()' like others
    // 'opacitySteps' does not have default value in 'SETTINGS_DEFAULTS' map object, before the decoding svg.
    // The only way to get the default value is calculated from original lines data. (at above 'colorFormat' section)
    const opacityStepsViaUrl = getStateUrl('opacitySteps')                             // Getting the steps - 3rd of 3
    if (opacityStepsViaUrl) {
        console.log("opacityStepsViaUrl: ", opacityStepsViaUrl)
        opacityStepsSelector.value = opacityStepsViaUrl
        changeOpacitySelectOptionsAsNewStep(updatedSvg, opacityStepsViaUrl)  // Update the group colors input elements
        updatedSvg = updateSvgForNewStep(updatedSvg)           // Extract the steps value from input elements selected
    }

    ////////////////////////////////////////////////// shapeToTrim //////////////////////////////////////////////////
    /////////////////////////// includes: widthNarrowness, topHeavyRatio, cropSideMargins ///////////////////////////
    const shapeToTrim = getState('shapeToTrim')
    console.log("shapeToTrim                   from url param: ", shapeToTrim)
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
    document.getElementById('text-wrapping').checked = isTextWrapping
    toggleTextWrapping(isTextWrapping)

    ///////////////////////////// themeColor /////////////////////////////
    const themeColor = getStateUrl('themeColor') ? getStateUrl('themeColor') : getDefaultThemeViaPrefersColorScheme()
    updateState('themeColor', themeColor)
    document.getElementById('theme-color').value = themeColor
    changeThemeColor(themeColor)
}


function applySvgOptimization(svgString) {
    /////////////////////////////////////// removeOpacity ///////////////////////////////////////
    const isOpacityRemoved = getState('removeOpacity')
    updateState('removeOpacity', isOpacityRemoved)
    // Optimize the svg text
    const removeOpacityApplied = tryRemoveOpacity(svgString, isOpacityRemoved)

    // Set the checkbox state
    document.getElementById('remove-opacity').checked = isOpacityRemoved
    // Toggle classes for the <code> content text
    document.querySelector('#before-remove-opacity').classList.toggle('option-applied', !isOpacityRemoved)
    document.querySelector('#after-remove-opacity').classList.toggle('option-applied', isOpacityRemoved)


    ////////////////////////////////////// removeLineBreaks //////////////////////////////////////
    const isLineBreaksRemoved = getState('removeLineBreaks')
    updateState('removeLineBreaks', isLineBreaksRemoved)
    // Optimize the svg text
    const removeLineBreaksApplied = tryRemoveLineBreaks(removeOpacityApplied, isLineBreaksRemoved)

    // Set the checkbox state
    document.getElementById('remove-line-breaks').checked = isLineBreaksRemoved
    // Toggle classes for the <code> content text
    document.querySelector('#before-remove-line-breaks').classList.toggle('option-applied', !isLineBreaksRemoved)
    document.querySelector('#after-remove-line-breaks').classList.toggle('option-applied', isLineBreaksRemoved)


    /////////////////////////////////////// removeSpaces ///////////////////////////////////////
    const isSpacesRemoved = getState('removeSpaces')
    updateState('removeSpaces', isSpacesRemoved)
    // Optimize the svg text
    const removeSpacesApplied = tryRemoveSpaces(removeLineBreaksApplied, isSpacesRemoved)

    // Set the checkbox state
    document.getElementById('remove-spaces').checked = isSpacesRemoved
    // Toggle classes for the <code> content text
    document.querySelector('#before-remove-spaces').classList.toggle('option-applied', !isSpacesRemoved)
    document.querySelector('#after-remove-spaces').classList.toggle('option-applied', isSpacesRemoved)



    // Count the size of the updated SVG string and display it on the SVG download button
    countSvgSize(removeSpacesApplied)

    return removeSpacesApplied
}
