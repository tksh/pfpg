import { showProcessingTime }      from 'common-utils/show-processing-time'
import { showStringSize }          from 'encode/show-result'
import { readTextarea }            from 'common-utils/read-textarea'
import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { isNonEmpty }              from 'common-utils/is-non-empty'
import { URLCompressor }           from 'libs/url-comp-0-1-0/url-comp'

import { BASIC_DATA_KEYS }         from 'constants'

export
    { encodeBasicData
    , parseBasicData
    , updateBasicDataKeysCheckboxStates
    }

////////////////////////////////// Input: //////////////////////////////////

// From: './json_extracted/%{ARTWORK_ID}_basic_data.json

/*
{
    "n": "~7",
    "version": "~0.9.0",
    "title": "~202401_001",
    "desc": "001kObPFhaNkBHUZJE0kMCGBFCDo8j7lBr_44z9CIqW3Ba7eLr9kVIlASMdS4",
    "metadata": "01p0oUdqIavqvtRKIHBt6NXiYteLcXbRKDSYZxUvq0iChy ... pA77CwjH6Mp",
    "colors": ""
}
*/


////////////////////////////////// Output: //////////////////////////////////

// output: ?version=~0.9.0&title=~202401_001&desc=001kObPFha ... SMdS4&metadata=01p0o ... jH6Mp&



function encodeBasicData() {
    const startTime = performance.now()

    const functionName = 'encodeBasicData()'

    // Parse the basic data JSON from textarea
    const data = parseBasicData()

    // Init the url params string to return
    let dataAsUrlParams = "?"

    // Get selected fields
    const selectedFields = Array.from(document.querySelectorAll('#basic-data-options input[type="checkbox"]:checked')).map(cb => cb.id.replace('include-', ''))

    selectedFields.forEach(prop => {
        if (prop in data && isNonEmpty(data[prop])) {
            dataAsUrlParams += processProperty(prop, data[prop])
        } else {
            console.log(`${prop} is missing or empty`)
        }
    })


    // Output to textarea
    outputToTextarea(dataAsUrlParams, 'textarea-basic-data-encoded')

    // Show the size of result in html and console
    showStringSize(functionName, dataAsUrlParams, 'encoded-basic-data-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime(functionName, elapsedTime, 'encoded-basic-data-time', isOnDataManipulatorPage())
}


function updateBasicDataKeysCheckboxStates(basicData) {
    BASIC_DATA_KEYS.forEach(key => {
        if (key !== 'n') {  // Skip 'n' as it's always required
            const checkbox = document.getElementById(`include-${key}`)
            const label = checkbox.nextElementSibling

            if (!(key in basicData) || basicData[key] === '') {
                checkbox.checked = false
                checkbox.disabled = true
                label.textContent = `${key} (value not found in JSON)`
            } else {
                checkbox.checked = true
                checkbox.disabled = false
                label.textContent = key
            }
        }
    })
}


// Parse and manipulate the basic data JSON

function parseBasicData() {
    // Read from textarea
    const rawStr = readTextarea('textarea-basic-data-uploaded')
    const json = JSON.parse(rawStr)

    const result = {}

    BASIC_DATA_KEYS.forEach(key => {
        if (key in json && json[key] !== '') {
            result[key] = json[key]
        }
    })

    return result
}


// Is valid string as URI
// https://www.rfc-editor.org/rfc/rfc3986#section-2.3
// Characters that are allowed in a URI but do not have a reserved.
// unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
function isValidStringAsUri(str) {
    const regex = /^[0-9a-zA-Z_\-\.~]+$/
    return regex.test(str)
}



function processProperty(propertyName, value) {
    console.log(`${propertyName}: ${value}`)

    // Check if the value is a valid URI
    const isValidAsUri = isValidStringAsUri(value)

    // Log the validity of the value as a URI
    console.log(`"${value}" is valid string as URI (true) or not (false): `, isValidAsUri)

    // Provide feedback based on the validity
    if (isValidAsUri) {
        console.log(`"${value}" is valid, it does not need to encode.`)
        return `${propertyName}=${value}&`
    } else {
        console.log(`"${value}" is NOT valid, it needs to be encoded using URLCompressor.`)
        return `${propertyName}=~${URLCompressor.compress(value)}&`
    }
}


