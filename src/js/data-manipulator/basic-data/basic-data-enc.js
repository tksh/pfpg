////////////////////////////////// Input: //////////////////////////////////

// From: './json_extracted/%{ARTWORK_ID}_basic_data.json

// {
//     "title": "202401_001",
//     "viewbox": "0 0 127 127",
//     "rect": {
//         "fill": "#aaa"
//     }
// }


////////////////////////////////// Output: //////////////////////////////////

// ?202401_001=127-aaa&



function encodeBasicData() {
    const startTime = performance.now()

    // Parse the basic data JSON from textarea
    const basicData = parseBasicData()

    // Merge as URL params
    const basicDataEncodedStr = '?' + basicData.title + '=' + basicData.viewbox + '-' + basicData.rectFill + '&'

    // Output to textarea
    outputToTextarea(basicDataEncodedStr, 'textarea-basic-data-encoded')

    // Show the size of result in html and console
    showStringSize('Basic Data', basicDataEncodedStr, 'encoded-basic-data-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('encodeBasicData()', elapsedTime, 'encoded-basic-data-time')
}


// Parse and manipulate the basic data JSON

function parseBasicData() {

    // Read from textarea
    const rawStr = readTextarea('textarea-basic-data-uploaded')
    const json = JSON.parse(rawStr)

    // title
    const title = json.title                  // 202310_002

    // Sizes
    const viewboxDelimitedBySpace = json.viewbox
    const viewboxDelimitedByUnderscore = viewboxDelimitedBySpace.replace(/ /g, '_')
    const viewboxShorten = viewboxShortener(viewboxDelimitedByUnderscore)

    const viewboxSplitted = viewboxDelimitedBySpace.split(' ')
    const viewboxWH = viewboxSplitted.slice(-2)  // Extract 3rd (width) and 4th (height) elements
    const max = Math.max(...viewboxWH)
    const uintN = getUintN(max)

    // Base color
    const rectFill = json.rect.fill.slice(1) // 555C&

    return {
        title,
        viewbox      : viewboxShorten,
        viewboxWidth : viewboxWH[0],
        viewboxHeight: viewboxWH[1],
        max,
        uintN,
        rectFill
    }
}

// To compact the viewBox value if could

function viewboxShortener(viewbox) {
    if (viewbox.startsWith('0_0_')) {
        // Remove the leading '0_0_' and split the remaining part
        const [width, height] = viewbox.replace(/^0_0_/, '').split('_');
        // If width and height are the same, return width; otherwise, return the reduced viewbox
        return width === height ? width : `${width}_${height}`;
    }
    // Return the original viewbox if it doesn't start with '0_0_'
    return viewbox;
}
// test
//const str1 = '0_0_127_127'
//const str2 = '0_0_127_128'
//const str3 = '0_1_127_127'
//console.log(viewboxShortener(str1)) // 127
//console.log(viewboxShortener(str2)) // 127_128
//console.log(viewboxShortener(str3)) // 0_1_127_127
