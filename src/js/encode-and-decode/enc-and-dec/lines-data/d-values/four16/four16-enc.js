import { tryDecompress }                from 'decode/try-decompress'
import { getFour16CharsSets }           from 'enc-and-dec/base-n/get-chars'
import { parseBasicData }               from 'enc-and-dec/basic-data/basic-data-enc'
import { encodeCoordsWithFourBase16 }   from 'enc-and-dec/lines-data/d-values/four16/encode-with-four-base16'
import { joinWithAmpersand }            from 'encode/join-with-ampersand'
import { jsonToMapObj }                 from 'encode/json-to-map-obj'
import { showResult }                   from 'encode/show-result'
import { convertResultsFromStrToArray } from 'encode/transform-encoded-result'
import { tryCompress }                  from 'encode/try-compress'


export function four16Enc() {
    const startTime = performance.now()

    const encodingMethodName = 'four16'
    const uintN = tryDecompress(parseBasicData().n)  // e.g.: 5
    const charsSets = getFour16CharsSets()           // e.g.: abcdefghijklmnop

    const encodedDvals = new Map()

    // For under UInt7Portray, Input the diff-by-row values
    if (uintN <= 7) {
        // Lines Data Aggregated for Encoding
        const aggDataMap = jsonToMapObj(`textarea-agg-data-for-comp-uploaded`)
        //console.log('aggDataMap: ', aggDataMap)         // Map(2) {'0' => {…}, '1' => {…}} <- Group ID keys are string
        const diffValues = aggDataMap.entries()           // MapIterator {'0' => {…}, '1' => {…}}

        diffValues.forEach(([gId, values]) => {
            const coords = values.d.relative.diff_by_row  // {x1: Array(2), y1: Array(2), x2: Array(2), y2: Array(2)}
            const encodedCoords = encodeCoordsWithFourBase16(coords, charsSets)

            encodedDvals.set(Number(gId), encodedCoords)  // Group ID keys converted to integer
        })

        // For UInt8Portray, Input the relative d values
    } else if (uintN === 8) {
        // Lines Data
        const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')

        const relValues = linesDataMap.entries()

        relValues.forEach(([gId, values]) => {
            const coords = values.d.relative
            const encodedCoords = encodeCoordsWithFourBase16(coords, charsSets)

            encodedDvals.set(Number(gId), encodedCoords)
        })

    } else {
        const errorMessage = `Error encoding via four16-enc, it must be up to UInt8Portray(255 x 255) rule-set`
        console.error(errorMessage)
    }
    //console.log('encodedDvals: ', encodedDvals)  // e.g.: Map(2) {0 => 'lKaBHaabha', 1 => 'babfB ...



    // Choose shorter one between URLComp applied or not, by each group
    const { compressedByGroups, _ } = tryCompress(
        encodedDvals,
        encodingMethodName
    )
    console.log('compressedByGroups: ', compressedByGroups)
    // e.g.:  Map(2) {0 => 'F=~323b-lKaBHaabha', 1 => '0=09MCN ...


    // Whole group strings joined with '&' (ampersand sign)
    const wholeGroupJoined = joinWithAmpersand(compressedByGroups)
    console.log('||||wholeGroupJoined: ', wholeGroupJoined)
    // Convert the structure of values
    const configValue = undefined
    const encodedArrByGroups = convertResultsFromStrToArray(compressedByGroups, encodingMethodName, configValue)
    console.log('||||encodedArrByGroups: ', encodedArrByGroups)

    // Show the encoded result and processing time to html and console
    showResult(
        encodingMethodName,
        startTime,
        wholeGroupJoined, encodedArrByGroups  // encoded data
    )

    return encodedArrByGroups

}
