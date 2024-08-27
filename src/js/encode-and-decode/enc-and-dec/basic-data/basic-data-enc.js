import { showProcessingTime }      from 'enc-and-dec/show-result'
import { showStringSize }          from 'encode/show-result'
import { readTextarea }            from 'common-utils/read-textarea'
import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { isNonEmpty }              from 'common-utils/is-non-empty'

import { BASIC_DATA_KEYS  } from 'constants'

export
    { encodeBasicData
    , parseBasicData
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

// output: ?version=~0.9.0&title=~202401_001&desc=001kObPFhaNkBHUZJE0kMCGBFCDo8j7lBr_44z9CIqW3Ba7eLr9kVIlASMdS4&metadata=01p0oUdqIa ... jH6Mp&



function encodeBasicData() {
    const startTime = performance.now()

    // Parse the basic data JSON from textarea
    const data = parseBasicData()

    // Init the url params string to return
    let dataAsUrlParams = "?"

    BASIC_DATA_KEYS.forEach(prop => {
        // Check the value of `data[prop]` exists actually to abbreviate if possible.
        if (prop in data && isNonEmpty(data[prop])) {
            dataAsUrlParams += processProperty(prop, data[prop]);
        } else {
            console.log(`${prop} is missing`);
        }
    });


    // Output to textarea
    outputToTextarea(dataAsUrlParams, 'textarea-basic-data-encoded')

    // Show the size of result in html and console
    showStringSize('Basic Data', dataAsUrlParams, 'encoded-basic-data-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('encodeBasicData()', elapsedTime, 'encoded-basic-data-time', isOnDataManipulatorPage())
}


// Parse and manipulate the basic data JSON

function parseBasicData() {

    // Read from textarea
    const rawStr = readTextarea('textarea-basic-data-uploaded')
    const json = JSON.parse(rawStr)

    const result = {};

    if ('n'        in json) result.n        = json.n;
    if ('version'  in json) result.version  = json.version;
    if ('title'    in json) result.title    = json.title;
    if ('desc'     in json) result.desc     = json.desc;
    if ('metadata' in json) result.metadata = json.metadata;
    if ('colors'   in json) result.colors   = json.colors;

    return result;
}

// Is valid string as URI
// https://www.rfc-editor.org/rfc/rfc3986#section-2.3
// Characters that are allowed in a URI but do not have a reserved.
// unreserved  = ALPHA / DIGIT / "-" / "." / "_" / "~"
function isValidStringAsUri(str) {
    const regex = /^[0-9a-zA-Z_\-\.~]+$/;
    return regex.test(str);
}



function processProperty(propertyName, value) {
    console.log(`${propertyName}: ${value}`);

    // Check if the value is a valid URI
    const isValidAsUri = isValidStringAsUri(value);

    // Log the validity of the value as a URI
    console.log(`"${value}" is valid string as URI (true) or not (false): `, isValidAsUri);

    // Provide feedback based on the validity
    if (isValidAsUri) {
        console.log(`"${value}" is valid, it does not need to encode.`);
        return `${propertyName}=${value}&`;
    } else {
        console.log(`"${value}" is NOT valid, it needs to be encoded using URLCompressor.`);
        return `${propertyName}=~${URLCompressor.compress(value)}&`;
    }
}
