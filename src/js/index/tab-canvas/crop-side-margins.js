import { toFixedTrimmed } from 'utils/number-rounding'

export
    { svgWithNewShapeViewbox
    , viewboxSlimmed
    , extractViewboxValues
    , viewboxUnSlimmed
    }

function svgWithNewShapeViewbox(shape, hasCropSideMargins, newClippathSvg) {

    // Update 'viewBox'

    // Get back original 'viewBox' value when
    // 1. the shapes excepts 'squircleSlimmed' selected, or
    // 2. 'squircleSlimmed' and not checked for 'Crop side margins' checkbox

    console.log('hasCropSideMargins: ', hasCropSideMargins)         // boolean, true=cropped[checked], false=un-cropped[!checked]

    if (shape == 'squircleSlimmed' && hasCropSideMargins == true) { // shape == 'squircleSlimmed'
        return viewboxSlimmed(newClippathSvg)
    } else {                                                        // shape == 'square | circle | squircle'
        console.log(`"viewBox" value will be replaced to original size,
                      because selected shape is ${shape}, and hasCropSideMargins is ${hasCropSideMargins}`)
        return viewboxUnSlimmed(newClippathSvg)
    }

}

// Change the viewBox size fit to Squircle, slimmed.
// And textarea replaced as it.
function viewboxSlimmed(inputSvg) {
    const slimmedXW = getSlimmedViewboxXW(inputSvg)
    //console.log('slimmedXW.get('x'): ', slimmedXW.get('x')) // e.g.: 1.55
    //console.log('slimmedXW.get('w'): ', slimmedXW.get('w')) // e.g.: 27.9

    const viewboxValues = extractViewboxValues(inputSvg)

    // Generate new viewBox string
    const newViewboxString = `viewBox="${slimmedXW.get('x')} ${viewboxValues.get('y')} ${slimmedXW.get('w')} ${viewboxValues.get('h')}"`
    console.log('newViewboxString: ', newViewboxString) // e.g.: viewBox="1.55 0 27.9 31"

    // Replace the viewBox string with new one
    const patternForViewboxStr = /viewBox="[^"]+"/;  // viewBox属性 全体 を抽出する正規表現
    return inputSvg.replace(patternForViewboxStr, newViewboxString);
}


// Get the slimmed width size and 'x' position (= same number as how much reduced each sides)
function getSlimmedViewboxXW(inputSvg) {
    const patternToGetSquircleSlimmedPathStr = /<path d="M ([\d\.]+),.*Q.*T ([\d\.]+),/; // viewBox属性を抽出する正規表現
    const matches = patternToGetSquircleSlimmedPathStr.exec(inputSvg);
    //console.log('matches: ', matches)       // e.g.: Array(3) [ '<path d="M 1.55,15.5Q 1.24,0 15.5,0T 29.45,', "1.55", "29.45" ]
    //console.log('matches[1]: ', matches[1]) // e.g.: 1.55
    //console.log('matches[2]: ', matches[2]) // e.g.: 29.45

    return new Map([
        ['x', toFixedTrimmed(parseFloat(matches[1]))             ], // viewBox start position | e.g.: 1.55
        ['w', toFixedTrimmed(parseFloat(matches[2] - matches[1]))]  // new viewBox width size | e.g.: 27.9 (= 29.45 - 1.55)
    ]);
}

// Get viewBox four number values as Map object
function extractViewboxValues(inputSvg) {
    // Use a regular expression to match the four number values in the viewBox string
    const match = inputSvg.match(/viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/);

    // Check if the match was successful
    if (match && match.length === 5) {
        // Extract the four number values and return them as a Map object
        return new Map([
            ['x', parseFloat(match[1])],
            ['y', parseFloat(match[2])],
            ['w', parseFloat(match[3])],
            ['h', parseFloat(match[4])]
        ]);
    } else {
        // Return null or throw an error if the match was not successful
        return null;
    }
}
// e.g.: 'viewBox="2.325 0 26.35 31"' => Object { x: 2.325, y: 0, w: 26.35, h: 31 }



// When un-check the checkbox, Get back the viewBox as square

function viewboxUnSlimmed(inputSvg) {
    // Read original basic data from url params
    const isDataManipulatorPage = false
    const urlParamsAsTwoMaps = readUrlParamsAsMaps(isDataManipulatorPage)
    const basicDataMap = urlParamsAsTwoMaps.basicData

    // Generate new string with original viewBox size
    const originalViewboxString = basicDataMap.get('viewbox')                // e.g.: '0 0 31 31'

    // Replace the viewBox string with new one
    const patternForViewboxStr = /viewBox="([^"]+)"/
    const matchesForViewboxStr = patternForViewboxStr.exec(inputSvg);        // e.g.: 'viewBox="0 0 31 31"'
    const matchForViewboxValueStr = matchesForViewboxStr[1]                  // e.g.: '0 0 31 31'
    return inputSvg.replace(matchForViewboxValueStr, originalViewboxString)
}