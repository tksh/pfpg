import { compressToBlob }          from 'common-utils/compression-stream'
import { isNonEmpty }              from 'common-utils/is-non-empty'
import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { readTextarea }            from 'common-utils/read-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { mergeUrlParams
       , tryDecompress }           from '@tksh/stln-codec'

export { mergeBasicDataAndLinesData }


// Download as .txt

if (isOnDataManipulatorPage()) {
    document.getElementById('button-to-download-url-params-as-txt').onclick = async function () {
        downloadUrlParamsAsTxt('textarea-encoded-url-params')
    }
}

async function downloadUrlParamsAsTxt(textareaId) {

    // Get text content from textarea
    const textContent = document.getElementById(textareaId).value
    const blob = new Blob([textContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // Generate the filename
    const idAndSizeStr = await getTitle()
    link.download = `${idAndSizeStr}.txt`

    // Download
    link.click()

    // Clean up ObjectURL
    URL.revokeObjectURL(url)
}


// Get the artwork title and grid size string
// Extract via basic data .json strings in textarea

async function getTitle() {

    // Read from textarea
    const rawJson = readTextarea('textarea-basic-data-uploaded')

    const basicDataObj = JSON.parse(rawJson)
    return await tryDecompress(basicDataObj.title)
}


// Helper function to check if browser supports CompressionStream with method
function supportsCompressionStream(method) {
    try {
        new CompressionStream(method)
        return true
    } catch {
        return false
    }
}

// Helper function to compress string and get blob size if supported
async function getCompressedSize(input, method) {
    if (!supportsCompressionStream(method)) {
        return null
    }
    try {
        const blob = await compressToBlob(input, method)
        return blob.size
    } catch {
        return null
    }
}


// Merge basic data and lines data as url params
// And display compression summary for gzip, deflate-raw, and brotli

async function mergeBasicDataAndLinesData() {

    // Basic Data encoded string from textarea
    const basicDataStr = readTextarea('textarea-basic-data-encoded')

    // Lines Data encoded string from textarea
    const linesDataStr = readTextarea('textarea-lines-data-encoded')

    // Check if both strings are present
    if (isNonEmpty(basicDataStr) && isNonEmpty(linesDataStr)) {

        // Merge as a string
        const urlParamsStr = mergeUrlParams(basicDataStr, linesDataStr)

        // Output to textarea
        outputToTextarea(urlParamsStr, 'textarea-encoded-url-params')

        const originalBytes = new Blob([urlParamsStr]).size

        const formats = [
            { method: 'gzip', label: 'gzip', ext: '.txt.gz' },
            { method: 'deflate-raw', label: 'deflate-raw', ext: '.txt.deflate' },
            { method: 'brotli', label: 'brotli', ext: '.txt.br' }
        ]

        const lines = [
            `Size of original string: ${originalBytes} bytes (.txt)`,
            '',
            'Compressed sizes:'
        ]

        for (const fmt of formats) {
            const size = await getCompressedSize(urlParamsStr, fmt.method)
            const labelPadded = (`- ${fmt.label}:`).padEnd(15, ' ')

            if (size !== null) {
                const sizeExtStr = `${size} bytes (${fmt.ext})`
                const ratioVal = (size / originalBytes).toFixed(3)
                const spacesCount = Math.max(1, 42 - (15 + sizeExtStr.length))
                lines.push(`${labelPadded}${sizeExtStr}${' '.repeat(spacesCount)}ratio ${ratioVal}`)
            } else {
                lines.push(`${labelPadded}not supported in this browser (${fmt.ext})`)
            }
        }

        const sizeElem = document.getElementById('encoded-url-params-size')
        if (sizeElem) {
            sizeElem.textContent = lines.join('\n')
        }

    } else {

        // Output error message if either or both strings are missing
        const errorMessage = 'Error: Both basic data and lines data must be provided.'
        outputToTextarea(errorMessage, 'textarea-encoded-url-params')

    }

}
