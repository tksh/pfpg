import { encodeGroupColors }    from 'enc-and-dec/lines-data/group-colors/group-colors-enc'
import { encodeWidthAndCounts } from 'enc-and-dec/lines-data/width-and-counts/width-and-counts-enc'

export function getEncodedAttrsExceptsDvals() {
    return {
        widthAndCounts: encodeWidthAndCounts(),
        groupColors: encodeGroupColors()
    }
}