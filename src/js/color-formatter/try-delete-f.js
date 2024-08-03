export
    { tryDeleteFs
    , tryDeleteF
    }


// For "Group colors"
function tryDeleteFs(hex) { // Input 10 or 5 chars hex only

    hex = hex.toUpperCase()

    if (hex.length !== 10 && hex.length !== 5) {
        console.error('Invalid length hex for "Group colors":', hex)
    }
    // 10 => 6
    else if (hex.length === 10 && hex.slice(-4) === "FFFF") {
        return hex.slice(0, 6)
    }
    // 5 => 3
    else if (hex.length === 5 && hex.slice(-2) === "FF") {
        return hex.slice(0, 3)
    }
    else {
        return hex
    }
}
// Test
// console.log(tryDeleteFs("abcff"))       // ABC
// console.log(tryDeleteFs("ABCFF"))       // ABC
// console.log(tryDeleteFs("abcde"))       // ABCDE
// console.log(tryDeleteFs("12345"))       // 12345
// console.log(tryDeleteFs("123456ffff"))  // 123456
// console.log(tryDeleteFs("123456abff"))  // 123456ABFF
// console.log(tryDeleteFs("1234567abff")) // Invalid length hex for "Group colors": 1234567ABFF



// For "Base color"
function tryDeleteF(hex) { // Input 8 or 4 chars hex only

    hex = hex.toUpperCase()

    if (hex.length !== 8 && hex.length !== 4) {
        console.error('Invalid length hex for "Base color":', hex)
    }
    // 8 => 6
    else if (hex.length === 8 && hex.slice(-2) === "FF") {
        return hex.slice(0, 6)
    }
    // 4 => 3
    else if (hex.length === 4 && hex.slice(-1) === "F") {
        return hex.slice(0, 3)
    }
    else {
        return hex
    }
}
// Test
//console.log(tryDeleteF("abcf"))      // ABC
//console.log(tryDeleteF("ABCF"))      // ABC
//console.log(tryDeleteF("abcd"))      // ABCD
//console.log(tryDeleteF("FFFF"))      // FFF
//console.log(tryDeleteF("FFF9"))      // FFF9
//console.log(tryDeleteF("123456ff"))  // 123456
//console.log(tryDeleteF("112233ff"))  // 112233
//console.log(tryDeleteF("123456ab"))  // 123456AB
//console.log(tryDeleteF("1234567ff")) // Invalid length hex for "Base color": 1234567FF





