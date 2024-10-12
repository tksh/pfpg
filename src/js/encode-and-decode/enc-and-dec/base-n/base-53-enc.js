import { getBase53Characters } from 'enc-and-dec/base-n/get-chars'


// For:
//     3rd flag for bruteforce53-enc
//     Width counts value

export function base53Enc(num) {
    const alphabet = getBase53Characters()
    // '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length
    let encoded = ''

    if (num === 0) {
        return alphabet[0]
    }

    while (num) {
        let remainder = num % base
        num = Math.floor(num / base)
        encoded = alphabet[remainder] + encoded
    }

    return encoded
}

// console.log('0: ',   base53Enc(0)) // _
// console.log('1: ',   base53Enc(1)) // a
// console.log('2: ',   base53Enc(2)) // b
// console.log('8: ',   base53Enc(8)) // h
// console.log('50: ', base53Enc(50)) // X
// console.log('51: ', base53Enc(51)) // Y
// console.log('52: ', base53Enc(52)) // Z
