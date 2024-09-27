export function simplifyMap(complexMap) {
    return new Map(
        Array.from(complexMap, ([key, [value]]) => [key, value])
    )
}

/*

// 使用例
const complexMap = new Map([
    ['1', ['the',     4, object]],
    ['2', ['encoded', 7, object]],
    ['3', ['string',  6, object]]
])

const simplifiedMap = simplifyMap(complexMap)
console.log(simplifiedMap)

Map(3) {
    '1' => 'the',
    '2' => 'encoded',
    '3' => 'string'
}

*/