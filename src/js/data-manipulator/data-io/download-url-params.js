// function to download encoded url params string
// as `000_0000.txt` or `000_0000.txt.zst`

import Zstd from 'https://cdn.skypack.dev/numcodecs/zstd?min';

import { isOnDataManipulatorPage } from '../../encode-and-decode/decode/select-output-textarea.js'


// Download as .txt.zst

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
// Only on data-manipulator.html
if (isOnDataManipulatorPage()) {
    document.getElementById('button-to-download-url-params-as-txt-zstd').onclick = function () {
        downloadUrlParamsAsTxtZstd('textarea-encoded-url-params');
    };
}

async function downloadUrlParamsAsTxtZstd(textareaId) {

    // Get the text content from textarea
    const textContent = document.getElementById(textareaId).value;

    // Compress the text content to a Blob
    const blob = await compressStringToBlob(textContent)
    //console.log(blob) //e.g.: Blob { size: 298, type: "application/zstd" }

    // Convert the Blob to a ObjectURL
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate the filename

    // Get artwork ID and size
    const idAndSizeStr = getTitle()
    // Set the filename
    link.download = `${idAndSizeStr}.txt.zst`;


    // Download
    link.click();

    // Clean up the ObjectURL after the download
    URL.revokeObjectURL(url);
}

// Compressed using Zstandard before download

export async function compressStringToBlob(string) {

    // Convert the input string to a Uint8Array
    const inputArray = new TextEncoder().encode(string);
    console.log('inputArray: ', inputArray);      // e.g.: Uint8Array(488) [ 63, 50, 48, 50, 51, 48, 56, 95, 48, 48, … ]

    // Encode with Zstandard
    const codec = new Zstd()
    const encoded = await codec.encode(inputArray);
    console.log('encoded: ', encoded);            // e.g.:Uint8Array(415) [ 40, 181, 47, 253, 96, 232, 0, 173, 12, 0, … ]

    // Convert the Uint8Array to a Blob
    const blob = new Blob([encoded], { type: 'application/zstd' });
    console.log('typeof(blob): ', typeof (blob)); // object
    console.log('blob: ', blob);                  // e.g.: Blob { size: 415, type: "application/zstd" }
    return blob
}



// Download as .txt

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
// Only on data-manipulator.html
if (isOnDataManipulatorPage()) {
        document.getElementById('button-to-download-url-params-as-txt').onclick = function () {
        downloadUrlParamsAsTxt('textarea-encoded-url-params');
    };
}

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
    const idAndSizeStr = getTitle()
    // Set the filename
    link.download = `${idAndSizeStr}.txt`;


    // Download
    link.click();
}



// Get the artwork title and gird size string
// Extract via basic data .json strings in textarea

function getTitle() {

    // Read from textarea
    const rawJson = readTextarea('textarea-basic-data-uploaded')

    const basicDataObj = JSON.parse(rawJson)
    return basicDataObj.title // e.g.: "202310_002"
}



// Merge the basic data and lines data as URL params
// And get the size of after Zstandard compression to indicate

// Only on data-manipulator.html
if (isOnDataManipulatorPage()) {
    document.getElementById('button-to-merge-as-url-params').addEventListener('click', mergeBasicDataAndStrokesValues);
}

async function mergeBasicDataAndStrokesValues(){
    // Basic Data encoded string from textarea
    const basicDataStr = readTextarea(`textarea-basic-data-encoded`)

    // Lines Data encoded string from textarea
    const linesDataStr = readTextarea(`textarea-strokes-values-encoded`)

    // Merge as a string
    const urlParamsStr = basicDataStr + linesDataStr

    // Output to textarea
    outputToTextarea(urlParamsStr, 'textarea-encoded-url-params')


    // Check the size after ZSTD compression
    const blobSize = await getBlobSize(urlParamsStr);
    console.log(`Blob size: ${blobSize} bytes`);


    // Show the result

    // Get the ratio between original string and zstd blob
    const compRatio = blobSize / urlParamsStr.length

    // Show the size of result in html
    document.getElementById(`encoded-url-params-size`).innerHTML =
    `Size of original URL params string: <b>${urlParamsStr.length}</b> characters(bytes) (.txt)<br>
    Size of after Zstandard compression: <b>${blobSize}</b> bytes (.txt.zst)<br>
    Ratio: ${blobSize} / ${urlParamsStr.length} = <b>${compRatio}</b>`

}

// Get the Blob size
async function getBlobSize(string) {
    const blob = await compressStringToBlob(string);
    return blob.size;
}
