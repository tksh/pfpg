// Convert to Javascript from Deno standard library zip.ts
// https://github.com/denoland/deno_std/blob/main/collections/zip.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

// Define the zip function as before
export function zip(...arrays) {
    // Assume that arrays is an array of arrays of the same length and type
    const minLength = minOf(arrays, (it) => it.length) || 0

    const ret = new Array(minLength)

    for (let i = 0; i < minLength; i += 1) {
        const arr = arrays.map((it) => it[i])
        // Assume that arr is an array of the same type as the elements of arrays
        ret[i] = arr
    }

    return ret
}
// Test
// console.log(zip([1, 2, 3], [4, 5, 6]))                 // [[1, 4], [2, 5], [3, 6]]
// console.log(zip(["a", "b", "c"], [true, false, true])) // [["a", true], ["b", false], ["c", true]]
// console.log(zip([1, 2], [3, 4], [5, 6], [7, 8]))       // [[1, 3, 5, 7], [2, 4, 6, 8]]


// Define a helper function that returns the minimum value of an array
function minOf(array, fn) {
    // Assume that array is not empty
    let min = fn(array[0])
    for (let i = 1; i < array.length; i += 1) {
        const value = fn(array[i])
        if (value < min) {
            min = value
        }
    }
    return min
}
