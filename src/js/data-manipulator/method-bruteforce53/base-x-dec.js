// BaseX decode for both `a` padded or not

function baseXDec(str, baseX) {
    const alphabets52 = getAlphabets52()
    const alphabet = alphabets52.substring(0, baseX)
    let base = alphabet.length;
    let decoded = 0;

    console.log('baseX: ', baseX)
    console.log('str: ', str)
    console.log('alphabet: ', alphabet)

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i]);
        decoded += index * Math.pow(base, str.length - i - 1);
    }

    // Minus 256 to recover the minus numbers
    let num256reduced = subtractNumAfterDecode(decoded, baseX)
    //console.log('str, decoded and num256reduced: ', str, decoded, num256reduced)

    return num256reduced;
    //return decoded;
}

//console.log(baseXDec('Aa', 23)) // -255
//console.log(baseXDec('AB', 23)) // -254
//console.log(baseXDec('fB', 23)) // -1
//console.log(baseXDec('fb', 23)) // 0
//console.log(baseXDec('fC', 23)) // 1
//console.log(baseXDec('LC', 23)) // 254
//console.log(baseXDec('Lc', 23)) // 255
//console.log(baseXDec('Lk', 23)) // 271
//console.log(baseXDec('LL', 23)) // 272
