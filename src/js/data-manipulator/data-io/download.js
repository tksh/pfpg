// function to download encoded url params string
// as `000_0000_31x31.txt` and `000_0000_31x31.txt.zst`


import Zstd from 'https://cdn.skypack.dev/numcodecs/zstd';

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
document.getElementById('button-to-download-url-params-as-txt-zstd').onclick = function() {
    downloadUrlParamsAsTxtZstd('textarea-encoded-url-params');
  };

// Zstandard compressed before download

async function downloadUrlParamsAsTxtZstd(textareaId) { // ('textarea-encoded-url-params')

    const codec = new Zstd()

    // Get the text content from textarea
    const textContent = document.getElementById(textareaId).value;

    // Convert the input string to a Uint8Array
    const inputArray = new TextEncoder().encode(textContent);
    console.log('inputArray: ', inputArray);     // e.g.: Uint8Array(488) [ 63, 50, 48, 50, 51, 48, 56, 95, 48, 48, … ]

    // Encode with Zstandard
    const encoded = await codec.encode(inputArray);
    console.log('encoded: ', encoded);           // e.g.:Uint8Array(415) [ 40, 181, 47, 253, 96, 232, 0, 173, 12, 0, … ]

    // Convert the Uint8Array to a Blob
    const blob = new Blob([encoded], { type: 'application/zstd' });
    console.log('typeof(blob): ', typeof(blob)); // object
    console.log('blob: ', blob);                 // e.g.: Blob { size: 415, type: "application/zstd" }

    // Convert the Blob to a ObjectURL
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate a the filename

    const idAndSize = getIdAndSize() // Map obj returned

    // artwork id
    const artworkId = idAndSize.get('id')

    // grid size
    const gridSizeWxH = idAndSize.get('size')

    // Set the filename
    link.download = `${artworkId}_${gridSizeWxH}.txt.zst`;


    // Click to download
    link.click();
}




// Get the artwork ID and gird size string

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
    const artwork_id_str = artworkDataObj.artwork_id        // 202310_002

    // Size
    const grid_size_str  = artworkDataObj.grid_size

    return new Map([
        ['id', artwork_id_str],
        ['size', grid_size_str]
       ]);
}



// Download as TXT

function downloadUrlParamsAsTxt(textareaId) { // ('textarea-encoded-url-params')

    // Get text content from textarea
    const textContent = document.getElementById(textareaId).value;
    const blob = new Blob([textContent], { type: 'text/plain' });
    console.log('typeof(blob): ', typeof(blob)); // object
    console.log('blob: ', blob);                 // Blob { size: 488, type: "text/plain" }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate a the filename

    const idAndSize = getIdAndSize() // Map obj returned

    // artwork id
    const artworkId = idAndSize.get('id')

    // grid size
    const gridSizeWxH = idAndSize.get('size')

    // Set the filename
    link.download = `${artworkId}_${gridSizeWxH}.txt`;


    // Click to download
    link.click();
}

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
document.getElementById('button-to-download-url-params-as-txt').onclick = function() {
    downloadUrlParamsAsTxt('textarea-encoded-url-params');
  };

