export
    { getBase53Characters
    , getBase64UrlCharacters
    }


// Generate an string for encoding
// Using for 3rd flag for bruteforce53-enc

function getBase53Characters() {
    // Define the start position of the alphabet character codes
    const lowerStart = 97 // Character code for 'a'
    const upperStart = 65 // Character code for 'A'

    // init with underscore
    let result = '_'

    // アルファベットの数だけ繰り返す

    // Lower case
    for (let i = 0; i < 26; i++) {
        let lowerCode = lowerStart + i
        result += String.fromCharCode(lowerCode)
    }

    // Upper case
    for (let i = 0; i < 26; i++) {
        let upperCode = upperStart + i
        result += String.fromCharCode(upperCode)
    }

    return result
}
// console.log(getBase53Characters())
// _abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ




// https://datatracker.ietf.org/doc/html/rfc4648#section-5

function getBase64UrlCharacters() {
    // Define the start position of the alphabet character codes
    const upperStart = 65 // Character code for 'A'
    const lowerStart = 97 // Character code for 'a'

    // init
    let result = ''


    // Alphabets

    // Upper case
    for (let i = 0; i < 26; i++) {
        let upperCode = upperStart + i
        result += String.fromCharCode(upperCode)
    }

    // Lower case
    for (let i = 0; i < 26; i++) {
        let lowerCode = lowerStart + i
        result += String.fromCharCode(lowerCode)
    }


    // Numbers
    for (let i = 0; i < 10; i++) {
        result += i
    }


    // Signs
    result += '-_'


    return result
}

//console.log(getBase64UrlCharacters())
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'


// four16

/** Four sets of 16 chars
 * P1 - 16 chars of [a-p]                       : Positive value represents with 1 digit [0-15]          (16)
 * N1 - 16 chars of [A-P]                       : Negative value represents with 1 digit [(-1)-(-15)]    (15)
 * P2 - 16 chars of [q-z(10), 0-5(6)]           : Positive value represents with 2 digit [16-255]       (240)
 * N2 - 16 chars of [Q-Z(10), 6-9(4), '-', '_'] : Negative value represents with 2 digit [(-16)-(-255)] (240)
 */

function get16CharsOfP1() {
    // Init
    let result = ''

    // Define the start position of the alphabet character codes
    const lowerStart = 97 // Character code for 'a'

    // Lower case
    for (let i = 0; i < 16; i++) {
        let lowerCode = lowerStart + i
        result += String.fromCharCode(lowerCode)
    }

    return result
}
//console.log(get16CharsOfP1())  // abcdefghijklmnop

function get16CharsOfN1() {
    // Init
    let result = ''

    // Define the start position of the alphabet character codes
    const upperStart = 65 // Character code for 'a'

    // Lower case
    for (let i = 0; i < 16; i++) {
        let lowerCode = upperStart + i
        result += String.fromCharCode(lowerCode)
    }

    return result
}
//console.log(get16CharsOfN1())  // ABCDEFGHIJKLMNOP


function get16CharsOfP2() {
    // Init
    let result = ''

    // Define the start position of the alphabet character codes
    const lowerStart = 113 // 97+16=113, Character code for 'q'

    // Lower case
    for (let i = 0; i < 10; i++) {
        let lowerCode = lowerStart + i
        result += String.fromCharCode(lowerCode)
    }

    // Numbers [0-5]
    for (let i = 0; i < 6; i++) {
        result += i
    }

    return result
}
//console.log(get16CharsOfP2())  // qrstuvwxyz012345

function get16CharsOfN2() {
    // Init
    let result = ''

    // Define the start position of the alphabet character codes
    const upperStart = 81 // 65+16=81, Character code for 'Q'

    // Upper case
    for (let i = 0; i < 10; i++) {
        let upperCode = upperStart + i
        result += String.fromCharCode(upperCode)
    }

    // Numbers [6-9]
    for (let i = 6; i < 10; i++) {
        result += i
    }

    // Signs
    result += '-_'

    return result
}
//console.log(get16CharsOfN2())  // QRSTUVWXYZ6789-_