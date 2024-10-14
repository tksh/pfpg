import { resultInfo } from 'constants'
export function storeShorter(currentShortestByGroups, encodedStrByGroups, baseXNumber) {for (let [gId, encodedStr] of encodedStrByGroups) {if (encodedStr[0].length < currentShortestByGroups.get(gId)[0].length) {currentShortestByGroups.set(gId, [encodedStr[0], 'bruteforce53', { baseXNumber }])
const firstFlag = encodedStr[0].split('=')[1][0]
const secondFlag = '0'
resultInfo.set(`bruteforce53FlagsOfGroupId=${gId}`, ([firstFlag, secondFlag]))}}
return currentShortestByGroups}
function pad(inputNumber, numberOfPadding) {return inputNumber.toString().padStart(numberOfPadding, ' ')}