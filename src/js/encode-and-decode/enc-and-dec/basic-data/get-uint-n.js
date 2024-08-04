// Get the 'N' number of UIntNPortray

export function getUintN(n) {
    // Add 1 before judging, For 256 => 9, not 256 => 8
    const addOne = n + 1
    const gridsize_limit = nextPowerOfTwo(addOne) // e.g.: 256
    const uintN = (Math.log2(gridsize_limit))     // e.g.: 8
    return uintN
}
// Test
// console.log(getUintN(255)) // 8
// console.log(getUintN(256)) // 9
// console.log(getUintN(257)) // 9
// console.log(getUintN(30))  // 5
// console.log(getUintN(31))  // 5
// console.log(getUintN(32))  // 6


function nextPowerOfTwo(n) {
    // nが2のべき乗であればそのまま返す
    if (n && !(n & (n - 1))) return n;
    // nの2を底とする対数を求める
    let log2 = Math.log2(n);
    // 対数を切り上げる
    let ceil = Math.ceil(log2);
    // 2の切り上げた対数乗を返す
    return Math.pow(2, ceil);
}
// Test
// console.log(nextPowerOfTwo(255))    // 256
// console.log(nextPowerOfTwo(256))    // 256
// console.log(nextPowerOfTwo(257))    // 512
