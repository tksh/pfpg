import { BASIC_DATA_KEYS  } from 'constants'

export function getBasicDataFromUrlParams(urlParams) {
    // 結果を格納するオブジェクト
    const result = {};

    // 各キーについて処理
    BASIC_DATA_KEYS.forEach(key => {
        if (urlParams.has(key)) {
            let value = urlParams.get(key);
            result[key] = tryExpandURLCompressedStr(value);
        }
    });

    return result;
}

function tryExpandURLCompressedStr(value) {
    if (value.startsWith('~')) {
        // チルダで始まる場合はデコードする
        return URLCompressor.expand(value.slice(1));
    } else {
        // チルダがない場合はそのまま返す
        return value;
    }
}
