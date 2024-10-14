import { zip } from 'libs/deno-std/zip'
export function relToAbs(relativeDvals, widthsAndCounts) {const x1Arr = relativeDvals[0]
const y1Arr = relativeDvals[1]
const x2Arr = relativeDvals[2]
const y2Arr = relativeDvals[3]
const firstlineIndices = widthsAndCounts.firstlineIndices
const firstlineIndexArr = firstlineIndices.map(n => n - 1)
let absoluteCoordinates = []
for (let i = 0; i < x1Arr.length; i++) {if (firstlineIndexArr.includes(i)) {const x1 = x1Arr[i]
const y1 = y1Arr[i]
const x2 = x1Arr[i] + x2Arr[i]
const y2 = y1Arr[i] + y2Arr[i]
absoluteCoordinates.push([x1, y1, x2, y2])} else {const x1 = x1Arr[i] + absoluteCoordinates[i - 1][2]
const y1 = y1Arr[i] + absoluteCoordinates[i - 1][3]
const x2 = x2Arr[i] + x1
const y2 = y2Arr[i] + y1
absoluteCoordinates.push([x1, y1, x2, y2])}}
const absoluteDvals = zip(...absoluteCoordinates)
return absoluteDvals}