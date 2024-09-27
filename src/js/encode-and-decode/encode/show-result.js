import { outputToTextarea }        from 'common-utils/output-to-textarea'
import { isOnDataManipulatorPage } from 'common-utils/select-output-textarea'
import { flagsMap
       , resultInfo }              from 'constants'
import { showProcessingTime }      from 'enc-and-dec/show-result'
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
    const inputName = 'Lines Data'

    // Output the encoded string to textarea
    outputToTextarea(encodedStrJoined, 'textarea-lines-data-encoded')

    // Show the size of result in html and console
    showStringSize(inputName, encodedStrJoined, 'encoded-lines-data-size')

    // Show the processing time in html and console
    const endTime = performance.now()
    const elapsedTime = Math.floor(endTime - startTime)
    showProcessingTime(`${encodingMethodName}Enc()`, elapsedTime, 'encoded-lines-data-time', isOnDataManipulatorPage())

    // Show the encoding result of each group in console
    showDetailsByGroups(inputName, encodedArrByGroups, encodingMethodName)
}


function showStringSize(inputName, inputStr, outputElemId) {
    console.log(`//////////////////////// Result of ${inputName} encoding ////////////////////////`)

    // Show the size in html
    const outputTextElem = document.getElementById(`${outputElemId}`)
    outputTextElem.textContent = `Encoded ${inputName} size: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Encoded as ${inputName} successfully, Size: `, inputStr.length)
}

function showDetailsByGroups(inputName, encodedArrByGroupsMap, encodingMethodName) {

    // Get the details of encoding result
    const keys   = [...encodedArrByGroupsMap.keys()]
    const values = [...encodedArrByGroupsMap.values()]
    console.log('values: ', values)  //
    /*
    values:
        Execute via bruteforce53Enc():
            (3) [Array(3), Array(3), Array(3)]
                0: Array(3)
                    0: "A=08fEKQ-VoisNalNhZy9GsmZzPU"   // String: lines group encoded
                    1: "bruteforce53"                   // String: encoding method name
                    2: {baseXNumber: 51}                // Object: encoding config value
                    length: 3
                1: Array(3)
                    ...
                2: Array(3)
                    ...

        Execute via bigint64Enc():
            (3) [Array(3), Array(3), Array(3)]
                0: Array(3)
                    0: "A=~1127b-NWrTPcKpRSjaX"         // String: lines group encoded
                    1: 22                               // String: encoding method name
                    2: {digitsPerChunk: 3}              // Object: encoding config value
                    length: 3
                1: Array(3)
                    ...
                2: Array(3)
                    ...

        Execute via bestMixFrom2Methods():
            (3) [Array(3), Array(3), Array(3)]
                0: Array(3)
                    0: (3) ['A=08fEKQ-VoisNalNhZy9GsmZzPU', 28, 51]  // array like result of single encoding method execution
                    1: 3                                             // number of elements of [0]-indexed array
                    2: "bruteforce53"                                // encoding method name
                    length: 3
                1: Array(3)
                    ...
                2: Array(3)
                    ...
    */

    // Extract from each group array's [0]-indexed array
    const groupColors    = values.map((value) => value[0].split('=')[0])
    const lengthOfValues = values.map((value) => value[0].length)
    const configValue    = values.map((value) => value[2])

    // Decode the flags from char to method name
    const flagsByGroups = resultInfo.get(`${encodingMethodName}`).get('flags')
    const flagsByKinds = zip(...Array.from(flagsByGroups))  // transpose the array structure
    const flag1 = flagsByKinds[0]
    const flag2 = flagsByKinds[1]
    const flag1Name = flag1.map(char => flagsMap.get('rev_1st').get(`${char}`))
    const flag2Name = flag2.map(char => flagsMap.get('rev_2nd').get(`${char}`))

    // Show in console
    console.log(`//////////////////////// Result of ${inputName} encoding details by group ////////////////////////`)
    console.log('Group ID: ', keys)                                     // e.g.: (3) [0, 1, 2]
    console.log('Group colors encoded: ', groupColors)                  // e.g.: (3) ['A', '0', 'F']
    console.log('Length of encoded strings: ', lengthOfValues)          // e.g.: (3) [23, 3910, 161]
    console.log('Flags: ', flagsByGroups)                                // e.g.: (3) [Array(3), Array(3), Array(3)]
    console.log('1st flags, Compression method name: ', flag1Name)      // e.g.: (3) ['uncompressed', 'uncompressed', 'uncompressed']
    console.log('2nd flags, Encoding method name: ',    flag2Name)      // e.g.: (3) ['bigint64', 'bigint64', 'bigint64']
    console.log('Configuration value for encoding: ',   configValue)  // bruteforce => baseXNumber, bigint64 => digitsPerChunk

    console.log("resultInfo: ", resultInfo)


    // Return the values to show also in html when call this function from best mix encoding (bestMixFromNMethods()).
    return new Map([
        ['gId', keys],
        ['colors', groupColors],
        ['length', lengthOfValues],
        ['flags', flagsByGroups],
        ['flag1', flag1],
        ['flag2', flag2]
    ])
}
