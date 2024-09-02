import { flagsMap, resultInfo } from 'constants'
import { zip }                  from 'decode/rel-to-abs'


export
    { showStringSize
    , showDetailsByGroup
    }

function showStringSize(nameOfInput, inputStr, outputElemId) {
    console.log(`//////////////////////// Result of ${nameOfInput} encoding ////////////////////////`)

    // Show the size in html
    const outputTextElem = document.getElementById(`${outputElemId}`)
    outputTextElem.textContent = `Encoded ${nameOfInput} size: ${inputStr.length} characters (bytes)`

    // Show the size in console
    console.log(`Encoded as ${nameOfInput} successfully, Size: `, inputStr.length);
}

function showDetailsByGroup(nameOfInput, encodedArrByGroupMap, encodingMethodName) {
    console.log('encodedArrByGroupMap: ', encodedArrByGroupMap)
    /*
        Map(2) {'0' => Array(3), '1' => Array(3)}
            key: "0"
            value: (3) ['A=08T6FAhdHhNtMe0ws2FHUnU6v', 23, 'bigint64']
            ...
    */

    // Get the details of encoding result
    const keys   = [...encodedArrByGroupMap.keys()]
    const values = [...encodedArrByGroupMap.values()]
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
    const flagsByGroup = resultInfo.get(`${encodingMethodName}`).get('flags')
    const flagsByKinds = zip(...Array.from(flagsByGroup))  // transpose the array structure
    const flag1 = flagsByKinds[0]
    const flag2 = flagsByKinds[1]
    const flag1Name = flag1.map(char => flagsMap.get('rev_1st').get(`${char}`))
    const flag2Name = flag2.map(char => flagsMap.get('rev_2nd').get(`${char}`))

    // Show in console
    console.log(`//////////////////////// Result of ${nameOfInput} encoding details by group ////////////////////////`)
    console.log('Group ID: ', keys)                                     // e.g.: (3) [0, 1, 2]
    console.log('Group colors encoded: ', groupColors)                  // e.g.: (3) ['A', '0', 'F']
    console.log('Length of encoded strings: ', lengthOfValues)          // e.g.: (3) [23, 3910, 161]
    console.log('Flags: ', flagsByGroup)                                // e.g.: (3) [Array(3), Array(3), Array(3)]
    console.log('1st flags, Compression method name: ', flag1Name)      // e.g.: (3) ['uncompressed', 'uncompressed', 'uncompressed']
    console.log('2nd flags, Encoding method name: ',    flag2Name)      // e.g.: (3) ['bigint64', 'bigint64', 'bigint64']
    console.log('Configuration value for encoding: ',   configValue)  // bruteforce => baseXNumber, bigint64 => digitsPerChunk

    console.log("resultInfo: ", resultInfo)


    // Return the values to show also in html when call this function from best mix encoding (bestMixFromNMethods()).
    return new Map([
        ['gId', keys],
        ['colors', groupColors],
        ['length', lengthOfValues],
        ['flags', flagsByGroup],
        ['flag1', flag1],
        ['flag2', flag2]
    ]);
}
