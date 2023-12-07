function swap63Decode(urlParamsAsMap) {
    // Read the shaped url params
    console.log('urlParamsAsMap: ', urlParamsAsMap)
    // Map(4) { artworkId → "202308_001", uintX → "5", rectFill → "ccc", groupedStrokes → Map(3) }
    //   size: 4
    //   <entries>
    //     0: artworkId → "202308_001"
    //     1: uintX → "5"
    //     2: rectFill → "ccc"
    //     3: groupedStrokes → Map(3) { 000 → (2) […], eee → (2) […], fff → (2) […] }
    //       <key>: "groupedStrokes"
    //       <value>: Map(3) { 000 → (2) […], eee → (2) […], fff → (2) […] }
    //         size: 3
    //         <entries>
    //           0: 000 → Array [ Map(3), (4) […] ]
    //           1: eee → Array [ Map(1), (4) […] ]
    //           2: fff → Array [ Map(1), (4) […] ]
    //             0: Map { 1 → 7 }
    //             1: Array(4) [ "Huxwxxu", "QcuywAw", "vtutuxx", … ]
    //               0: "Huxwxxu"
    //               1: "QcuywAw"
    //               2: "vtutuxx"
    //               3: "xyxywww"

    // Define the swap63 dictionary
    const dictMapToDec = generateSwap63DictToDec();
    console.log('dictMapToDec: ', dictMapToDec)
    // Map(63) { 0 → -31, 1 → -30, 2 → -29, 3 → -28, 4 → -27, 5 → -26, 6 → -25, 7 → -24, 8 → -23, 9 → -22, … }


    // Get the strokes values
    const groupedStrokesShaped = urlParamsAsMap.get('groupedStrokes')
    console.log('groupedStrokesShaped: ', groupedStrokesShaped)
    // Map(3) { 000 → Map(1), eee → Map(1), fff → Map(1) }


    // Decode dval array in Map()
    const groupedStrokesDecoded = decodeDval(groupedStrokesShaped, dictMapToDec)
    console.log('groupedStrokesDecoded: ', groupedStrokesDecoded)


    return groupedStrokesDecoded
}


// Decode swap63 for the dval array in Map(), keep any other values and structures
function decodeDval(groupedStrokes, dictMap) {
    const decodedMap = new Map()

    for (const [keyColor, infoAndDvalArray] of groupedStrokes) {
        console.log('infoAndDvalArray[0] is strokes info: ', infoAndDvalArray[0]) // Map(3) { 3 → 19, 2 → 16, 1 → 62 }
        console.log('infoAndDvalArray[1] is strokes dval: ', infoAndDvalArray[1]) // Array(4) [ "wyyvtuD..", "..", "..", ".."]

        let decodedFourDvalArray = []; // x1,y1,x2.y2

        for (const eachDvalStr of infoAndDvalArray[1]) { // from x1 to y2, four elements

            // Replace from char to number
            let decodedDvalArray = [];
            for (const char of eachDvalStr) {
                const decodedChar = dictMap.get(char)
                decodedDvalArray.push(decodedChar);
            }

            decodedFourDvalArray.push(decodedDvalArray)
        }
        decodedMap.set(keyColor, [infoAndDvalArray[0], decodedFourDvalArray]) // Map( keyColor -> [infoMap, dvalArray] )
    }

    console.log('decodedMap: ', decodedMap)
    // Map(3) { 000 → (2) […], eee → (2) […], fff → (2) […] }

    return decodedMap
}
