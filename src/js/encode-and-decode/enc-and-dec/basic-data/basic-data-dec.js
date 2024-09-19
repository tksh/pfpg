import { BASIC_DATA_KEYS } from 'constants'
import { tryDecompress }   from 'decode/try-decompress'

export function getBasicDataFromUrlParams(urlParams) {
    // 結果を格納するオブジェクト
    const result = {}

    // 各キーについて処理
    BASIC_DATA_KEYS.forEach(key => {
        if (urlParams.has(key)) {
            let value = urlParams.get(key)
            result[key] = tryDecompress(value)
        }
    })

    return result
}
