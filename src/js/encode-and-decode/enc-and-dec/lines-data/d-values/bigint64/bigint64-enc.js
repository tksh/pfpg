import { showProcessingTime }          from 'enc-and-dec/show-result'
import { base64UrlEnc }                from 'enc-and-dec/base-n/base-64url-enc'
import { parseBasicData }              from 'enc-and-dec/basic-data/basic-data-enc'
import { getDigitsPerChunk }           from 'enc-and-dec/lines-data/d-values/bigint64/digits-per-chunk'
import { getEncodedAttrsExceptsDvals } from 'encode/get-attrs-excepts-dvals'
import { joinWithAmpersand }           from 'encode/join-with-ampersand'
import { showStringSize
       , showDetailsByGroup }          from 'encode/show-result'
import { tryCompress }                 from 'encode/try-compress'
import { jsonToMapObj }                from 'encode/json-to-map-obj'
import { outputToTextarea }            from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage }     from 'common-utils/select-output-textarea'


export function bigint64Enc() {
    const startTime = performance.now()

    // Get the lines data

    // Read the relative d values from .json as Map()
    const linesDataMap = jsonToMapObj('textarea-lines-data-uploaded')
    //console.log('linesDataMap: ', linesDataMap) // Map { 0 → {…}, 1 → {…} }


    // Bigint64 encoding apply to absolute d values

    const digitsPerChunk = getDigitsPerChunk(parseBasicData().n)
    const encodedDvals = base64UrlEncAfterJoinAsBigint(linesDataMap, digitsPerChunk)
    //console.log("encodedDvals: ", encodedDvals)
    // Map { 1 → "BsmvdfXHD12-EB_BesTenvoA_x-Nt6Ir73u4cAK5rBuSbnWTQPkCe-GP6Yh ... " }



    // Try compress and add prefix

    // 1. Prepend the encoded stroke-width value and counts to the beginning of encoded d values
    // 2. Compress the combined string using URLCompressor and choose the shorter version.
    // 3. Prepend the encoded group-colors value to the chosen string (compressed or original).

    // Format: [group-colors]=[width-and-counts]-[d-values]


    // Get the encoded strings of width-and-counts and group-colors
    const encodedAttrsExceptsDvals = getEncodedAttrsExceptsDvals()

    // Choose shorter one between URLComp applied or not, by each group
    const { compressedByGroup, compressingResultArr } = tryCompress(
        encodedDvals,
        encodedAttrsExceptsDvals,
        'bigint64'
    )
    //console.log('compressedByGroup: ', compressedByGroup)
    // Map(5) {'1' => '0=129CaJGsAQK33q3FDaoQNuZs6u8XQW_EYegViBcDQ0gxtk-YqavrFw0V3KXggctKtnLfj_rl3ZzTzitfvmVp-Wz09Um3k4e8YyZ9kGHG0aT', '2' => '0=129ziJH ...

    // Whole group strings joined with '&' (ampersand sign)
    const wholeGroupJoined = joinWithAmpersand(compressedByGroup)


    // Output to textarea
    outputToTextarea(wholeGroupJoined, 'textarea-lines-data-encoded')
    // 0=129CaJGsAQK33q3FDaoQNuZs6u8XQW_EYegViBcDQ0gxtk-YqavrFw0V3KXggctKtnLfj_rl3ZzTzitfvmVp-Wz09Um3k4e8YyZ9kGHG0aT&0=129ziJH ...

    // Show the size of result in html and console
    showStringSize('Lines Data', wholeGroupJoined, 'encoded-strokes-values-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime('bigint64Enc()', elapsedTime, 'encoded-strokes-values-time', isOnDataManipulatorPage())

    // Convert the structure of values
    // from:
    //     Values: encoded string
    // to:
    //     Values: [encoded string, encoding-method name, configuration-value object]
    const encodedArrByGroup = new Map(
        Array.from(compressedByGroup, ([key, value]) => [
            key, [value, 'bigint64', { digitsPerChunk }]
        ])
    )

    // Show the encoding result of each group in console
    showDetailsByGroup('Lines Data', encodedArrByGroup, 'bigint64')

    return encodedArrByGroup
}


// Bigint64 encode

function padZero(number, targetLength) {
    return String(number).padStart(targetLength, '0');
}


function base64UrlEncAfterJoinAsBigint(linesDataMap, digitsPerChunk) {
    const encodedDvals = new Map();

    for (const linesData of linesDataMap.values()) {

        // absolute d values array in obj, x1 to y2
        const absDvals = linesData.d.absolute

        // Pad and join
        let joinedDvalsStr = ""; // x1, y1, x2, y2, joined without spaces

        for (const key in absDvals) {
            const dval = absDvals[key]
            //console.log(dval); // (19) [1, 4, 7, 6, 8, 7, 19, 25, 24, 28, 30, 17, 4, 22, 26, 22, 22, 23, 23]

            // Pad
            const paddedDval = dval.map(number => padZero(number, digitsPerChunk))
            //console.log("paddedDval: ", paddedDval)
            // (19) ['01', '04', '07', '06', '08', '07', '19', '25', '24', '28', '30', '17', '04', '22', '26', '22', '22', '23', '23']

            // Join
            const joinedDval = paddedDval.join('')
            //console.log("joinedDvals: ", joinedDvals)
            // 01040706080719252428301704222622222323

            joinedDvalsStr = joinedDvalsStr + joinedDval
        }
        console.log("joinedDvalsStr: ", joinedDvalsStr) // x1 + y1 + x2 + y2
        // 01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710

        // Encode with Base64 URL safe encode
        const joinedDvalsBigInt = BigInt(joinedDvalsStr)
        const base64EncodedDvalsStr = base64UrlEnc(joinedDvalsBigInt)

        encodedDvals.set(linesData.g_id, base64EncodedDvalsStr)
    }

    // Encoded
    //console.log("encodedDvals: ", encodedDvals)
    // Map(5) {'1' => '01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710', '2' => ...

    return encodedDvals
}