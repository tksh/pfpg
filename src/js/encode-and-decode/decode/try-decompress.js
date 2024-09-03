export function tryDecompress(string) {
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
