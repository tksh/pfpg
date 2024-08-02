function encodeWidthAndCounts() {
    // Read the Lines Data Aggregated for Encoding from .json as Map()
    const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

    const encodedStrByGroup = new Map()

    for (let agg of aggDataMap.values()) {
        const widthArr  = agg.stroke_width.list_of
        const countsArr = agg.stroke_width.count_by

        // Merge into a string
        let widthAndCountsStr = ""
        for (let i = 0; i < widthArr.length; i++) {
            widthAndCountsStr += widthArr[i]
            widthAndCountsStr += base53Encode(countsArr[i])
        }
        encodedStrByGroup.set(agg.g_id, widthAndCountsStr)
    }
    return encodedStrByGroup
}
