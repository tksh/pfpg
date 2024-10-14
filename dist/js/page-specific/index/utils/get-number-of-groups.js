export function getNumberOfGroups(inputSvg) {const pattern = /g stroke="[^"]*"/g
const matches = inputSvg.match(pattern)
const numberOfGroups = matches.length
return numberOfGroups}