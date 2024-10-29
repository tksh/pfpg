import { decompressFromEncodedURIComponent } from 'common-utils/compression-stream'
import { FLAGS_MAP }                          from 'constants'
import { URLCompressor }                     from 'libs/url-comp-0-1-0/url-comp'

export function tryDecompress(string) {

    if (string.startsWith(FLAGS_MAP.get('1st').get('uncompressed'))) {
        // '~' で始まる場合は '~' 以降を そのまま 返す
        return string.slice(1)
    } else if (string.startsWith(FLAGS_MAP.get('1st').get('URLCompressor'))) {
        // '0' で始まる場合は URLCompressor でデコード する
        return URLCompressor.expand(string.slice(1))
    } else if (string.startsWith(FLAGS_MAP.get('1st').get('deflateRaw'))) {
        // '1' で始まる場合は DecompressionStream("deflate-raw") でデコード する
        return decompressFromEncodedURIComponent(string.slice(1), 'deflate-raw')
    } else {
        console.error("Not valid string.")
    }
}
