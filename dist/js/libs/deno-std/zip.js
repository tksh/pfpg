export function zip(...arrays) {const minLength = minOf(arrays, (it) => it.length) || 0
const ret = new Array(minLength)
for (let i = 0; i < minLength; i += 1) {const arr = arrays.map((it) => it[i])
ret[i] = arr}
return ret}
function minOf(array, fn) {let min = fn(array[0])
for (let i = 1; i < array.length; i += 1) {const value = fn(array[i])
if (value < min) {min = value}}
return min}