export function chunk(array, size) {if (size <= 0 || !Number.isInteger(size)) {throw new Error(`Expected size to be an integer greater than 0 but found ${size}`,)}
if (array.length === 0) {return []}
const ret = Array.from({ length: Math.ceil(array.length / size) })
let readIndex = 0
let writeIndex = 0
while (readIndex < array.length) {ret[writeIndex] = array.slice(readIndex, readIndex + size)
writeIndex += 1
readIndex += size}
return ret}