// convert.js

function percentEncode(str)
{
  "use strict"
  const e=encodeURIComponent(str)
  return e.replace(/%20/g,'+')
} // percentEncode

function percentDecode(str)
{
  "use strict"
  try {
    str=str.replace(/\+/g,'%20')
    return decodeURIComponent(str)
  } catch(e) {
    return null
  } // try
}

function base64encode(str,convertToUtf8=true)
{
  if(typeof str!=='string') {
    return null
  } // if
  let utf8str
  if(convertToUtf8) {
    utf8str=URLCompressor.encodeUtf8(str) // UTF8に変換
    if(utf8str===null) {
      return null
    } // if
  } else {
    utf8str=str // 無変換
  } // if
  try {
    return btoa(utf8str)
  } catch(e) {
    return null
  } // try
} // base64encode

function base64decode(str,convertToUtf16=true)
{
  if(typeof str!=='string') {
    return null
  } // if
  let utf8str
  try {
    utf8str=atob(str)
  } catch(e) {
    return null
  } // try
  let decodedStr
  if(convertToUtf16) {
    decodedStr=URLCompressor.decodeUtf8(utf8str)
  } else {
    decodedStr=utf8str
  } // if
  return decodedStr
} // base64decode

function base64urlEncode(str,convertToUtf8=true)
{
  let utf8str
  if(convertToUtf8) {
    utf8str=URLCompressor.encodeUtf8(str) // UTF8に変換
    if(utf8str==null) {
      return null
    } // if
  } else {
    utf8str=str
  } // if
  let base64str
  try {
    base64str=btoa(utf8str)
  } catch(e) {
    return null
  } // try
  let base64urlStr=''
  for(let len=base64str.length,i=0; i<len; i++) {
    if(base64str[i]==='+') {
      base64urlStr+='-'
    } else if(base64str[i]==='/') {
      base64urlStr+='_'
    } else if(base64str[i]!=='=') {
      base64urlStr+=base64str[i]
    } // if
  } // for i
  return base64urlStr
} // base64urlEncode

function base64urlDecode(str,convertToUtf16=true)
{
  if(typeof str!=='string') {
    return null
  } // if
  let base64str=''
  for(let len=str.length,i=0; i<len; i++) {
    if(str[i]==='-') {
      base64str+='+'
    } else if (str[i]==='_') {
      base64str+='/'
    } else {
      base64str+=str[i]
    } // if
  } // for i
  const decodedStr=base64decode(base64str,convertToUtf16)
  return decodedStr
} // base64urlDecode

function convertOriginal()
{
  "use strict"

  const original  =document.getElementById('original'  )
  const percent   =document.getElementById('percent'   )
  const base64url =document.getElementById('base64url' )
  const compressed=document.getElementById('compressed')

  const percentStr   =percentEncode(original.value)
  const base64urlStr =base64urlEncode(original.value)
  const compressedStr=URLCompressor.compress(original.value,true)
  
  percent   .value=percentStr
  base64url .value=base64urlStr
  compressed.value=compressedStr

  percent   .oninput()
  base64url .oninput()
  compressed.oninput()
} // convertOriginal

function convertPercent()
{
  "use strict"

  const original  =document.getElementById('original'  )
  const percent   =document.getElementById('percent'   )
  const base64url =document.getElementById('base64url' )
  const compressed=document.getElementById('compressed')

  const decodedStr=percentDecode(percent.value)
  if(decodedStr===null) {
    alert("デコードできませんでした。")
    return
  } // if
  const base64urlStr =base64urlEncode(decodedStr)
  const compressedStr=URLCompressor.compress(decodedStr,true)

  original  .value=decodedStr
  base64url .value=base64urlStr
  compressed.value=compressedStr

  original  .oninput()
  base64url .oninput()
  compressed.oninput()
} // convertPercent

function convertBase64url()
{
  "use strict"

  const original  =document.getElementById('original'  )
  const percent   =document.getElementById('percent'   )
  const base64url =document.getElementById('base64url' )
  const compressed=document.getElementById('compressed')

  const decodedStr=base64urlDecode(base64url.value)
  if(decodedStr===null) {
    alert("デコードできませんでした。")
    return
  } // if
  const percentStr   =percentEncode(decodedStr)
  const compressedStr=URLCompressor.compress(decodedStr,true)

  original  .value=decodedStr
  percent   .value=percentStr
  compressed.value=compressedStr

  original  .oninput()
  percent   .oninput()
  compressed.oninput()
} // convertBase64url

function convertCompressed()
{
  "use strict"

  const original  =document.getElementById('original'  )
  const percent   =document.getElementById('percent'   )
  const base64url =document.getElementById('base64url' )
  const compressed=document.getElementById('compressed')

  const expandedStr=URLCompressor.expand(compressed.value,true)
  if(expandedStr===null) {
    alert("デコードできませんでした。")
    return
  } // if
  const percentStr  =percentEncode(expandedStr)
  const base64urlStr=base64urlEncode(expandedStr)

  original .value=expandedStr
  percent  .value=percentStr
  base64url.value=base64urlStr

  original .oninput()
  percent  .oninput()
  base64url.oninput()
} // convertCompressed

function showCount(id1,id2)
{
  "use strict"
  const e1=document.getElementById(id1)
  const e2=document.getElementById(id2)
  const str=e1.value
  e2.innerHTML=''
  e2.appendChild(document.createTextNode(URLCompressor.encodeUtf8(str).length.toString()+'バイト'))
} // showCount

function clearText(id1,id2)
{
  const e1=document.getElementById(id1)
  e1.value=''
  showCount(id1,id2)
} // clearText

window.onload=() =>
{
  "use stricrt"
  showCount('original'  ,'originalCnt'  )
  showCount('percent'   ,'percentCnt'   )
  showCount('base64url' ,'base64urlCnt' )
  showCount('compressed','compressedCnt')
} // window.onload
