import { encodeGroupColors }     from 'enc-and-dec/lines-data/group-colors/group-colors-enc'
import { encodeWidthsAndCounts } from 'enc-and-dec/lines-data/widths-and-counts/widths-and-counts-enc'

export function getEncodedAttrsExceptsDvals() {
    return {
        widthsAndCounts: encodeWidthsAndCounts(),
        groupColors: encodeGroupColors()
    }
}