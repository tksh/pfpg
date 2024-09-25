export function decodeWithFourBase16(symbol, charsSet) {

    let base = 16
    let decoded = 0

    for (let i = 0; i < symbol.length; i++) {
        let index = charsSet.indexOf(symbol[i])
        decoded += index * Math.pow(base, symbol.length - i - 1)
    }

    //console.log("symbol, decoded:", symbol, decoded)
    return decoded
}