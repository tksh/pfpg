////////////////////////////////// Input: //////////////////////////////////

// From: './json_extracted/%{ARTWORK_ID}_artwork_data.json

// {
//     "artwork_id": "202310_002",
//     "grid_size": "255x255",
//     "bg_color": "#555C"
// }


////////////////////////////////// Output: //////////////////////////////////

// ?202310_002=255x255-555C&


function encodeArtworkData(uintX) {
    // Read from textarea
    let rawJson = "";
    if (uintX === 'uint8') {
        rawJson = readTextarea('textarea-uint8portray-artwork-data-uploaded')
    } else if (uintX === 'uint5') {
        rawJson = readTextarea('textarea-uint5portray-artwork-data-uploaded')
    }
    //console.log(rawJson)
    // {
    //     "artwork_id": "202310_002",
    //     "grid_size": "255x255",
    //     "bg_color": "#555C"
    // }

    const artworkDataObj = JSON.parse(rawJson);
    //console.log('artworkDataObj: ', artworkDataObj)
    // {artwork_id: '202310_002', grid_size: '255x255', bg_color: '#555C'}
    // artwork_id: "202310_002"
    // bg_color: "#555C"
    // grid_size: "255x255"
    // [[Prototype]]: Object

    // ID
    const artwork_id_str = artworkDataObj.artwork_id        // 202310_002

    // Size
    const grid_size_str  = artworkDataObj.grid_size
    const split_by_x  = grid_size_str.split('x')            // (2) ['255', '255']
    const max = Math.max(...split_by_x)                     // 255
    const uintN = getUintN(max)                             // 8 (2 の 何乗か？)

    // Background color
    const bg_color_str   = artworkDataObj.bg_color.slice(1) // 555C&


    // Merge as URL params
    const artworkDataEncodedStr = '?' + artwork_id_str + '=' + grid_size_str + '-' + bg_color_str + '&'
    // ?202310_002=255x255-555C&


    // Output to textarea
    if (uintX === 'uint8') {
        outputToTextarea(artworkDataEncodedStr, 'textarea-uint8portray-artwork-data-encoded')
    } else if (uintX === 'uint5') {
        outputToTextarea(artworkDataEncodedStr, 'textarea-uint5portray-artwork-data-encoded')
    }
}