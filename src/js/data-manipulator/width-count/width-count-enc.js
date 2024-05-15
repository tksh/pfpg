function encodeWidthCount() {
    // Read the Lines Data Aggregated for Encoding from .json as Map()
    const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

    const encodedStrByGroupId = new Map()

    for (let agg of aggDataMap.values()) {
        const widthArr = agg.stroke_width.list_of
        const countArr = agg.stroke_width.count_by

        // Merge into a string
        let widthAndCountStr = ""
        for (let i = 0; i < widthArr.length; i++) {
            widthAndCountStr += widthArr[i]
            widthAndCountStr += base53Encode(countArr[i])
        }
        encodedStrByGroupId.set(agg.g_id, widthAndCountStr)
    }
    return encodedStrByGroupId
}
