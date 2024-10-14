import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { showProcessingTime }      from 'common-utils/show-processing-time'
import { flagsMap
       , resultInfo}               from 'constants'
import { zip }                     from 'libs/deno-std/zip'

export
    { showResult
    , showStringSize
    , showDetailsByGroups
    }

/**
 * Show the encoded result and processing time to html and console
 * @param {string} encodingMethodName - e.g.: 'bruteforce53', 'bigint64'
 * @param {number} startTime
 * @param {string} encodedStrJoined   - e.g.: 'F=~323b-lKaRXaarxa&0=09MCNiZae ... YlU'
 * @param {Map}    encodedArrByGroups - e.g.: Map(2) {0 => Array(3), 1 => Array(3)}
 *                                              Array(3) contains [encoded data {string}, method name {string}, config value {object}]
 */
function showResult(encodingMethodName, startTime, encodedStrJoined, encodedArrByGroups) {
    const inputDataTitle = `Lines Data encoding via '${encodingMethodName}Enc()'`

    // Output the encoded string to textarea
    outputToTextarea(encodedStrJoined, 'textarea-lines-data-encoded')

    // Show the size of result in html and console
    showStringSize(inputDataTitle, encodedStrJoined, 'encoded-lines-data-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime(`${encodingMethodName}Enc()`, elapsedTime, 'encoded-lines-data-time', isOnDataManipulatorPage())

    // Show the encoding result of each group in console
    showDetailsByGroups(encodedArrByGroups, encodingMethodName)
}


function showStringSize(inputDataTitle, inputStr, outputElemId) {
    console.log(`//////////////////////// Result: ${inputDataTitle} ////////////////////////`)

    // Show the size in html
    const outputTextElem = document.getElementById(`${outputElemId}`)
    outputTextElem.textContent = `Result length of ${inputDataTitle}: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Length of encoded string via: `, inputStr.length)
}

function showDetailsByGroups(encodedArrByGroupsMap, encodingMethodName) {

    // Get the details of encoding result
    const keys   = [...encodedArrByGroupsMap.keys()]
    const values = [...encodedArrByGroupsMap.values()]

    // Extract from each group array's [0]-indexed array
    const groupColors    = values.map((value) => value[0].split('=')[0])
    const lengthOfValues = values.map((value) => value[0].length)
    const configValue    = values.map((value) => value[2])

    // Decode the flags from char to method name
    const flagsByGroups = resultInfo.get(`${encodingMethodName} Flags`)  // e.g.: (2) [Array(2), Array(2)]
    const flagsByKinds = zip(...Array.from(flagsByGroups))               // transpose the array structure
    const flag1 = flagsByKinds[0]
    const flag2 = flagsByKinds[1]
    const flag1Name = flag1.map(char => flagsMap.get('rev_1st').get(`${char}`))
    const flag2Name = flag2.map(char => flagsMap.get('rev_2nd').get(`${char}`))

    // Show in console
    console.log(`//////////////////////// Details by groups: ////////////////////////`)
    console.log('Encoded string values by groups: ', values)
    console.log('Group ID: ', keys)                                   // e.g.: (3) [0, 1, 2]
    console.log('Group colors encoded: ', groupColors)                // e.g.: (3) ['A', '0', 'F']
    console.log('Length of encoded strings: ', lengthOfValues)        // e.g.: (3) [23, 3910, 161]
    console.log('Flags by groups: ', ...Array.from(flagsByGroups))              // e.g.: (2) ['~', '1'] (2) ['~', '1']
    console.log('1st flags - Compression method name: ', flag1Name)    // e.g.: (3) ['uncompressed', 'uncompressed', 'uncompressed']
    console.log('2nd flags - Encoding method name: ',    flag2Name)    // e.g.: (3) ['bigint64', 'bigint64', 'bigint64']
    console.log('Configuration value for encoding: ',   configValue)  // bruteforce => baseXNumber, bigint64 => digitsPerChunk

    console.log("resultInfo: ", resultInfo)


    // Return the values to show also in html when call this function from best mix encoding (bestMixEnc()).
    return new Map([
        ['gId', keys],
        ['colors', groupColors],
        ['length', lengthOfValues],
        ['flags', flagsByGroups],
        ['flag1', flag1],
        ['flag2', flag2]
    ])
}
