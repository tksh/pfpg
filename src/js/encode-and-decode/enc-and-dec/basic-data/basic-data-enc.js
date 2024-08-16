import { getUintN }                from 'enc-and-dec/basic-data/get-uint-n'
import { showProcessingTime }      from 'enc-and-dec/show-result'
import { showStringSize }          from 'encode/show-result'
import { readTextarea }            from 'common-utils/read-textarea'
import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { isNonEmpty }              from 'common-utils/is-non-empty'


export
    { encodeBasicData
    , parseBasicData
    }

////////////////////////////////// Input: //////////////////////////////////

// From: './json_extracted/%{ARTWORK_ID}_basic_data.json

// {
//     "title": "202401_001",
//     "desc": "Portrait of a woman"
// }


////////////////////////////////// Output: //////////////////////////////////

// output: ?title=02024_001&
// input:
//   "title": "202401_001",

// output: ?title=202401_001&desc=~2J6DBxK74JRDIQ5EfH43&
// input:
//   "title": "202401_001",
//   "desc": "Portrait of a woman",


function encodeBasicData() {
    const startTime = performance.now()

    // Parse the basic data JSON from textarea
    const data = parseBasicData()

    // Init the url params string to return
    let dataAsUrlParams = "?"

    // Process each property
    const properties = ['version', 'title', 'desc', 'metadata', 'colors'];
    properties.forEach(prop => {
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

    if ('version' in json) result.version = json.version;     // e.g.: "0.1.0"
    if ('title' in json) result.title = json.title;           // e.g.: "202401_001"
    if ('desc' in json) result.desc = json.desc;              // e.g.: "Portrait of a woman"
    if ('metadata' in json) result.metadata = json.metadata;  // e.g.: "<xml><reference-tag>some reference info<reference-tag></xml>"
    if ('colors' in json) result.colors = json.colors;        // e.g.: "1357ofN16e_246ofN16eSftB8_12ofN16e"

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







//function parseBasicData() {
//
//    // Read from textarea
//    const rawStr = readTextarea('textarea-basic-data-uploaded')
//    const json = JSON.parse(rawStr)
//
//    // title
//    const title = json.title                  // 202310_002
//
//    // Sizes
//    const viewboxDelimitedBySpace = json.viewbox
//    const viewboxDelimitedByUnderscore = viewboxDelimitedBySpace.replace(/ /g, '_')
//    const viewboxShorten = viewboxShortener(viewboxDelimitedByUnderscore)
//
//    const viewboxSplitted = viewboxDelimitedBySpace.split(' ')
//    const viewboxWH = viewboxSplitted.slice(-2)  // Extract 3rd (width) and 4th (height) elements
//    const max = Math.max(...viewboxWH)
//    const uintN = getUintN(max)
//
//    // Base color
//    const rectFill = json.rect.fill.slice(1) // 555C&
//
//    return {
//        title,
//        viewbox      : viewboxShorten,
//        viewboxWidth : viewboxWH[0],
//        viewboxHeight: viewboxWH[1],
//        uintN,
//        rectFill
//    }
//}

// To compact the viewBox value if could

//function viewboxShortener(viewbox) {
//    if (viewbox.startsWith('0_0_')) {
//        // Remove the leading '0_0_' and split the remaining part
//        const [width, height] = viewbox.replace(/^0_0_/, '').split('_');
//        // If width and height are the same, return width; otherwise, return the reduced viewbox
//        return width === height ? width : `${width}_${height}`;
//    }
//    // Return the original viewbox if it doesn't start with '0_0_'
//    return viewbox;
//}
// test
//const str1 = '0_0_127_127'
//const str2 = '0_0_127_128'
//const str3 = '0_1_127_127'
//console.log(viewboxShortener(str1)) // 127
//console.log(viewboxShortener(str2)) // 127_128
//console.log(viewboxShortener(str3)) // 0_1_127_127
