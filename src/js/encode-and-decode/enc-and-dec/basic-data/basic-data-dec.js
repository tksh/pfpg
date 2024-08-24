import { BASIC_DATA_KEYS  } from 'constants'

export function getBasicDataFromUrlParams(urlParams) {
    // 結果を格納するオブジェクト
    const result = {};

    // 各キーについて処理
    BASIC_DATA_KEYS.forEach(key => {
        if (urlParams.has(key)) {
            let value = urlParams.get(key);
            result[key] = tryExpandCompressedStr(value);
        }
    });

    return result;
}

function tryExpandCompressedStr(value) {
    if (value.startsWith('~')) {
        // チルダ で始まる場合は チルダ以降を そのまま 返す
        return value.slice(1);
    } else if (value.startsWith('0')) {
        // '0' で始まる場合は URLCompressorデコード する
        return URLCompressor.expand(value.slice(1));
    } else {
        console.error("Not valid string.");
    }
}
