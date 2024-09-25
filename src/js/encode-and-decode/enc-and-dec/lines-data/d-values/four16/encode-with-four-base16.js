// Get the encoded string from
//   - diff-by-row (via relative), or
//   - relative d values

export function encodeCoordsWithFourBase16(coords, charsSets) {
    //console.log('coords: ', coords)  // e.g.: {x1: Array(2), y1: Array(2), x2: Array(2), y2: Array(2)}

    let encodedCoordsStr = ''  // x1 + y1 + x2 + x2 as a string

    Object.values(coords).map((numArr) => {

        const encodedArr = numArr.map((num) => {
            let result

            // 正の数 [0:15]     は P1 文字列セット で 1桁に エンコードする
            result = handlePositiveToBeSingleDigit(num, charsSets.p1)
            if (result !== undefined) return result

            // 負の数 [-15:-1]   は N1 文字列セット で 1桁に エンコードする
            result = handleNegativeToBeSingleDigit(num, charsSets.n1)
            if (result !== undefined) return result

            // 正の数 [16:255]   は P2 文字列セット で 2桁に エンコードする
            result = handlePositiveToBeDoubleDigits(num, charsSets.p2)
            if (result !== undefined) return result

            // 負の数 [-255:-16] は N2 文字列セット で 2桁に エンコードする
            result = handleNegativeToBeDoubleDigits(num, charsSets.n2)
            if (result !== undefined) return result
        })
        //console.log("encodedArr: ", encodedArr)  // e.g.: (2) ['l', 'K']

        encodedCoordsStr += encodedArr.join('')
    })

    return encodedCoordsStr
}


export function customBase16Enc(num, charsSet) {

    let base = 16
    let encoded = ''

    if (num === 0) {
        return charsSet[0]
    }

    while (num) {
        let remainder = num % base
        num = Math.floor(num / base)
        encoded = charsSet[remainder] + encoded
    }

    return encoded
}


// [0:15]
function handlePositiveToBeSingleDigit(num, charsSet) {
    if (num >= 0 && num <= 15) {
        return customBase16Enc(num, charsSet)
    }
}
// [-15:-1]
function handleNegativeToBeSingleDigit(num, charsSet) {
    if (num >= -15 && num <= -1) {
        return customBase16Enc(Math.abs(num), charsSet)
    }
}
// [16:255]
function handlePositiveToBeDoubleDigits(num, charsSet) {
    if (num >= 16 && num <= 255) {
        return customBase16Enc(num, charsSet)
    }
}
// [-255:-16]
function handleNegativeToBeDoubleDigits(num, charsSet) {
    if (num >= -255 && num <= -16) {
        return customBase16Enc(Math.abs(num), charsSet)
    }
}
