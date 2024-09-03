import { getBase64UrlCharacters } from 'enc-and-dec/base-n/get-chars'


// For bigint64-enc

export function base64UrlEnc(num) {
    const alphabet = getBase64UrlCharacters()
    // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

    let base = BigInt(alphabet.length)
    let encoded = ''

    if (num === 0n) {
        return alphabet[0]
    }

    while (num) {
        let remainder = num % base
        num = num / base
        encoded = alphabet[Number(remainder)] + encoded
    }

    return encoded
}

//console.log(   base64UrlEnc(0n)) // A
//console.log( base64UrlEnc(999n)) // Pn
//console.log(base64UrlEnc(4095n)) // __  (2 chars)
//console.log(base64UrlEnc(4096n)) // BAA (3 chars)
//console.log(base64UrlEnc(9999n)) // CcP

// Parse the String into Number and BigInt
// console.log(Number('01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710'))
//     1.0407060807192525e+150
// console.log(BigInt('01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710'))
//     10407060807192524283017042226222223230000001520050…232224312626252321230005242225273122091720232710n

// Encode after parsing as BigInt
// console.log(base64UrlEnc(BigInt('01040706080719252428301704222622222323000000152005000015000028240011161922080104061008112426242830200824232224312626252321230005242225273122091720232710')))
// BRY8zuZS6-yuj6xgi-u9utYvXoK0QEXoKySIqr46g3-9HxEs1eG2VMHxerRFrXM3mjZxLkf-wwSvNRnQb88G