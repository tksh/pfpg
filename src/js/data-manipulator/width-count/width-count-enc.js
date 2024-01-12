function encodeWidthCount() {
    // Read the Aggregated Data for Compression from .json as Map() grouped by group_id
    const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

    const encodedStrByGroupId = new Map()

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
            widthAndCountStr += base53Encode(countArr[i])
        }
        encodedStrByGroupId.set(groupId, widthAndCountStr)
    }
    return encodedStrByGroupId
}
