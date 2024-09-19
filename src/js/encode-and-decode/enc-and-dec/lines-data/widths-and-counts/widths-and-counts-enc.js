import { base53Enc }    from 'enc-and-dec/base-n/base-53-enc'
import { jsonToMapObj } from 'encode/json-to-map-obj'


export function encodeWidthsAndCounts() {
    // Read the Lines Data Aggregated for Encoding from .json as Map()
    const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)

    const encodedStrByGroups = new Map()

    for (let agg of aggDataMap.values()) {
        const widths = agg.stroke_width.widths
        const counts = agg.stroke_width.counts

        // Merge into a string
        let widthsAndCountsStr = ""
        for (let i = 0; i < widths.length; i++) {
            widthsAndCountsStr += widths[i]
            widthsAndCountsStr += base53Enc(counts[i])
        }
        encodedStrByGroups.set(agg.g_id, widthsAndCountsStr)
    }
    return encodedStrByGroups
}
