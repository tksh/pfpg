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
                    0: "A=08fEKQ-VoisNalNhZy9GsmZzPU"   // string
                    1: 28                               // length of string
                    2: 51                               // number of baseX
                    length: 3
                1: Array(3)
                    ...
                2: Array(3)
                    ...

        Execute via bigint64Enc():
            (3) [Array(3), Array(3), Array(3)]
                0: Array(3)
                    0: "A=~1127b-NWrTPcKpRSjaX"         // string
                    1: 22                               // length of string
                    2: "bigint64"                       // encoding method name
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
    values.map((value) => console.log("value in .map(): ", value))
    // e.g.: A=08fEKQ-VoisNalNhZy9GsmZzPU, ...

    // Extract from each group array's [0]-indexed array
    const groupColors    = values.map((value) => value[0].split('=')[0])
    const lengthOfValues = values.map((value) => value[1])
    const appliedMethod  = values.map((value) => value[2])

    if (encodingMethodName === 'test') {
    // if (encodingMethodName === 'best-mix') {

        // Extract actually applied flags for each group.
        // Only for when executed as best-mix encoding.

        //console.log("resultInfo: ", resultInfo)  // e.g.: Map(2) {'bruteforce53' => Map(1), 'bigint64' => Map(1)}
        //console.log("appliedMethod: ", appliedMethod)  // e.g.: (3) ['bigint64', 'bruteforce53', 'bruteforce53']

        // 実際に適用された圧縮メソッドに対応する フラグ文字列の配列だけを取り出すための 新しい配列
        let appliedFlagsByGroup = [];

        // appliedMethod配列をループし、対応するフラグ文字列の配列を取得して appliedFlagsByGroupに追加
        appliedMethod.forEach((methodName, index) => {
            const flagsMap = resultInfo.get(methodName);
            if (flagsMap) {
                const flagsArray = flagsMap.get('flags');
                if (flagsArray && index < flagsArray.length) { // indexを使用して対応するフラグ配列を取得
                    appliedFlagsByGroup.push(flagsArray[index]);
                }
            }
        });

        console.log("appliedFlagsByGroup: ", appliedFlagsByGroup)  // e.g.: (3) [Array(2), Array(2), Array(2)]
        const appliedFlagsMap = new Map()
        appliedFlagsMap.set('flags', appliedFlagsByGroup)
        resultInfo.set(`${encodingMethodName}`, appliedFlagsMap)



    }

    console.log("resultInfo: ", resultInfo)

    const flagsByGroup = resultInfo.get(`${encodingMethodName}`).get('flags')
    console.log("flagsByGroup: ", flagsByGroup)

    // Decode the flags from char to method name
    const flagsByKinds = zip(...Array.from(flagsByGroup))  // transpose the array structure
    const flag1 = flagsByKinds[0]
    const flag2 = flagsByKinds[1]
    const flag1Name = flag1.map(char => flagsMap.get('rev_1st').get(`${char}`))
    const flag2Name = flag2.map(char => flagsMap.get('rev_2nd').get(`${char}`))

    // Show in console
    console.log(`//////////////////////// Result of ${nameOfInput} encoding details by group ////////////////////////`)
    console.log('Group key numbers: ', keys)                      // e.g.: (3) [0, 1, 2]
    console.log('Group colors encoded: ', groupColors)            // e.g.: (3) ['A', '0', 'F']
    console.log('Length of encoded strings: ', lengthOfValues)    // e.g.: (3) [23, 3910, 161]
    console.log('Flags: ', flagsByGroup)                          // e.g.: (3) [Array(3), Array(3), Array(3)]
    console.log('1st flags, Compression method name', flag1Name)  // e.g.: (3) ['uncompressed', 'uncompressed', 'uncompressed']
    console.log('2nd flags, Encoding method name',    flag2Name)  // e.g.: (3) ['bigint64', 'bigint64', 'bigint64']


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
