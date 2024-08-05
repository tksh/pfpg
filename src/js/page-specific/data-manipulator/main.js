import { isOnDataManipulatorPage }        from 'decode/select-output-textarea'
import { decode }                         from 'decode/decode'
import { encodeBasicData }                from 'enc-and-dec/basic-data/basic-data-enc'
import { bruteforce53Enc }                from 'enc-and-dec/lines-data/d-values/bruteforce53/bruteforce53-enc'
import { bigint64Enc }                    from 'enc-and-dec/lines-data/d-values/bigint64/bigint64-enc'
import { swap63Enc }                      from 'enc-and-dec/lines-data/d-values/swap63/swap63-enc'
import { mergeBasicDataAndStrokesValues } from 'io/download-url-params'
import { setupCopyButtons }               from 'io/copy-textarea'


// Decode from URL Params to SVG when page loaded.
// If there is no URL params at index.html, Decode from sample hidden text.

const isDataManipulatorPage = isOnDataManipulatorPage()


// 'isDataManipulatorPage = true' will export the generated relative and absolute style SVGs into each textarea.

for (const boolean of [true, false]) {
    const isRelative = boolean
    decode(isRelative,  isDataManipulatorPage)
}

//decode(isRelative,  isDataManipulatorPage)  // relative and merged
//decode(isRelative, isDataManipulatorPage)   // absolute and separated


// Attach event listener

function initButtons(buttonId, functionName) {
    const buttonElem = document.getElementById(`${buttonId}`);
    buttonElem.addEventListener('click', functionName);
}

document.addEventListener('DOMContentLoaded', () => {

    // Buttons for encode
    initButtons('encode-basic-data',                 encodeBasicData);
    initButtons('encode-lines-data-as-bruteforce53', bruteforce53Enc);
    initButtons('encode-lines-data-as-bigint64',     bigint64Enc);
    initButtons('encode-lines-data-as-swap63',       swap63Enc);

    initButtons('button-to-merge-as-url-params',     mergeBasicDataAndStrokesValues);

    // Buttons to copy the text value of textarea of
    //   1. 'Encoded URL Params',
    //   2. 'Decode SVG String (relative)' and
    //   3. 'Decode SVG String (absolute)'
    setupCopyButtons();

});