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

// ?202310_002=255x255-555C&


function encodeBasicData() {
    const startTime = performance.now()

    // Read from textarea
    const rawJson = readTextarea('textarea-basic-data-uploaded')

    const basicDataObj = JSON.parse(rawJson)
    // console.log('basicDataObj: ', basicDataObj)
    // Object
    //     rect: Object { fill: "#aaa" }
    //     title: "202401_001"
    //     viewbox: "0 0 127 127"

    // title
    const title = basicDataObj.title        // 202310_002

    // viewBox
    const viewboxStr  = basicDataObj.viewbox
    const viewbox  = viewboxStr.replace(/ /g, '_')

    const split_by_space  = viewboxStr.split(' ')
    const max = Math.max(split_by_space.slice(2, 4)) // Extract 3rd (width) and 4th (height) elements
    const uintN = getUintN(max)
    console.log('uintN:', uintN)

    // Base color
    const rectFill   = basicDataObj.rect.fill.slice(1) // 555C&


    // Merge as URL params
    const basicDataEncodedStr = '?' + title + '=' + viewbox + '-' + rectFill + '&'
    // ?202310_002=255x255-555C&


    // Output to textarea
    outputToTextarea(basicDataEncodedStr, 'textarea-basic-data-encoded')

    // Show the size of result in html and console
    showStringSize('Basic Data', basicDataEncodedStr, 'encoded-basic-data-size')

        // Show the processing time in html and console
        const endTime = performance.now()
        const elapsedTime = Math.floor(endTime - startTime)
        showProcessingTime('encodeBasicData()', elapsedTime, 'encoded-basic-data-time')
}