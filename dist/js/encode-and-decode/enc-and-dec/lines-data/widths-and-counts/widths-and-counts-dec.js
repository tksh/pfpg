import { base53Dec } from 'enc-and-dec/base-n/base-53-dec'
import { runningReduce } from 'libs/deno-std/running-reduce'
export function decodeWidthsAndCounts(encodedStr) {const parts = encodedStr.match(/\d+|[_a-zA-Z]+/g)
const widths = parts.filter((_, i) => i % 2 === 0).map((part => Number(part)))
const counts = parts.filter((_, i) => i % 2 === 1).map(part => base53Dec(part))
const reducer = (acc, cur) => acc + cur
const initialValueOne = 1
let firstlineIndices = runningReduce(counts, reducer, initialValueOne)
firstlineIndices.unshift(1)
firstlineIndices.pop()
const initialValueZero = 0
let lastlineIndices = runningReduce(counts, reducer, initialValueZero)
return {firstlineIndices,lastlineIndices,widths,counts}}