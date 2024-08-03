import { getBase64UrlCharacters } from 'enc-and-dec/base-n/get-chars'


// For bigint64-enc

export function base64UrlDec(str) {
    const alphabet = getBase64UrlCharacters()

    let base = BigInt(alphabet.length);
    let num = 0n;

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i]);
        if (index === -1) {
            throw new Error('Invalid character');
        }
        num = num * base + BigInt(index);
    }

    return num;
}

// console.log(base64UrlDec('A'))   // 0n
// console.log(base64UrlDec('Pn'))  // 999n
// console.log(base64UrlDec('__'))  // 4095n
// console.log(base64UrlDec('BAA')) // 4096n
// console.log(base64UrlDec('CcP')) // 9999n
// console.log(base64UrlDec('H5yJn8tIS6hWuVfFgdJIY10GsuwXo0w'))

// console.log(base64UrlDec('BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G'))
// 10407060807192524283017042226222223230000001520050…232224312626252321230005242225273122091720232710n