export
{ getAlphabets52, getAlphabetsForCodebook, getAlphabetsForBaseX}
function getAlphabets52() {const lowerStart = 97
const upperStart = 65
let result = ''
for (let i = 0; i < 26; i++) {let lowerCode = lowerStart + i
result += String.fromCharCode(lowerCode)}
for (let i = 0; i < 26; i++) {let upperCode = upperStart + i
result += String.fromCharCode(upperCode)}
return result}
function getAlphabetsForCodebook(codebookSize) {const alphabets52 = getAlphabets52()
if (codebookSize == 0) {return ""} else {const alphabetsActualCodebookSized = alphabets52.slice(-codebookSize)
return alphabetsActualCodebookSized}}
function getAlphabetsForBaseX(baseX) {const alphabets52 = getAlphabets52()
if (baseX == 0) {return ""} else {const alphabetForBaseX = alphabets52.substring(0, baseX)
return alphabetForBaseX}}