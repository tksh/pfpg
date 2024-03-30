// function to download encoded url params string
// as `000_0000_31x31.txt` or `000_0000_31x31.txt.zst`

import Zstd from 'https://cdn.skypack.dev/numcodecs/zstd?min';

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
document.getElementById('button-to-download-url-params-as-txt-zstd').onclick = function () {
    downloadUrlParamsAsTxtZstd('textarea-encoded-url-params');
};

// Download as .txt.zst
// Compressed using Zstandard before download

async function downloadUrlParamsAsTxtZstd(textareaId) {

    const codec = new Zstd()

    // Get the text content from textarea
    const textContent = document.getElementById(textareaId).value;

    // Convert the input string to a Uint8Array
    const inputArray = new TextEncoder().encode(textContent);
    console.log('inputArray: ', inputArray);      // e.g.: Uint8Array(488) [ 63, 50, 48, 50, 51, 48, 56, 95, 48, 48, … ]

    // Encode with Zstandard
    const encoded = await codec.encode(inputArray);
    console.log('encoded: ', encoded);            // e.g.:Uint8Array(415) [ 40, 181, 47, 253, 96, 232, 0, 173, 12, 0, … ]

    // Convert the Uint8Array to a Blob
    const blob = new Blob([encoded], { type: 'application/zstd' });
    console.log('typeof(blob): ', typeof (blob)); // object
    console.log('blob: ', blob);                  // e.g.: Blob { size: 415, type: "application/zstd" }

    // Convert the Blob to a ObjectURL
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate the filename

    // Get artwork ID and size
    const idAndSizeStr = getIdAndSize()
    // Set the filename
    link.download = `${idAndSizeStr}.txt.zst`;


    // Download
    link.click();
}



// Download as .txt

function downloadUrlParamsAsTxt(textareaId) { // ('textarea-encoded-url-params')

    // Get text content from textarea
    const textContent = document.getElementById(textareaId).value;
    const blob = new Blob([textContent], { type: 'text/plain' });
    console.log('typeof(blob): ', typeof (blob)); // object
    console.log('blob: ', blob);                 // Blob { size: 488, type: "text/plain" }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate the filename

    // Get artwork ID and size
    const idAndSizeStr = getIdAndSize()
    // Set the filename
    link.download = `${idAndSizeStr}.txt.zst`;


    // Download
    link.click();
}

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
document.getElementById('button-to-download-url-params-as-txt').onclick = function () {
    downloadUrlParamsAsTxt('textarea-encoded-url-params');
};



// Get the artwork ID and gird size string
// Extract via artwork data .json strings in textarea

function getIdAndSize() {

    // Read from textarea
    const rawJson = readTextarea('textarea-artwork-data-uploaded')
    //console.log(rawJson)
    // {
    //     "artwork_id": "202310_002",
    //     "grid_size": "255x255",
    //     "bg_color": "#555C"
    // }

    const artworkDataObj = JSON.parse(rawJson)
    //console.log('artworkDataObj: ', artworkDataObj)
    // {artwork_id: '202310_002', grid_size: '255x255', bg_color: '#555C'}
    // artwork_id: "202310_002"
    // bg_color: "#555C"
    // grid_size: "255x255"
    // [[Prototype]]: Object

    // ID
    const artwork_id_str = artworkDataObj.artwork_id // "202310_002"
    // Size
    const grid_size_str = artworkDataObj.grid_size   // "255x255"

    return `${artwork_id_str}_${grid_size_str}`      // "202310_002_255x255"
}
