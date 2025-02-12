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
import { selectFileToInput }                   from 'io/select-file'

// Decode from url params to SVG when page loaded.
// If there is no url params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage()


// decodeUrlToSvg() function will be executed twice at page loaded
// 'isDataManipulatorPage = true' will export the generated relative and absolute style SVGs into each textarea.

if (window.location.search) {
    for (const boolean of [true, false]) {
        const isRelative = boolean
        decodeUrlToSvg(isRelative,  isDataManipulatorPage)
    }
}
// decodeUrlToSvg(isRelative = true,  isDataManipulatorPage) => Relative and merged
// decodeUrlToSvg(isRelative = false, isDataManipulatorPage) => Absolute and separated


// Attach event listener

function initEncodeButtons(buttonId, functionName) {
    const buttonElem = document.getElementById(`${buttonId}`)
    buttonElem.addEventListener('click', functionName)
}

function initUploadButtons(inputId, textareaId) {
    const fileInput = document.getElementById(inputId);
    fileInput.addEventListener('change', function() {
        selectFileToInput(inputId, textareaId);
    });
}

function initBasicDataTextarea() {
    document.getElementById('textarea-basic-data-uploaded').addEventListener('input', () => {
        const basicData = parseBasicData()
        updateBasicDataKeysCheckboxStates(basicData)
        updateEncodingMethodsCheckboxStates(basicData)
    })
}

document.addEventListener('DOMContentLoaded', () => {

    // Buttons to upload
    initUploadButtons('select-file-basic-data',        'textarea-basic-data-uploaded');
    initUploadButtons('select-file-lines-data',        'textarea-lines-data-uploaded');
    initUploadButtons('select-file-agg-data-for-comp', 'textarea-agg-data-for-comp-uploaded');

    // Buttons to encode
    initEncodeButtons('encode-basic-data',                  encodeBasicData)
    initEncodeButtons('encode-lines-data-via-bruteforce53', bruteforce53Enc)
    initEncodeButtons('encode-lines-data-via-bigint64',     bigint64Enc)
    initEncodeButtons('encode-lines-data-via-swap63',       swap63Enc)
    initEncodeButtons('encode-lines-data-via-four16',       four16Enc)
    initEncodeButtons('encode-lines-data-via-best-mix',     bestMixEnc)


    // Buttons to merge
    initEncodeButtons('button-to-merge-as-url-params',     mergeBasicDataAndLinesData)

    // Buttons to copy the text value of textarea of
    //   - 'Encoded url params',
    //   - 'Decode SVG String (relative)' and
    //   - 'Decode SVG String (absolute)'
    setupCopyButtons()


    // Initialize checkbox status based on pre-inputted sample Basic Data json
    const basicData = parseBasicData()
    updateBasicDataKeysCheckboxStates(basicData)
    updateEncodingMethodsCheckboxStates(basicData)

    // textarea of Basic Data
    initBasicDataTextarea()
})