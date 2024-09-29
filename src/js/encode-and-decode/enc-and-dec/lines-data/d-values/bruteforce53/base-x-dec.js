import { subtractNumAfterDecode } from 'enc-and-dec/lines-data/d-values/bruteforce53/add-and-subtract'
import { getAlphabets52 }         from 'enc-and-dec/lines-data/d-values/bruteforce53/specific-alphabets'


// BaseX decode for both 'a' padded or not

export function baseXDec(str, baseX) {
    const alphabets52 = getAlphabets52()
    const alphabet = alphabets52.substring(0, baseX)
    let base = alphabet.length
    let decoded = 0

    for (let i = 0; i < str.length; i++) {
        let index = alphabet.indexOf(str[i])
        decoded += index * Math.pow(base, str.length - i - 1)
    }

    // Subtract to restore the original diff value
    let restored = subtractNumAfterDecode(decoded, baseX)
    //console.log('decoded, restored: ', decoded, restored)

    return restored
}
