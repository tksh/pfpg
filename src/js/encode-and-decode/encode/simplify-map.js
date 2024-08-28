export function simplifyMap(complexMap) {
    return new Map(
        Array.from(complexMap, ([key, [value]]) => [key, value])
    );
}

/*

// 使用例
const complexMap = new Map([
    ['1', ['some',     4, 'STRING']],
    ['2', ['thing',    5, 'STRING']],
    ['3', ['to write', 8, 'STRING']]
]);

const simplifiedMap = simplifyMap(complexMap);
console.log(simplifiedMap);

Map(3) {
    '1' => 'some',
    '2' => 'thing',
    '3' => 'to write'
}

*/