export function replaceAtIndex(inputString, regexPattern, replacement, index) {const matches = Array.from(inputString.matchAll(regexPattern))
const matchToReplace = matches[index]
const replacedString =
inputString.slice(0, matchToReplace.index) +
replacement +
inputString.slice(matchToReplace.index + matchToReplace[0].length)
return replacedString}