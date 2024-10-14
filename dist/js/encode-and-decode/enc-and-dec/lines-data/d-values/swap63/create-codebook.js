export
{ createCodebook, get63Numbers, get63Characters}
function createCodebook(keys, values) {const dictMap = new Map()
for (let i = 0; i < keys.length; i++) {dictMap.set(keys[i], values[i])}
return dictMap}
function get63Numbers() {let minus31To31 = []
for (let i = -31; i < 32; i++) {minus31To31.push(i)}
return minus31To31}
function get63Characters() {let zeroToNine = []
for (let i = 0; i < 10; i++) {zeroToNine.push(i.toString())}
let alphabetLowerCase = []
for (let i = 97; i <= 122; i++) {alphabetLowerCase.push(String.fromCharCode(i))}
let alphabetUpperCase = []
for (let i = 65; i <= 90; i++) {alphabetUpperCase.push(String.fromCharCode(i))}
const underscore = ['_']
const wholeValues = zeroToNine.concat(alphabetLowerCase, alphabetUpperCase, underscore)
return wholeValues}