import { getBase53Characters } from 'enc-and-dec/base-n/get-chars'


// For:
//     3rd flag for bruteforce53-enc
//     Width counts value

export function base53Dec(str) {
    const alphabet = getBase53Characters()
    // '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length
    let decoded = 0

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i])
        decoded += index * Math.pow(base, str.length - i - 1)
    }

    return decoded
}

// console.log(base53Dec('_')) // 0
// console.log(base53Dec('a')) // 1
// console.log(base53Dec('b')) // 2
// console.log(base53Dec('h')) // 8
// console.log(base53Dec('X')) // 50
// console.log(base53Dec('Y')) // 51
// console.log(base53Dec('Z')) // 52
