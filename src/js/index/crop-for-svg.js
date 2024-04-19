// Change the viewBox size fit to Squircle, slimmed
function viewboxSlimmed() {
    const svgElement = document.querySelector('#input-svg')
    const svgString = svgElement.value.trim() // <textarea>のvalue属性を取得, `.trim()` => 文字列の両端の空白を削除

    const viewboxStr = getViewboxStr(svgString)
    const viewboxValues = extractViewboxValues(viewboxStr)
    console.log('viewboxValues: ', viewboxValues)     // Object { x: 0, y: 0, w: 31, h: 31 }

    const slimmedWidthValues = getSlimmedViewboxXW(svgString)
    //console.log('slimmedWidthValues.x: ', slimmedWidthValues.x) // e.g.: 1.55
    //console.log('slimmedWidthValues.w: ', slimmedWidthValues.w) // e.g.: 27.9

    // Generate new string
    const newViewboxString = `viewBox="${slimmedWidthValues.x} ${viewboxValues.y} ${slimmedWidthValues.w} ${viewboxValues.h}"`
    //console.log('newViewboxString: ', newViewboxString) // e.g.: viewBox="1.55 0 27.9 31"

    // Replace the textarea value with new string
    const patternForViewboxStr = /viewBox="([^"]+)"/; // viewBox属性を抽出する正規表現
    const updatedSVG = svgString.replace(patternForViewboxStr, newViewboxString);
    svgElement.value = updatedSVG

    return updatedSVG
}



// Get the viewBox string
function getViewboxStr(svgString) {
    const patternForViewboxStr = /viewBox="([^"]+)"/; // viewBox属性を抽出する正規表現
    const matches = patternForViewboxStr.exec(svgString);

    // 配列の 0番目には全体のマッチ結果, 1番目にはグルーピングした部分
    const viewboxStr = matches[0]        // e.g.: viewBox="0 0 31 31"
    //const vieBoxValueStr = matches[1]  // e.g.: 0 0 31 31

    return viewboxStr
}

// Get the slimmed width size and 'x' position (= same number as how much reduced each sides)
function getSlimmedViewboxXW(svgString) {
    const patternToGetSquircleSlimmedPathStr = /<path d="M ([\d\.]+),.*Q.*T ([\d\.]+),/; // viewBox属性を抽出する正規表現
    const matches = patternToGetSquircleSlimmedPathStr.exec(svgString);
    //console.log('matches: ', matches)       // e.g.: Array(3) [ '<path d="M 1.55,15.5Q 1.24,0 15.5,0T 29.45,', "1.55", "29.45" ]
    //console.log('matches[1]: ', matches[1]) // e.g.: 1.55
    //console.log('matches[2]: ', matches[2]) // e.g.: 29.45

    return {
        x: matches[1],                                 // viewBox start position | e.g.: 1.55
        w: String(parseFloat(matches[2] - matches[1])) // new viewBox width size | e.g.: 27.9 (= 29.45 - 1.55)
    }
}

function extractViewboxValues(viewBoxString) {
    // Use a regular expression to match the four numbers in the viewBox string
    const match = viewBoxString.match(/viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/);

    // Check if the match was successful
    if (match && match.length === 5) {
        // Extract the four numbers and return them as an object
        return {
            x: parseFloat(match[1]),
            y: parseFloat(match[2]),
            w: parseFloat(match[3]),
            h: parseFloat(match[4])
        };
    } else {
        // Return null or throw an error if the match was not successful
        return null;
    }
}
// e.g.: 'viewBox="2.325 0 26.35 31"' => Object { x: 2.325, y: 0, w: 26.35, h: 31 }





/////// When un-check the checkbox, Get back the viewBox as square ///////

function viewboxUnSlimmed() {
}