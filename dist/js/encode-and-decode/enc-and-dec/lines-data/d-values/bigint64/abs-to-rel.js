export function absToRel(absoluteDvals, widthsAndCounts) {const firstlineIndices = widthsAndCounts.firstlineIndices
const firstlineIndexArr = firstlineIndices.map(n => n - 1)
const temp = []
let prevX2 = 0, prevY2 = 0
const [x1Arr, y1Arr, x2Arr, y2Arr] = absoluteDvals
let x1, y1, x2, y2
for (let i = 0; i < x1Arr.length; i++) {x1 = x1Arr[i]
y1 = y1Arr[i]
x2 = x2Arr[i]
y2 = y2Arr[i]
if (firstlineIndexArr.includes(i)) {temp.push(x1, y1, x2 - x1, y2 - y1)} else {temp.push(x1 - prevX2, y1 - prevY2, x2 - x1, y2 - y1)}
prevX2 = x2
prevY2 = y2}
return [Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4]),Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 1]),Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 2]),Array.from({ length: temp.length / 4 }, (_, i) => temp[i * 4 + 3])]}