import { URLCompressor } from 'libs/url-comp-0-1-0/url-comp'
// import TEST from 'libs/url-comp-0-1-0/url-comp'

export function tryDecompress(string) {
    // console.log("TEST: ", TEST)
    if (string.startsWith('~')) {
        // チルダ で始まる場合は チルダ以降を そのまま 返す
        return string.slice(1)
    } else if (string.startsWith('0')) {
        // '0' で始まる場合は URLCompressorデコード する
        return URLCompressor.expand(string.slice(1))
    } else {
        console.error("Not valid string.")
    }
}
