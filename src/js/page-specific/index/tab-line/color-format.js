import { getInputSvg }                from 'download'
import { getNumberOfGroups }          from 'utils/get-number-of-groups'
import { generateGroupColorsSvgTags } from 'tab-line/group-colors'
import { replaceAtIndex }             from 'utils/replace-at-index'
import { convertColorFormat }         from 'tab-line/group-colors'
import { getElementValueById }        from 'tab-line/opacity-steps'


export function updateSvgAsNewColorFormat(colorFormat) {

    // Get the SVG string value
    let inputSvg = getInputSvg()

    // Get the number of groups
    const numberOfGroups = getNumberOfGroups(inputSvg)

    // Loop by group ID: Extract the values from UI tab HTML elements => Replace the <textarea> string

    // Function to process each group
    const processGroup = (inputSvg, gId) => {

        let newFormatStroke = ""
        // Get 'stroke' value
        const strokeElementId = `group-colors-stroke-${gId}`
        const stroke = convertColorFormat(getElementValueById(strokeElementId), colorFormat)
        console.log('stroke: ', stroke)             // Current SVG string,  e.g.: "rgb(170,170,170)"
        console.log('colorFormat: ', colorFormat)   // New selected format, e.g.: "hex"

        // Get 'opacity' value
        const opacityElementId = `group-colors-opacity-${gId}`
        const opacity = getElementValueById(opacityElementId)

        // Get 'stroke-opacity' value
        const strokeOpacityElementId = `group-colors-stroke-opacity-${gId}`
        const strokeOpacity = getElementValueById(strokeOpacityElementId)

        // Generate the array like regex 'match' object with input value
        const valueAsMatchesStructure = [
            undefined,        // [0] = undefined
            stroke,           // [1] = value of stroke
            opacity,          // [2] = value of opacity
            strokeOpacity     // [3] = value of stroke-opacity
        ]

        // Generate new group colors <g> element
        const changedGroupElem = generateGroupColorsSvgTags(valueAsMatchesStructure)

        // Replace the <g> elements via group ID
        const pattern = /<g stroke=[^>]*>/g
        return replaceAtIndex(inputSvg, pattern, changedGroupElem, gId)
    }

    // Process each group and update svgString
    const updatedSvg = Array.from({ length: numberOfGroups }, (_, gId) => gId)
    .reduce((acc, gId) => processGroup(acc, gId), inputSvg)

    return updatedSvg
}