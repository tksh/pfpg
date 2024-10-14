export
{ hexShortenFromTen, hexShortenAsHalf, tryDeleteHash}
function hexShortenFromTen(hex) {if (hex.length !== 10) {return "Invalid hex code"}
let canShorten = true
let result = ""
for (let i = 0; i < hex.length; i += 2) {if (hex[i] === hex[i + 1]) {result += hex[i]} else {canShorten = false
break}}
if (canShorten) {if (result[3].toLowerCase() === "f"
&& result[4].toLowerCase() === "f") {result = result.slice(0, -2)
if (result[0] === result[1] && result[1] === result[2]) {result = result[0]}}
return result}
if (!canShorten) {if (hex[6].toLowerCase() === "f"
&& hex[7].toLowerCase() === "f"
&& hex[8].toLowerCase() === "f"
&& hex[9].toLowerCase() === "f") {result = hex.slice(0, -4)
return result} else {return hex}}}
function hexShortenAsHalf(hex) {let result = ""
for (let i = 0; i < hex.length - 1; i += 2) {if (hex[i] === hex[i + 1]) {result += hex[i]} else {return hex}}
return result}
function tryDeleteHash(hexStr) {if (hexStr.startsWith("#")) {return hexStr.slice(1)} else {return hexStr}}