export
    { getBase53Characters
    , getBase64UrlCharacters
    }


// Generate an string for encoding
// Using for 3rd flag for bruteforce53-enc

function getBase53Characters() {
    // Define the start position of the alphabet character codes
    const lowerStart = 97; // Character code for 'a'
    const upperStart = 65; // Character code for 'A'

    // init with underscore
    let result = '_';

    // アルファベットの数だけ繰り返す

    // Lower case
    for (let i = 0; i < 26; i++) {
        let lowerCode = lowerStart + i;
        result += String.fromCharCode(lowerCode)
    }

    // Upper case
    for (let i = 0; i < 26; i++) {
        let upperCode = upperStart + i;
        result += String.fromCharCode(upperCode)
    }

    return result;
}
// console.log(getBase53Characters())
// _abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ




// https://datatracker.ietf.org/doc/html/rfc4648#section-5

function getBase64UrlCharacters() {
    // Define the start position of the alphabet character codes
    const upperStart = 65; // Character code for 'A'
    const lowerStart = 97; // Character code for 'a'

    // init
    let result = '';


    // Alphabets

    // Upper case
    for (let i = 0; i < 26; i++) {
        let upperCode = upperStart + i;
        result += String.fromCharCode(upperCode)
    }

    // Lower case
    for (let i = 0; i < 26; i++) {
        let lowerCode = lowerStart + i;
        result += String.fromCharCode(lowerCode)
    }


    // Numbers
    for (let i = 0; i < 10; i++) {
        result += i
    }


    // Signs
    result += '-_'


    return result;
}

//console.log(getBase64UrlCharacters())
// 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';