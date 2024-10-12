import { base53Dec }     from 'enc-and-dec/base-n/base-53-dec'
import { runningReduce } from 'libs/deno-std/running-reduce'


// Decode the count and width, and generate the firstline and lastline
export function decodeWidthsAndCounts(encodedStr) {

    // Split the string into alternating numbers and base53 encoded strings
    const parts = encodedStr.match(/\d+|[_a-zA-Z]+/g)
    console.log(parts) // (14) ['1', 'ca', '2', 'dm', '3', 'dB', '5', 'bO', '8', 'm', '13', 'f', '21', 'L']


    // Width (list of stroke-width)

    // Set the numbers and decoded strings into Map object
    // 配列のインデックス番号が2で割り切れる = 偶数 [0],[2],... の場合に 'width'要素を取得し キーとする
    const widths = parts.filter((_, i) => i % 2 === 0).map((part => Number(part)))
    console.log('widths: ', widths)


    // Counts (count by stroke-width)

    // Decode each base53 encoded string to a decimal number
    // インデックスiを2で割った余りが1と等しい = 2で割り切れるない= 奇数 の場合に要素を取得し デコードする
    const counts = parts.filter((_, i) => i % 2 === 1).map(part => base53Dec(part))
    console.log('counts: ', counts) // Arr(7) [ 104, 168, 183, 92, 12, 5, 37 ]


    // Firstline indices

    const reducer = (acc, cur) => acc + cur
    const initialValueOne = 1 // firstline number

    let firstlineIndices = runningReduce(counts, reducer, initialValueOne)
    firstlineIndices.unshift(1) // Add first element with Number 1
    firstlineIndices.pop()      // Delete last element
    //console.log('firstlineIndices: ', firstlineIndices)
    // e.g.: Arr(4) [ 1, 4, 8, 25 ]


    // Lastline indices

    const initialValueZero = 0 // firstline number

    let lastlineIndices = runningReduce(counts, reducer, initialValueZero)
    //console.log('lastlineIndices: ', lastlineIndices)
    // e.g.: Arr(4) [ 3, 7, 24, 91 ]


    return {
        firstlineIndices,  // number[]
        lastlineIndices,   // number[]
        widths,            // number[]
        counts             // number[]
    }
}
