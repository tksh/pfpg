// For bigint64-enc

function base64UrlEnc(num) {
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

//console.log('base64UrlEnc(0n): ',    base64UrlEncodeForBigInt64(0n))    // A
//console.log('base64UrlEnc(999n): ',  base64UrlEncodeForBigInt64(999n))  // Pn
//console.log('base64UrlEnc(4095n): ', base64UrlEncodeForBigInt64(4095n)) // __  (2 chars)
//console.log('base64UrlEnc(4096n): ', base64UrlEncodeForBigInt64(4096n)) // BAA (3 chars)
//console.log('base64UrlEnc(9999n): ', base64UrlEncodeForBigInt64(9999n)) // CcP
