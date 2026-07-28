import { compressToBlob }          from 'common-utils/compression-stream'
import { isNonEmpty }              from 'common-utils/is-non-empty'
import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { readTextarea }            from 'common-utils/read-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { tryDecompress }           from 'decode/try-decompress'

export { mergeBasicDataAndLinesData }


// function to download encoded url params string
// as `000_0000.txt` or `000_0000.txt.zst`


// Download as .txt.zst

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
// Only on data-manipulator.html
if (isOnDataManipulatorPage()) {
    document.getElementById('button-to-download-url-params-as-txt-zstd').onclick = function () {
        downloadUrlParamsAsTxtZstd('textarea-encoded-url-params')
    }
}

async function downloadUrlParamsAsTxtZstd(textareaId) {

    if (!supportsZstdCompressionStream()) {
        const message = 'Zstandard CompressionStream is not supported in this browser.'
        console.error(message)
        document.getElementById('encoded-url-params-size').innerHTML = message
        return
    }

    // Get the text content from textarea
    const textContent = document.getElementById(textareaId).value

    // Compress the text content to a Blob
    const blob = await compressStringToBlob(textContent)
    //console.log(blob) //e.g.: Blob { size: 298, type: "application/zstd" }

    // Convert the Blob to a ObjectURL
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url


    // Generate the filename

    // Get artwork ID and size
    const idAndSizeStr = getTitle()
    // Set the filename
    link.download = `${idAndSizeStr}.txt.zst`


    // Download
    link.click()

    // Clean up the ObjectURL after the download
    URL.revokeObjectURL(url)
}

// Compressed using browser CompressionStream("zstd") before download

function supportsZstdCompressionStream() {
    try {
        new CompressionStream('zstd')
        return true
    } catch {
        return false
    }
}

async function compressStringToBlob(string) {

    // Convert and compress the input string via CompressionStream("zstd")
    const blob = await compressToBlob(string, 'zstd', 'application/zstd')
    console.log('typeof(blob): ', typeof (blob)) // object
    console.log('blob: ', blob)                  // e.g.: Blob { size: 415, type: "application/zstd" }
    return blob
}



// Download as .txt

// Define the downloadUrlParamsAsTxt function in the same scope as the onclick event handler
// Only on data-manipulator.html
if (isOnDataManipulatorPage()) {
        document.getElementById('button-to-download-url-params-as-txt').onclick = function () {
        downloadUrlParamsAsTxt('textarea-encoded-url-params')
    }
}

function downloadUrlParamsAsTxt(textareaId) { // ('textarea-encoded-url-params')

    // Get text content from textarea
    const textContent = document.getElementById(textareaId).value
    const blob = new Blob([textContent], { type: 'text/plain' })
    console.log('typeof(blob): ', typeof (blob)) // object
    console.log('blob: ', blob)                 // Blob { size: 488, type: "text/plain" }
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url


    // Generate the filename

    // Get artwork ID and size
    const idAndSizeStr = getTitle()
    // Set the filename
    link.download = `${idAndSizeStr}.txt`


    // Download
    link.click()
}



// Get the artwork title and gird size string
// Extract via basic data .json strings in textarea

function getTitle() {

    // Read from textarea
    const rawJson = readTextarea('textarea-basic-data-uploaded')

    const basicDataObj = JSON.parse(rawJson)
    return tryDecompress(basicDataObj.title) // e.g.: "202310_002"
}



// Merge the basic data and lines data as url params
// And get the size of after Zstandard compression to indicate

async function mergeBasicDataAndLinesData(){
    // Basic Data encoded string from textarea
    const basicDataStr = readTextarea(`textarea-basic-data-encoded`)

    // Lines Data encoded string from textarea
    const linesDataStr = readTextarea(`textarea-lines-data-encoded`)

    // Check if both strings are present
    if (isNonEmpty(basicDataStr) && isNonEmpty(linesDataStr)) {

        // Merge as a string
        const urlParamsStr = basicDataStr + linesDataStr

        // Output to textarea
        outputToTextarea(urlParamsStr, 'textarea-encoded-url-params')

        // Check the size after ZSTD compression (when browser supports it)
        if (!supportsZstdCompressionStream()) {
            document.getElementById(`encoded-url-params-size`).innerHTML =
            `Size of original url params string: <b>${urlParamsStr.length}</b> characters(bytes) (.txt)<br>
            Zstandard CompressionStream is not supported in this browser.`
            return
        }

        const blobSize = await getBlobSize(urlParamsStr)
        console.log(`Blob size: ${blobSize} bytes`)


        // Show the result

        // Get the ratio between original string and zstd blob
        const compRatio = blobSize / urlParamsStr.length

        // Show the size of result in html
        document.getElementById(`encoded-url-params-size`).innerHTML =
        `Size of original url params string: <b>${urlParamsStr.length}</b> characters(bytes) (.txt)<br>
        Size of after Zstandard compression: <b>${blobSize}</b> bytes (.txt.zst)<br>
        Ratio: ${blobSize} / ${urlParamsStr.length} = <b>${compRatio}</b>`

    } else {

        // Output error message if either or both strings are missing
        const errorMessage = "Error: Both basic data and lines data must be provided."
        outputToTextarea(errorMessage, 'textarea-encoded-url-params')

    }

}

// Get the Blob size
async function getBlobSize(string) {
    const blob = await compressStringToBlob(string)
    return blob.size
}
