import { getUintNFromUrlParams } from 'decode/get-uint-n'
import { getFour16CharsSets }    from 'enc-and-dec/base-n/get-chars'
import { diffToRel }             from 'enc-and-dec/lines-data/d-values/bruteforce53/diff-to-rel'
import { decodeWithFourBase16 }  from 'enc-and-dec/lines-data/d-values/four16/decode-with-four-base16'
import { chunk }                 from 'libs/deno-std/chunk'

export function four16Dec(encodedDvalsStr) {

    // Decode with custom base16 encodings
    const decodedCoords = decodeAsCoords(encodedDvalsStr)
    const dividedCoords = chunk(decodedCoords, decodedCoords.length / 4)  // Divide to form: [x1, y1, x2, y2]

    // Return as relative d values
    const uintN = getUintNFromUrlParams()
    if (uintN <= 7) {
        // Convert from diff-by-row to relative d values.
        return dividedCoords.map(coord => diffToRel(coord))

    } else if (uintN === 8) {
        // Already relative d values, just return it.
        return dividedCoords
    }
}

function decodeAsCoords(str) {
    const charsSets = getFour16CharsSets()

    let splitted = []
    let i = 0

    while (i < str.length) {
        console.log(`Processing character at index ${i}: ${str[i]}`)

        try {
            if (charsSets.p1.includes(str[i])) {
                // charsSets.p1 文字列セット に含まれるならば 1文字ごとに デコードして 配列に格納
                splitted.push(decodeWithFourBase16(str[i], charsSets.p1))
                i++
            } else if (charsSets.n1.includes(str[i])) {
                // charsSets.n1 文字列セット に含まれるならば 1文字ごとに デコードして マイナス記号を付加して 配列に格納
                splitted.push('-' + decodeWithFourBase16(str[i], charsSets.n1))
                i++
            } else if (charsSets.p2.includes(str[i])) {
                // charsSets.p2 文字列セット に含まれるならば 2文字ごとに デコードして 配列に格納
                splitted.push(decodeWithFourBase16(str[i] + str[i + 1], charsSets.p2))
                i += 2
            } else if (charsSets.n2.includes(str[i])) {
                // charsSets.n2 文字列セット に含まれるならば 2文字ごとに デコードして マイナス記号を付加して 配列に格納
                splitted.push('-' + decodeWithFourBase16(str[i] + str[i + 1], charsSets.n2))
                i += 2
            }
        } catch (error) {
            console.error("Error in decodeAsCoords:", error)
            break
        }
    }

    return splitted
}
