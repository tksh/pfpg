////////////////////////////////// Input: //////////////////////////////////

// From: './json_extracted/%{ARTWORK_ID}_artwork_data.json

// {
//     "artwork_id": "202310_002",
//     "grid_size": "255x255",
//     "bg_color": "#555C"
// }


////////////////////////////////// Output: //////////////////////////////////

// ?202310_002=255x255-555C&


function encodeArtworkData() {
    const startTime = performance.now()

    // Read from textarea
    const rawJson = readTextarea('textarea-artwork-data-uploaded')
    //console.log(rawJson)
    // {
    //     "title": "202401_001",
    //     "viewbox": "0 0 127 127",
    //     "rect": {
    //         "fill": "#aaa"
    //     }
    // }

    const artworkDataObj = JSON.parse(rawJson)
    //console.log('artworkDataObj: ', artworkDataObj)
    // {artwork_id: '202310_002', grid_size: '255x255', bg_color: '#555C'}
    // artwork_id: "202310_002"
    // bg_color: "#555C"
    // grid_size: "255x255"
    // [[Prototype]]: Object

    // ID
    const artwork_id_str = artworkDataObj.title        // 202310_002

    // Size
    const viewbox_str  = artworkDataObj.viewbox
    const viewbox  = viewbox_str.replace(/ /g, '_')

    //const max = Math.max(...split_by_x)                     // 255
    const split_by_space  = viewbox_str.split(' ')            // (2) ['255', '255']
    const max = Math.max(...split_by_space)                     // 255
    const uintN = getUintN(max)                             // 8 (2 の 何乗か？)
    console.log('uintN:', uintN)

    // Base color
    const bg_color_str   = artworkDataObj.rect.fill.slice(1) // 555C&


    // Merge as URL params
    const artworkDataEncodedStr = '?' + artwork_id_str + '=' + viewbox + '-' + bg_color_str + '&'
    // ?202310_002=255x255-555C&


    // Output to textarea
    outputToTextarea(artworkDataEncodedStr, 'textarea-artwork-data-encoded')

    // Show the size of result in html and console
    showStringSize('Artwork Data', artworkDataEncodedStr, 'encoded-artwork-data-size')

        // Show the processing time in html and console
        const endTime = performance.now()
        const elapsedTime = Math.floor(endTime - startTime)
        showProcessingTime('encodeArtworkData()', elapsedTime, 'encoded-artwork-data-time')
}