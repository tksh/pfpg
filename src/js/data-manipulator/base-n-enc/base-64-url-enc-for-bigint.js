// For BigInt

function base64UrlEncForBigInt(num) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    // https://datatracker.ietf.org/doc/html/rfc4648#section-5

    let base = BigInt(alphabet.length);
    let encoded = '';

    if (num === 0n) {
        return alphabet[0];
    }

    while (num) {
        let remainder = num % base;
        num = num / base;
        encoded = alphabet[Number(remainder)] + encoded;
    }

    return encoded;
}

//console.log('base64UrlEncode(0n): ', base64UrlEncodeForBigInt(0n)) // A
//console.log('base64UrlEncode(999n): ', base64UrlEncodeForBigInt(999n)) // Pn
//console.log('base64UrlEncode(4095n): ', base64UrlEncodeForBigInt(4095n)) // __  (2 chars)
//console.log('base64UrlEncode(4096n): ', base64UrlEncodeForBigInt(4096n)) // BAA (3 chars)
//console.log('base64UrlEncode(9999n): ', base64UrlEncodeForBigInt(9999n)) // CcP
