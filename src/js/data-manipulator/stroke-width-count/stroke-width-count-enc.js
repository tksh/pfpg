///// Encode stroke-width and amount into a string from jsonl values /////

////////////////////////////////// Input: //////////////////////////////////

// From: './jsonl_extracted/%{ARTWORK_ID}_strokes_width_and_amount.jsonl'

// {"000_amount":[24,21,37,66,91,118,127]}
// {"000_width":[21,13,8,5,3,2,1]}
// {"fff_amount":[8,43]}
// {"fff_width":[2,1]}


////////////////////////////////// Output: //////////////////////////////////

// Map { 000 → "21y13v8L5bo3bN2co1cx", fff → "2b1j" }
//     size: 2
//     <entries>
//         0: 000 → "21y13v8L5bo3bN2co1cx"
//         1: fff → "2i1R"
//     <prototype>: Map.prototype { … }



function encodeWidthCount(uintN) { //'uint5 or 'uint8'
    // Read the Aggregated Data for Compression from .json as Map() grouped by group_id
    const aggDataMap = jsonToMapObj(`textarea-${uintN}portray-agg-data-for-comp-uploaded`)

    const encodedStrByGroupId = new Map()

    // Test
    // for ([groupId, aggDataObj] of aggDataMap) {
    //     console.log(groupId)                   // 1
    //     console.log(aggDataObj)                // {list_of_width: Array(1), count_by_width: Array(1), absolute: {…}, relative: {…}}
    //     console.log(aggDataObj.list_of_width)  // [3]
    //     console.log(aggDataObj.count_by_width) // [19]
    // }

    for ([groupId, aggDataObj] of aggDataMap) {
        const widthArr = aggDataObj.list_of_width
        const countArr = aggDataObj.count_by_width

        // Merge into a string
        let widthAndCountStr = ""
        for (let i = 0; i < widthArr.length; i++) {
            widthAndCountStr += widthArr[i]
            widthAndCountStr += base52Encode(countArr[i])
        }
        encodedStrByGroupId.set(groupId, widthAndCountStr)
    }
    return encodedStrByGroupId
}


function encodeStrokesInfo(uintX) {

    // Read from textarea
    const rawJsonLines = readTextarea(`textarea-${uintX}portray-strokes-info-uploaded`)
    //console.log('rawJsonLines: ', rawJsonLines)
    // rawJsonLines:
    // {"000_amount":[24,21,37,66,91,118,127]}
    // {"000_width":[21,13,8,5,3,2,1]}
    // {"fff_amount":[8,43]}
    // {"fff_width":[2,1]}


    const strokesInfoMap = new Map();

    rawJsonLines.split('\n').forEach((line) => {
        const obj = JSON.parse(line);
        for (const key in obj) {
            strokesInfoMap.set(key, obj[key]);
        }
    });

    //console.log(strokesInfoMap);
    //     <entries>
    //         0: 000_amount → Array(7) [ 24, 21, 37, … ]
    //         1: 000_width → Array(7) [ 21, 13, 8, … ]
    //         2: fff_amount → Array [ 8, 43 ]
    //         3: fff_width → Array [ 2, 1 ]

    const strokesInfoMapByColor = new Map();

    for (const key of strokesInfoMap.keys()) {
        let widthAndAmountStr = ""

        // Get the keys of width and amount by color, and get its values

        const index = key.indexOf("_"); // 3
        const hexColor = key.substr(0, index);  // 000, fff

        keyOfWidth = hexColor + '_width'
        keyOfAmount = hexColor + '_amount'

        const widthArray = strokesInfoMap.get(keyOfWidth)
        const amountArray = strokesInfoMap.get(keyOfAmount)
        //console.log('widthArray: ', widthArray) // Array(7) [ 21, 13, 8, 5, 3, 2, 1 ], Array [ 2, 1 ]
        //console.log('amountArray: ', amountArray) // Array(7) [ 24, 21, 37, 66, 91, 118, 127 ], Array [ 8, 43 ]

        // Merge into a string
        for (let i = 0; i < widthArray.length; i++) {
            widthAndAmountStr += widthArray[i]
            widthAndAmountStr += base52Encode(amountArray[i])
        }
        //console.log('widthAndAmountStr: ', widthAndAmountStr) // 21y13v8L5bo3bN2co1cx, 2i1R
        strokesInfoMapByColor.set(hexColor, widthAndAmountStr)
    }

    console.log('strokesInfoMapByColor: ', strokesInfoMapByColor);
    // Map { 000 → "21y13v8L5bo3bN2co1cx", fff → "2b1j" }
    //     size: 2
    //     <entries>
    //         0: 000 → "21y13v8L5bo3bN2co1cx"
    //         1: fff → "2i1R"
    //     <prototype>: Map.prototype { … }


    return strokesInfoMapByColor
}
