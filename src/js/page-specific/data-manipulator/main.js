import { isOnDataManipulatorPage }             from 'common-utils/select-output-textarea'
import { decodeUrlToSvg }                      from 'decode/decode'
import { bestMixEnc }                          from 'encode/best-mix-enc'
import { updateEncodingMethodsCheckboxStates } from 'encode/best-mix-enc'
import { encodeBasicData
       , parseBasicData
       , updateBasicDataKeysCheckboxStates}    from 'enc-and-dec/basic-data/basic-data-enc'
import { bruteforce53Enc }                     from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { bigint64Enc }                         from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { swap63Enc }                           from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'
import { four16Enc }                           from 'enc-and-dec/lines-data/d-values/four16/four16-enc'
import { mergeBasicDataAndLinesData }          from 'io/download-url-params'
import { setupCopyButtons }                    from 'io/copy-textarea'

// Decode from url params to SVG when page loaded.
// If there is no url params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage()


// decodeUrlToSvg() function will be executed twice at page loaded
// 'isDataManipulatorPage = true' will export the generated relative and absolute style SVGs into each textarea.

if (window.location.search) {
    for (const boolean of [true, false]) {
        const isRelative = boolean
        await decodeUrlToSvg(isRelative,  isDataManipulatorPage)
    }
}
// decodeUrlToSvg(isRelative = true,  isDataManipulatorPage) => Relative and merged
// decodeUrlToSvg(isRelative = false, isDataManipulatorPage) => Absolute and separated


// Attach event listener

function initButtons(buttonId, functionName) {
    const buttonElem = document.getElementById(`${buttonId}`)
    buttonElem.addEventListener('click', functionName)
}

function initBasicDataTextarea() {
    document.getElementById('textarea-basic-data-uploaded').addEventListener('input', () => {
        const basicData = parseBasicData()
        updateBasicDataKeysCheckboxStates(basicData)
        updateEncodingMethodsCheckboxStates(basicData)
    })
}

document.addEventListener('DOMContentLoaded', () => {

    // Buttons to encode
    initButtons('encode-basic-data',                  encodeBasicData)
    initButtons('encode-lines-data-via-bruteforce53', bruteforce53Enc)
    initButtons('encode-lines-data-via-bigint64',     bigint64Enc)
    initButtons('encode-lines-data-via-swap63',       swap63Enc)
    initButtons('encode-lines-data-via-four16',       four16Enc)
    initButtons('encode-lines-data-via-best-mix',     bestMixEnc)


    // Buttons to merge
    initButtons('button-to-merge-as-url-params',     mergeBasicDataAndLinesData)

    // Buttons to copy the text value of textarea of
    //   1. 'Encoded url params',
    //   2. 'Decode SVG String (relative)' and
    //   3. 'Decode SVG String (absolute)'
    setupCopyButtons()

    // Initialize checkbox states based on pre-inputted sample Basic Data json
    const basicData = parseBasicData()
    updateBasicDataKeysCheckboxStates(basicData)
    updateEncodingMethodsCheckboxStates(basicData)

    // textarea of Basic Data
    initBasicDataTextarea()
})