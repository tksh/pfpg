import { subtractNumAfterDecode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { getAlphabets52 }         from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'


// BaseX decode for both 'a' padded or not

export function baseXDec(str, baseX) {
    const alphabets52 = getAlphabets52()
    const alphabet = alphabets52.substring(0, baseX)
    let base = alphabet.length
    let decoded = 0

    console.log('||||baseX: ', baseX)
    console.log('||||str: ', str)
    console.log('||||alphabet: ', alphabet)

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i])
        decoded += index * Math.pow(base, str.length - i - 1)
    }

    // Minus 256 to recover the minus numbers
    let num256reduced = subtractNumAfterDecode(decoded, baseX)
    //console.log('str, decoded and num256reduced: ', str, decoded, num256reduced)

    return num256reduced
}
