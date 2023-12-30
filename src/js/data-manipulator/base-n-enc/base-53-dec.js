// For:
//     3rd flag for bruteforce53-enc
//     Width count value

function base53Decode(str) {
    const alphabet = getCharList53()
    // '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length;
    let decoded = 0;

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i]);
        decoded += index * Math.pow(base, str.length - i - 1);
    }

    return decoded;
}

// console.log(base53Decode('_')) // 0
// console.log(base53Decode('a')) // 1
// console.log(base53Decode('b')) // 2
// console.log(base53Decode('h')) // 8
// console.log(base53Decode('X')) // 50
// console.log(base53Decode('Y')) // 51
// console.log(base53Decode('Z')) // 52
