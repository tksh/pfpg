function extractDValues() {

    const strokesvaluesAsjsonLines = readTextarea('textarea-uint5portray-strokes-values-uploaded')
    const strokesvaluesAsMapRelDvalOnly = jsonlinesToMapObjRelDvalOnly(strokesvaluesAsjsonLines)
    //console.log('strokesvaluesAsMapRelDvalOnly: ', strokesvaluesAsMapRelDvalOnly)
    // Map(4) { 000_rel_x1 → (122) […], 000_rel_y1 → (122) […], 000_rel_x2 → (122) […], 000_rel_y2 → (122) […] }


    const strokesvaluesMapByColor = flatMapToGroupedMapByColor(strokesvaluesAsMapRelDvalOnly)
    //console.log('strokesvaluesMapByColor: ', strokesvaluesMapByColor)
    // Map { 000 → Map(4) }
    // 0: 000 → Map(4) { 000_rel_x1 → (122) […], 000_rel_y1 → (122) […], 000_rel_x2 → (122) […], … }


    // Concatenate the whole dval from X1 to Y2
    const concatenatedDvalByColor = new Map();

    for ([keyColor, valueDvalMap] of strokesvaluesMapByColor) {
        const concatenatedDval = [].concat(...valueDvalMap.values())
        concatenatedDvalByColor.set(keyColor, concatenatedDval)
    }
    //console.log('concatenatedDvalByColor: ', concatenatedDvalByColor)
    // Map { 000 → (488) […] }
    // 0: 000 → Array(488) [ 13, 1, 0, … ]

    return concatenatedDvalByColor
}

// Array(488) [ "13", "10", "-2", "4", "1", "-5", "2", "3", "0", "-2", … ]
// 488 = 122 paths * 4 coordinates (x1,y1,x2,y2)
