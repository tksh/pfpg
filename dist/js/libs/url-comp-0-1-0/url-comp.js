function getScalarArray(str) {if (typeof str !== "string") {return null}
const scalarArray = []
for (let len = str.length, i = 0; i < len; i++) {const c = str.charCodeAt(i)
if (c >= 0xd800 && c <= 0xdbff) {if (i + 1 >= len) {return null}
scalarArray.push((c & 0x3ff) + 0x40 << 10 | str.charCodeAt(++i) & 0x3ff)} else {scalarArray.push(c)}}
return scalarArray}
const encodeUtf8 = (str) => {const scalarArray = getScalarArray(str)
if (scalarArray === null) {return null}
let utf8str = ''
for (let len = scalarArray.length, i = 0; i < len; i++) {const c = scalarArray[i]
if (c <= 0x7f) {utf8str += String.fromCharCode(c)} else if (c <= 0x7ff) {utf8str += String.fromCharCode(0xc0 | (c >>> 6), 0x80 | c & 0xbf)} else if (c <= 0xffff) {utf8str += String.fromCharCode(0xe0 | (c >>> 12), 0x80 | (c >>> 6) & 0xbf, 0x80 | c & 0xbf)} else if (c <= 0x10ffff) {utf8str += String.fromCharCode(0xf0 | (c >>> 18), 0x80 | (c >>> 12) & 0xbf, 0x80 | (c >>> 6) & 0xbf, 0x80 | c & 0xbf)} else {return null}}
return utf8str}
const decodeUtf8 = (str) => {if (typeof str !== "string") {return null}
let utf16str = ''
for (let i = 0, len = str.length; i < len; i++) {const c0 = str.charCodeAt(i)
if (c0 <= 0x7f) {utf16str += String.fromCharCode(c0)} else if (c0 >= 0xc2 && c0 <= 0xdf) {if (i + 1 >= len) {return null}
const c1 = str.charCodeAt(++i)
utf16str += String.fromCharCode((c0 & 0x1f) << 6 | (c1 & 0x3f))} else if (c0 >= 0xe0 && c0 <= 0xef) {if (i + 2 >= len) {return null}
const c1 = str.charCodeAt(++i)
const c2 = str.charCodeAt(++i)
utf16str += String.fromCharCode((c0 & 0xf) << 12 | (c1 & 0x3f) << 6 | (c2 & 0x3f))} else if (c0 >= 0xf0 && c0 <= 0xf4) {if (i + 3 >= len) {return null}
const c1 = str.charCodeAt(++i)
const c2 = str.charCodeAt(++i)
const c3 = str.charCodeAt(++i)
utf16str += String.fromCharCode(0xd800 | (((c0 & 0x7) << 8 | (c1 & 0x3f) << 2 | c2 >>> 4 & 0x3) - 0x40),0xdc00 | (c2 & 0xf) << 6 | c3 & 0x3f)} else {return null}}
return utf16str}
const symbolNum = [258, 258, 130, 99]
const DIC = [256, 256, 128, 97]
const EOF = [257, 257, 129, 98]
const dictionarySize = 2048
const totalOffset = 0.25
const matchLimit = 1000
const mode3EncodeTable = (() => {const result = []
let cnt = 0
for (let i = 0; i < 0x80; i++) {if (i < 0x20 && i !== 0x09 && i !== 0x0a || i === 0x7f) {result.push(null)} else {result.push(cnt++)}}
return result})()
const mode3DecodeTable = (() => {const result = []
for (let i = 0; i < mode3EncodeTable.length; i++) {if (mode3EncodeTable[i] !== null) {result.push(i)}}
return result})()
const base64UrlTable = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
const base64UrlReverseTable = (() => {const result = new Map()
for (let len = base64UrlTable.length, i = 0; i < len; i++) {result.set(base64UrlTable[i], i)}
return result})()
function getRequiredBits(n) {let m = 1
let bits = 0
while (n >= m) {m <<= 1
bits++}
return bits}
function getHuffmanTree(array, symbolNum) {const symbolSortTable = []
for (let i = 0; i < symbolNum; i++) {symbolSortTable.push(null)
let j = i
while (j > 0 && symbolSortTable[j - 1].count < array[i]) {symbolSortTable[j] = symbolSortTable[j - 1]
j--}
symbolSortTable[j] = { count: array[i], symbol: i, left: null, right: null }}
while (symbolSortTable.length > 1) {const newObj = {count: symbolSortTable[symbolSortTable.length - 2].count + symbolSortTable[symbolSortTable.length - 1].count,symbol: -1,left: symbolSortTable[symbolSortTable.length - 2],right: symbolSortTable[symbolSortTable.length - 1]}
symbolSortTable.pop()
let i = symbolSortTable.length - 1
while (i > 0 && symbolSortTable[i - 1].count < newObj.count) {symbolSortTable[i] = symbolSortTable[i - 1]
i--}
symbolSortTable[i] = newObj}
return symbolSortTable[0]}
function getCodeTable(tree, symbolNum) {const codeTable = []
for (let i = 0; i < symbolNum; i++) {codeTable.push(null)}
const codeBuf = { buf: new Uint8Array((symbolNum + 7) >>> 3), bitNum: 0 }
const seekCode = (treeNode) => {if (treeNode.symbol >= 0) {const bitNum = codeBuf.bitNum
const byteNum = (bitNum + 7) >>> 3
const code = new Uint8Array(byteNum)
for (let i = 0; i < byteNum; i++) {code[i] = codeBuf.buf[i]}
codeTable[treeNode.symbol] = { code: code, bitNum: bitNum }} else {const bitNum = codeBuf.bitNum
codeBuf.buf[bitNum >>> 3] &= ~(1 << (7 - bitNum % 8))
codeBuf.bitNum++
seekCode(treeNode.left)
codeBuf.buf[bitNum >>> 3] |= 1 << (7 - bitNum % 8)
seekCode(treeNode.right)
codeBuf.bitNum--}}
seekCode(tree)
return codeTable}
function compress(str, encode64 = true) {let resultStr = ''
let byteBuf = 0
let bitNum = 0
const codeBits = encode64 ? 6 : 8
const getMode = (str) => {const count = []
for (let i = 0; i < 256; i++) {count.push(0)}
for (let len = str.length, i = 0; i < len; i++) {if (str.charCodeAt(i) >= 256) {return 0}
count[str.charCodeAt(i)]++}
for (let i = 128; i < 256; i++) {if (count[i] > 0) {return 1}}
for (let len = mode3EncodeTable.length, i = 0; i <= len; i++) {if (mode3EncodeTable[i] === null && count[i] > 0) {return 2}}
return 3}
const encodeInt = (intNum) => {const buf = [3]
let i = intNum
while (i !== 0) {i--
buf.push(i % 3)
i = Math.floor(i / 3)}
const codeBuf = new Uint8Array((buf.length * 2 + 6) >>> 3)
let bitCnt = 0
let byte = 0
for (let i = buf.length - 1; i >= 0; i--) {byte = (byte << 2) + buf[i]
bitCnt += 2
if (bitCnt % 8 == 0) {codeBuf[(bitCnt >>> 3) - 1] = byte
byte = 0}}
if (bitCnt % 8 !== 0) {const rem = 8 - bitCnt % 8
codeBuf[bitCnt >>> 3] = byte << rem}
return { codeBuf: codeBuf, bitCnt: bitCnt }}
const outputData = (codeBuf, bitCnt) => {let bitPos = 0
let bytePos = 0
let remBits = bitCnt
while (remBits > 0) {byteBuf = (byteBuf << 1) + (codeBuf[bytePos] >> (7 - bitPos) & 1)
if (++bitNum === codeBits) {resultStr += encode64 ? base64UrlTable[byteBuf] : String.fromCharCode(byteBuf)
byteBuf = 0
bitNum = 0}
if (++bitPos == 8) {bitPos = 0
bytePos++}
remBits--}}
const outputMode = (mode) => {const tempArray = new Uint8Array(1)
tempArray[0] = mode << 6
outputData(tempArray, 2)}
if (typeof str !== "string") {return null}
const mode = getMode(str)
const _symbolNum = symbolNum[mode]
const _DIC = DIC[mode]
const _EOF = EOF[mode]
let strToCompress
if (mode === 0) {strToCompress = encodeUtf8(str)
if (strToCompress === null) {return null}} else if (mode === 3) {const encodeTable = mode3EncodeTable
strToCompress = ''
for (let len = str.length, i = 0; i < len; i++) {strToCompress += String.fromCharCode(encodeTable[str.charCodeAt(i)])}} else {strToCompress = str}
let symbolTotalTable = []
for (let i = 0; i < _symbolNum; i++) {symbolTotalTable.push(totalOffset)}
outputMode(mode)
const lastIndex = []
for (let i = 0; i < 256; i++) {lastIndex.push(null)}
const prevIndex = []
let tree
let codeTable
let i = 0
let symbolCnt = 0
let len = strToCompress.length
while (true) {if (symbolCnt < 256 || symbolCnt % 8 === 0) {tree = getHuffmanTree(symbolTotalTable, _symbolNum)
codeTable = getCodeTable(tree, _symbolNum)}
if (i >= len) {break}
let code = strToCompress.charCodeAt(i)
let maxMatch = 0
let matchIndex = 0
if (i > 0) {let index = lastIndex[code]
while (index !== null && i - index <= dictionarySize) {let match = 1
while (i + match - 1 < strToCompress.length && strToCompress[i + match] === strToCompress[index + match]) {match++
if (match >= matchLimit) {break}}
if (match > maxMatch) {maxMatch = match
matchIndex = index
if (maxMatch >= matchLimit) {break}}
index = prevIndex[index]}}
if (maxMatch >= 3) {code = _DIC}
outputData(codeTable[code].code, codeTable[code].bitNum)
let step = 1
if (code === _DIC) {const encResult = encodeInt(maxMatch - 3)
outputData(encResult.codeBuf, encResult.bitCnt)
const offset = i - matchIndex - 1
const bits = getRequiredBits(Math.min(i - 1, dictionarySize - 1))
const offsetArray = new Uint8Array(2)
if (bits <= 8) {offsetArray[0] = offset << (8 - bits)} else {offsetArray[0] = offset >> (bits - 8)
offsetArray[1] = (offset << (16 - bits)) & 0xff}
outputData(offsetArray, bits)
step = maxMatch}
for (let j = 0; j < step; j++) {prevIndex.push(lastIndex[strToCompress.charCodeAt(i)])
lastIndex[strToCompress.charCodeAt(i)] = i
i++}
symbolCnt++
symbolTotalTable[code]++}
if (bitNum > 0) {byteBuf = (byteBuf << (codeBits - bitNum)) + (codeTable[_EOF].code[0] >> (bitNum + 8 - codeBits))
resultStr += encode64 ? base64UrlTable[byteBuf] : String.fromCharCode(byteBuf)}
return resultStr}
function expand(str, decode64 = true) {let bytePos
let bitPos
let code
const codeBuf = new Uint8Array(str.length)
const codeBits = decode64 ? 6 : 8
const readBit = () => {const bit = (code >> (codeBits - bitPos - 1)) & 1
if (++bitPos === codeBits) {bitPos = 0
bytePos++
if (bytePos < len) {code = codeBuf[bytePos]}}
return bit}
const decodeInt = () => {let w = 0
let decodedNum = 0
do {if (bytePos >= codeBuf.length) {return -1}
w = readBit()
if (bytePos >= codeBuf.length) {return -1}
w = (w << 1) + readBit()
if (w < 3) {decodedNum = decodedNum * 3 + w + 1}} while (w < 3)
return decodedNum}
const getMode = () => {let mode = readBit()
mode = (mode << 1) + readBit()
return mode}
if (typeof str !== "string" || str.length === 0) {return null}
for (let len = str.length, i = 0; i < len; i++) {let code
if (decode64) {code = base64UrlReverseTable.get(str[i])
if (code === undefined) {return null}} else {code = str.charCodeAt(i)
if (code >= 0x100) {return null}}
codeBuf[i] = code}
bytePos = 0
bitPos = 0
code = codeBuf[0]
const mode = getMode()
const _symbolNum = symbolNum[mode]
const _DIC = DIC[mode]
const _EOF = EOF[mode]
let symbolTotalTable = []
for (let i = 0; i < _symbolNum; i++) {symbolTotalTable.push(totalOffset)}
let expandedStr = ''
let tree = getHuffmanTree(symbolTotalTable, _symbolNum)
let node = tree
let symbolCnt = 0
const len = codeBuf.length
let index = 0
while (bytePos < len) {node = readBit() ? node.right : node.left
if (node.symbol >= 0) {if (node.symbol === _EOF) {break} else if (node.symbol === _DIC) {const decoded = decodeInt()
if (decoded < 0) {return null}
const matchLen = decoded + 3
if (matchLen > matchLimit) {return null}
let offset = 0
const bits = getRequiredBits(Math.min(index - 1, dictionarySize - 1))
for (let i = 0; i < bits; i++) {if (bytePos >= len) {return null}
offset = (offset << 1) + readBit()}
if (offset >= index) {return null}
for (let i = 0; i < matchLen; i++) {expandedStr += expandedStr[index - offset - 1 + i]}
index += matchLen} else {expandedStr += String.fromCharCode(node.symbol)
index++}
symbolTotalTable[node.symbol]++
symbolCnt++
if (symbolCnt < 256 || symbolCnt % 8 === 0) {tree = getHuffmanTree(symbolTotalTable, _symbolNum)}
node = tree}}
if (mode === 0) {expandedStr = decodeUtf8(expandedStr)
if (expandedStr === null) {return null}} else if (mode === 3) {str = ''
for (let len = expandedStr.length, i = 0; i < len; i++) {str += String.fromCharCode(mode3DecodeTable[expandedStr.charCodeAt(i)])}
expandedStr = str}
return expandedStr}
export const URLCompressor = {compress,expand,encodeUtf8,decodeUtf8};