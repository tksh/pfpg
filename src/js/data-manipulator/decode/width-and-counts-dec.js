// Decode the count and width, and generate the firstline and lastline
function decodeWidthCountAsObj(encodedStr) {

    // Split the string into alternating numbers and base53 encoded strings
    const parts = encodedStr.match(/\d+|[_a-zA-Z]+/g);
    console.log(parts) // (14) ['1', 'ca', '2', 'dm', '3', 'dB', '5', 'bO', '8', 'm', '13', 'f', '21', 'L']


    // Width

    // Set the numbers and decoded strings into Map object
    // 配列のインデックス番号が2で割り切れる = 偶数 [0],[2],... の場合に 'width'要素を取得し キーとする
    const widthArray = parts.filter((_, i) => i % 2 === 0).map((part => part));
    console.log('widthArray: ', widthArray)


    // Count

    // Decode each base53 encoded string to a decimal number
    // インデックスiを2で割った余りが1と等しい = 2で割り切れるない= 奇数 の場合に要素を取得し デコードする
    const countsArray = parts.filter((_, i) => i % 2 === 1).map(part => base53Decode(part));
    console.log('countsArray: ', countsArray) // Array(7) [ 104, 168, 183, 92, 12, 5, 37 ]


    // Firstline

    const reducer = (acc, cur) => acc + cur;
    const initialValueOne = 1; // firstline number

    let firstlineArray = runningReduce(countsArray, reducer, initialValueOne);
    firstlineArray.unshift(1) // Add first element with Number 1
    firstlineArray.pop()                             // Delete last element
    //console.log('firstlineArray: ', firstlineArray)


    // Lastline

    const initialValueZero = 0; // firstline number

    let lastlineArray = runningReduce(countsArray, reducer, initialValueZero);
    lastlineArray.unshift(countsArray[0]) // Add first element with first 'count' element
    lastlineArray.pop()                             // Delete last element
    //console.log('lastlineArray: ', lastlineArray)


    // Return as Object
    return {
        count: countsArray,         // <Number>
        firstline: firstlineArray, // <Number>
        lastline: lastlineArray,   // <Number>
        width: widthArray          // <String>
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