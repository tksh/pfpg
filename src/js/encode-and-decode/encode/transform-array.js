export
    { createMapFromNestedArrays
    , mergeArrays
    }



function createMapFromNestedArrays(array) {
    const map = new Map()

    array.forEach(subArray => {
        const [key, ...rest] = subArray     // キーと残りの要素を分割

        if (!map.has(key)) {                // キーが存在しなければ、新しい配列を作成
            map.set(key, [])
        }
        map.get(key).push(rest)             // 値を配列に追加
    })

    return map
}              // test comment

/*
// Test:
const inputArray = [
    [0, 52, 20],        // [groupId, baseXNum, stringLength]
    [1, 52, 3497],
    [2, 52, 144],
    [0, 51, 20],
    [1, 51, 3236],
    [2, 51, 140],
    [0, 50, 20],
    [1, 50, 3082],
    [2, 50, 139]
]

const result = createMapFromNestedArrays(inputArray)
console.log(result)

// 出力結果:
// Map(3) {
//   0 => [ [52, 20], [51, 20], [50, 20] ],
//   1 => [ [52, 3497], [51, 3236], [50, 3082] ],
//   2 => [ [52, 144], [51, 140], [50, 139] ]
// }
*/



function mergeArrays(arr1, arr2) {
    return arr1.map((subArray, index) => {
        return [...subArray, ...arr2[index]]
    })
}

/*
// 使用例:
const resultNumArrByGroups = [
    [0, 52, 20],
    [1, 52, 3497],
    [2, 52, 144],
    // 他の要素...
]

const compressingResultArr = [
    [27, 27, 'uncompressed'],
    [3511, 2709, 'URLCompressor'],
    [149, 133, 'URLCompressor'],
    // 他の要素...
]

const mergedResult = mergeArrays(resultNumArrByGroups, compressingResultArr)
console.log(mergedResult)

// 出力結果:
// [
//     [0, 52, 20, 27, 27, 'uncompressed'],
//     [1, 52, 3497, 3511, 2709, 'URLCompressor'],
//     [2, 52, 144, 149, 133, 'URLCompressor'],
//     // 他の要素...
// ]
*/