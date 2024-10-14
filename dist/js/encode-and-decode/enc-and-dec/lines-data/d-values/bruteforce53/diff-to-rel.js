export function diffToRel(diffArray) {let originalArray = []
diffArray.forEach((diff, index) => {if (index === 0) {let original = parseInt(diff, 10)
originalArray.push(original)} else {let original = originalArray[index - 1] + parseInt(diff, 10)
originalArray.push(original)}})
return originalArray}