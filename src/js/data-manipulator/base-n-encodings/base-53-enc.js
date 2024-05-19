// For:
//     3rd flag for bruteforce53-enc
//     Width counts value

function base53Encode(num) {
    const alphabet = getBase53Characters()
    // '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

    let base = alphabet.length;
    let encoded = '';

    if (num === 0) {
        return alphabet[0];
    }

    while (num) {
        let remainder = num % base;
        num = Math.floor(num / base);
        encoded = alphabet[remainder] + encoded;
    }

    return encoded;
}

// console.log('0: ',   base53Encode(0)) // _
// console.log('1: ',   base53Encode(1)) // a
// console.log('2: ',   base53Encode(2)) // b
// console.log('8: ',   base53Encode(8)) // h
// console.log('50: ', base53Encode(50)) // X
// console.log('51: ', base53Encode(51)) // Y
// console.log('52: ', base53Encode(52)) // Z
