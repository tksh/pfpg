import { getAlphabets52 } from 'enc-and-dec/line-data/d-values/bruteforce53/specific-alphabets'


// For the number value of freq dict to embed for bruteforce53-enc

export function base52Enc(num) {
    const alphabet = getAlphabets52()
    // 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

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

// console.log('0: ',      base52Enc(0))      // a
// console.log('1: ',      base52Enc(1))      // b
// console.log('26: ',     base52Enc(26))     // A
// console.log('27: ',     base52Enc(27))     // B
// console.log('51: ',     base52Enc(51))     // Z
// console.log('52: ',     base52Enc(52))     // ba
// console.log('2703: ',   base52Enc(2703))   // ZZ
// console.log('2704: ',   base52Enc(2704))   // baa  (52*52=2704)
// console.log('140607: ', base52Enc(140607)) // ZZZ
// console.log('140608: ', base52Enc(140608)) // baaa (52*52*52=140608)
