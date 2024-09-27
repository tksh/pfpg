// Convert to Javascript from Deno standard library running-reduce.ts

// https://github.com/denoland/deno_std/blob/main/collections/running-reduce.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

export function runningReduce(array, reducer, initialValue) {
    let currentResult = initialValue
    return array.map((el, currentIndex) =>
        currentResult = reducer(currentResult, el, currentIndex)
    )
}