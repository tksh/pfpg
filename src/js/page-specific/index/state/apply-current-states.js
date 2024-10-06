import { getInitialOpacitySteps }               from 'init/get-initial-opacity-steps'
import { getState }                             from 'state/state-as-map-obj'
import { decodeGroupColors }                    from 'tab-lines/decode-colors-as-array'
import { generateGroupColorsHtmlElements
       , generateGroupColorsSvgTags }           from 'tab-lines/group-colors'
import { addEventListenerForGroupColorsInputs } from 'tab-lines/group-colors-listener'
import { changeOpacitySelectOptionsAsNewStep
       , updateSvgForNewStep}                   from 'tab-lines/opacity-steps'
import { getNumberOfGroups }                    from 'utils/get-number-of-groups'
import { replaceAtIndex }                       from 'utils/replace-at-index'


export function applyCustomization(svgString, resvgOpts, paramsOfImageCustomization) {
    console.log("paramsOfImageCustomization: ", paramsOfImageCustomization)
    // e.g:
    // Map(3) {'pathMode' => 'absoluteSeparated', 'shapeRendering' => 'crispEdges', 'opacitySteps' => '0.2'}
    // [[Entries]]
    // 0: {"pathMode" => "absoluteSeparated"}
    // 1: {"shapeRendering" => "crispEdges"}
    // 2: {"opacitySteps" => "0.2"}
    // 3: {"groupColors" => "44AA63CC66_000_FFF"}
    // size: 3
    // [[Prototype]]: Map

    let updatedSvg = svgString

    ////////////////////////////////////////////////// groupColors //////////////////////////////////////////////////
    // Apply the image customization values via url params if exists
    const groupColors = getState('groupColors')
    if (groupColors) {
        updatedSvg = applyGroupColors(svgString, resvgOpts, groupColors)
    }

    ////////////////////////////////////////////////// colorFormat //////////////////////////////////////////////////
    // Generate the HTML elements of group attrs color-pickers
    // Default value of color-format is 'rgb'
    // Require to generate the initial group colors input elements, even if there is no 'colorFormat' in url param,
    // Because below 'changeOpacitySelectOptionsAsNewStep()` needs pre-generated input elements.
    const colorFormat = getState('colorFormat') ? getState('colorFormat') : 'rgb'

    // Create the group colors input elements
    generateGroupColorsHtmlElements(svgString, colorFormat, getInitialOpacitySteps(svgString))

    ////////////////////////////////////////////////// opacitySteps //////////////////////////////////////////////////
    const opacitySteps = getState('opacitySteps')
    if (opacitySteps) {
        changeOpacitySelectOptionsAsNewStep(updatedSvg, opacitySteps)  // Update the group colors input elements
        updatedSvg = updateSvgForNewStep(updatedSvg)                   // Extract the steps value from input elements selected
    }

    return updatedSvg
}

function applyGroupColors(svgString, resvgOpts, value) {

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
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'opacity')
    addEventListenerForGroupColorsInputs(numberOfGroups, resvgOpts, 'stroke-opacity')

    return updatedSvg
}
