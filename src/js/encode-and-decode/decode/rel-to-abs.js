export
    { relToAbs
    , zip
    }

function relToAbs(relativeDvals, widthsAndCounts) {

    const x1Arr = relativeDvals[0] // [x1, x1, x1 ...]
    const y1Arr = relativeDvals[1] // [y1, y1, y1 ...]
    const x2Arr = relativeDvals[2] // [x2, x2, x2 ...]
    const y2Arr = relativeDvals[3] // [y2, y2, y2 ...]

    // Get the array of firstline indices for each stroke-width
    const firstlineIndices      = widthsAndCounts.firstlineIndices      // e.g.: Arr(4) [ 1, 4, 8, 25 ]
    const firstlineIndexArr = firstlineIndices.map(n => n - 1)  // e.g.: Arr(4) [ 0, 3, 7, 24 ]

    let absoluteCoordinates = [] // [[x1, y1, x2, y2], [x1, y1, x2, y2], ...]

    for (i = 0; i < x1Arr.length; i++) {
        if (firstlineIndexArr.includes(i)) {

            // x1 and y1 of each stroke-width's firstline is already as absolute value

            const x1 = x1Arr[i]
            const y1 = y1Arr[i]
            const x2 = x1Arr[i] + x2Arr[i]
            const y2 = y1Arr[i] + y2Arr[i]

            absoluteCoordinates.push([x1, y1, x2, y2])

        } else {
            const x1 = x1Arr[i] + absoluteCoordinates[i - 1][2] // + previous x2
            const y1 = y1Arr[i] + absoluteCoordinates[i - 1][3] // + previous y2
            const x2 = x2Arr[i] + x1                            // +  current x1
            const y2 = y2Arr[i] + y1                            // +  current y1

            absoluteCoordinates.push([x1, y1, x2, y2])
        }
    }

    // Convert the array structure to same as original relative values array.
    // From: [x1, y1, x2, y2] * length
    // To  : [x1, x1, ... x1] * 4 coords
    const absoluteDvals = zip(...absoluteCoordinates)

    return absoluteDvals
}





// Convert to Javascript from Deno standard library zip.ts
// https://github.com/denoland/deno_std/blob/main/collections/zip.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

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

// Define the zip function as before
function zip(...arrays) {
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
