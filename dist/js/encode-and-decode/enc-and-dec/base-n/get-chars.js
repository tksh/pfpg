export
{ getBase53Characters, getBase64UrlCharacters, getFour16CharsSets}
function getBase53Characters() {const lowerStart = 97
const upperStart = 65
let result = '_'
for (let i = 0; i < 26; i++) {let lowerCode = lowerStart + i
result += String.fromCharCode(lowerCode)}
for (let i = 0; i < 26; i++) {let upperCode = upperStart + i
result += String.fromCharCode(upperCode)}
return result}
function getBase64UrlCharacters() {const upperStart = 65
const lowerStart = 97
let result = ''
for (let i = 0; i < 26; i++) {let upperCode = upperStart + i
result += String.fromCharCode(upperCode)}
for (let i = 0; i < 26; i++) {let lowerCode = lowerStart + i
result += String.fromCharCode(lowerCode)}
for (let i = 0; i < 10; i++) {result += i}
result += '-_'
return result}
function getFour16CharsSets() {const p1 = get16CharsOfP1()
const n1 = get16CharsOfN1()
const p2 = get16CharsOfP2()
const n2 = get16CharsOfN2()
return { p1, n1, p2, n2 }}
function get16CharsOfP1() {let result = ''
const lowerStart = 97
for (let i = 0; i < 16; i++) {let lowerCode = lowerStart + i
result += String.fromCharCode(lowerCode)}
return result}
function get16CharsOfN1() {let result = ''
const upperStart = 65
for (let i = 0; i < 16; i++) {let lowerCode = upperStart + i
result += String.fromCharCode(lowerCode)}
return result}
function get16CharsOfP2() {let result = ''
const lowerStart = 113
for (let i = 0; i < 10; i++) {let lowerCode = lowerStart + i
result += String.fromCharCode(lowerCode)}
for (let i = 0; i < 6; i++) {result += i}
return result}
function get16CharsOfN2() {let result = ''
const upperStart = 81
for (let i = 0; i < 10; i++) {let upperCode = upperStart + i
result += String.fromCharCode(upperCode)}
for (let i = 6; i < 10; i++) {result += i}
result += '-_'
return result}