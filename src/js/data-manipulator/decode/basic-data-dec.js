function getBasicDataFromUrlParam(paramsArray) {

    // Get basic data params (first element)
    const basicDataParam = paramsArray[0]


    // Title
    const title = basicDataParam[0]              // 202308_001

    // Size
    const viewboxShorten  = basicDataParam[1].split("-")[0]              // 31
    const viewboxExpanded = viewboxExpander(viewboxShorten)              // '0_0_31_31'
    const viewboxDelimitedBySpace = viewboxExpanded.replace(/_/g, ' ')   // '0 0 31 31'

    const viewboxSplitted = viewboxExpanded.split('_') // (2) ['31', '31']
    const viewboxWH = viewboxSplitted.slice(-2)        // Extract 3rd (width) and 4th (height) elements
    const max = Math.max(...viewboxWH)
    const uintN = getUintN(max)                        // 5 (2 の 何乗か？)

    // Base color
    const rectFill = basicDataParam[1].split("-")[1] // 9999


    // Set into Map
    const basicDataMap = new Map()

    basicDataMap.set("title", title)                        // String
    basicDataMap.set("viewbox", viewboxDelimitedBySpace)    // String
    basicDataMap.set("uintN", uintN)                        // Number
    basicDataMap.set("rectFill", rectFill)                  // String

    return new Map([
        ["title", title],                       // String
        ["viewbox", viewboxDelimitedBySpace],   // String
        ["uintN", uintN],                       // Number
        ["rectFill", rectFill]                  // String
    ])
}



function viewboxExpander(reducedString) {
    // Split the input string by underscore
    const parts = reducedString.split('_');

    // Check if the input is a single number or a pair of numbers
    if (parts.length === 1) {
        const size = parts[0];
        return `0_0_${size}_${size}`;
    } else if (parts.length === 2) {
        const [width, height] = parts;
        return `0_0_${width}_${height}`;
    }

    // If the input doesn't match the expected patterns, return the original input
    return reducedString;
}
//// Test cases
//console.log(viewboxExpander('127'));         // 0_0_127_127
//console.log(viewboxExpander('127_128'));     // 0_0_127_128
//console.log(viewboxExpander('0_1_127_127')); // 0_1_127_127 (should remain unchanged)