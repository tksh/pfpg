function getUintNPortrayForEnc() {
  // Read from textarea
  const rawJson = readTextarea('textarea-artwork-data-uploaded')

  // Parse as JSON
  const artworkDataObj = JSON.parse(rawJson)

  // Size
  const grid_size_str = artworkDataObj.grid_size
  const split_by_x = grid_size_str.split('x')            // (2) ['255', '255']
  const max = Math.max(...split_by_x)                     // 255
  const uintN = getUintN(max)                             // 8 (2 の 何乗か？)

  return uintN
}



function getUintN(n) {
  // Add 1 before judging, For 256 => 9, not 256 => 8
  addOne = n + 1

  gridsize_limit = nextPowerOfTwo(addOne) // 256
  uintN = (Math.log2(gridsize_limit))     // 8

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
