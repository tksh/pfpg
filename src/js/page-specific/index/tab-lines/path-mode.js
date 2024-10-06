import { replaceAtIndex }          from 'utils/replace-at-index'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { decode }                  from 'decode/decode'

export
    { decodeAsSelectedPathMode
    , recoverCurrentOptionValue
    , recoverCurrentGroupColorsValues
    }

// 選択された path-mode で url params から デコードし直す
function decodeAsSelectedPathMode(pathMode) {
    if (pathMode === 'relativeMerged') {
        console.log('Path mode: Relative and merged')
        const isRelative = true
        return decode(isRelative, isOnDataManipulatorPage())
    } else { // (pathMode === 'absoluteSeparated')
        console.log('Path mode: Absolute and separated')
        const isRelative = false
        return decode(isRelative, isOnDataManipulatorPage())
    }
}

// Recover the option values like
//  - Anti-aliasing
//  - Base color
//  - Shape to trim

function recoverCurrentOptionValue(svgString, regexPattern, valueString) {
    return svgString.replace(regexPattern, valueString)
}


// Recover the group colors values like
//   - stroke
//   - opacity
//   - stroke-opacity

function recoverCurrentGroupColorsValues(svgString, regexPattern, regexMatches) {
    let recoveredSvgString = svgString
    for (let gId = 0; gId < regexMatches.length; gId++) {
        const colorsValues = regexMatches[gId]
        recoveredSvgString = replaceAtIndex(recoveredSvgString, regexPattern, colorsValues, gId)
    }
    return recoveredSvgString
}
