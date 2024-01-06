function relToAbs(relativeArray) {

    const x1Array = relativeArray[0] // [x1, x1, x1 ...]
    const y1Array = relativeArray[1] // [y1, y1, y1 ...]
    const x2Array = relativeArray[2] // [x2, x2, x2 ...]
    const y2Array = relativeArray[3] // [y2, y2, y2 ...]

    let absoluteCoordinates = [] // [[x1, y1, x2, y2], [x1, y1, x2, y2], ...]

    for (i = 0; i < x1Array.length; i++) {
        if (i === 0) {
            const x1 = x1Array[i]
            const y1 = y1Array[i]
            const x2 = x1Array[i] + x2Array[i]
            const y2 = y1Array[i] + y2Array[i]

            absoluteCoordinates.push([x1, y1, x2, y2]) // index = 0

        } else {
            const x1 = x1Array[i] + absoluteCoordinates[i - 1][2] // + previous x2
            const y1 = y1Array[i] + absoluteCoordinates[i - 1][3] // + previous y2
            const x2 = x2Array[i] + x1                            // +  current x1
            const y2 = y2Array[i] + y1                            // +  current y1

            absoluteCoordinates.push([x1, y1, x2, y2]) // index = 1, 2, ...
        }
    }

    // Convert the array structure
    // From: [x1, y1, x2, y2] * length
    // To:   [x1, x1, x1 ...] * 4 columns
    const absoluteArray = zip(...absoluteCoordinates)

    return absoluteArray
}





// Convert to Javascript from Deno standard library zip.ts
// https://github.com/denoland/deno_std/blob/main/collections/zip.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

// Define a helper function that returns the minimum value of an array
function minOf(array, fn) {
    // Assume that array is not empty
    let min = fn(array[0]);
    for (let i = 1; i < array.length; i += 1) {
        const value = fn(array[i]);
        if (value < min) {
            min = value;
        }
    }
    return min;
}

// Define the zip function as before
function zip(...arrays) {
    // Assume that arrays is an array of arrays of the same length and type
    const minLength = minOf(arrays, (it) => it.length) || 0;

    const ret = new Array(minLength);

    for (let i = 0; i < minLength; i += 1) {
        const arr = arrays.map((it) => it[i]);
        // Assume that arr is an array of the same type as the elements of arrays
        ret[i] = arr;
    }

    return ret;
}

// Test the zip function with some examples
// console.log(zip([1, 2, 3], [4, 5, 6])); // [[1, 4], [2, 5], [3, 6]]
// console.log(zip(["a", "b", "c"], [true, false, true])); // [["a", true], ["b", false], ["c", true]]
// console.log(zip([1, 2], [3, 4], [5, 6], [7, 8])); // [[1, 3, 5, 7], [2, 4, 6, 8]]
