import { base53Dec } from 'enc-and-dec/base-n/base-53-dec'


// Decode the count and width, and generate the firstline and lastline
export function decodeWidthAndCounts(encodedStr) {

    // Split the string into alternating numbers and base53 encoded strings
    const parts = encodedStr.match(/\d+|[_a-zA-Z]+/g);
    console.log(parts) // (14) ['1', 'ca', '2', 'dm', '3', 'dB', '5', 'bO', '8', 'm', '13', 'f', '21', 'L']


    // Width (list of stroke-width)

    // Set the numbers and decoded strings into Map object
    // 配列のインデックス番号が2で割り切れる = 偶数 [0],[2],... の場合に 'width'要素を取得し キーとする
    const widthArr = parts.filter((_, i) => i % 2 === 0).map((part => Number(part)));
    console.log('widthArr: ', widthArr)


    // Counts (count by stroke-width)

    // Decode each base53 encoded string to a decimal number
    // インデックスiを2で割った余りが1と等しい = 2で割り切れるない= 奇数 の場合に要素を取得し デコードする
    const countsArr = parts.filter((_, i) => i % 2 === 1).map(part => base53Dec(part));
    console.log('countsArr: ', countsArr) // Arr(7) [ 104, 168, 183, 92, 12, 5, 37 ]


    // Firstline indices

    const reducer = (acc, cur) => acc + cur;
    const initialValueOne = 1; // firstline number

    let firstlineArr = runningReduce(countsArr, reducer, initialValueOne);
    firstlineArr.unshift(1) // Add first element with Number 1
    firstlineArr.pop()      // Delete last element
    //console.log('firstlineArr: ', firstlineArr)
    // e.g.: Arr(4) [ 1, 4, 8, 25 ]


    // Lastline indices

    const initialValueZero = 0; // firstline number

    let lastlineArr = runningReduce(countsArr, reducer, initialValueZero);
    //console.log('lastlineArr: ', lastlineArr)
    // e.g.: Arr(4) [ 3, 7, 24, 91 ]


    // Return as Object
    return {
        firstline: firstlineArr,  // <Number>
        lastline : lastlineArr,   // <Number>
        width    : widthArr       // <Number>
    }
}



// Convert to Javascript from Deno standard library running_reduce.ts

// https://github.com/denoland/deno_std/blob/main/collections/running_reduce.ts
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.

function runningReduce(array, reducer, initialValue) {
    let currentResult = initialValue;
    return array.map((el, currentIndex) =>
        currentResult = reducer(currentResult, el, currentIndex)
    );
}