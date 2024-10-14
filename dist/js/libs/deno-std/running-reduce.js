export function runningReduce(array, reducer, initialValue) {let currentResult = initialValue
return array.map((el, currentIndex) =>
currentResult = reducer(currentResult, el, currentIndex))}