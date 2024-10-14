export function joinWithAmpersand(encodedStrByGroupsMap) {const wholeGroupString = [...encodedStrByGroupsMap.values()]
const wholeGroupJoined = wholeGroupString.join('&')
return wholeGroupJoined}