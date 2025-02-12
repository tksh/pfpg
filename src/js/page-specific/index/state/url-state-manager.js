import { SETTINGS_DEFAULTS } from 'constants'

export
    { getStateUrlsOfImageCustomization
    , getStateUrlsOfSvgOptimization
    , getStateUrlsOfUiConfiguration
    , getStateUrlsAsMapExcludesSvgOptimization
    , getState
    , getStateUrl
    , updateState
    , updateStateUrl
    , removeUrlParams
    }


// Get

// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key) {
    const stateValue = getStateUrl(key)
    return stateValue !== undefined ? stateValue : SETTINGS_DEFAULTS.get(key)
}

// URLから特定の状態パラメータを取得する関数（ブール値対応）
function getStateUrl(key) {
    const allParams = getAllStateUrls()
    return allParams[key]
}

// URLから全ての状態パラメータを取得し、true/falseをブール値に変換する関数
function getAllStateUrls() {
    const params = new URLSearchParams(window.location.search)
    return Object.fromEntries(
        Array.from(params.entries())

            // SETTINGS_DEFAULTS マップに存在するキーのみを抽出
            .filter(([key]) => SETTINGS_DEFAULTS.has(key))

            .map(([key, value]) => {

                // true/falseをブール値に変換
                if (value.toLowerCase() === 'true') return [key, true]
                if (value.toLowerCase() === 'false') return [key, false]

                return [key, value]
            })
    )
}

// URLから全ての状態パラメータを取得する関数
// - 存在しない場合は SETTINGS_DEFAULTS のデフォルト値を使用する
// - ブーリアンへの型変換は行わなず 文字列のまま 取得する
function getStateUrlsAsMapWithDefaultFill() {
    const params = new URLSearchParams(window.location.search);
    const result = new Map();

    // SETTINGS_DEFAULTSの全ての項目をチェック
    for (const [key, defaultValue] of SETTINGS_DEFAULTS) {
        if (params.has(key)) {
            // URLパラメータに存在する場合はその値を使用
            result.set(key, params.get(key));
        } else {
            // URLパラメータに存在しない場合はデフォルト値を使用
            result.set(key, defaultValue);
        }
    }

    return result;
}

function getStateUrlsAsRawWithDefaultFill() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
      Array.from(SETTINGS_DEFAULTS.keys()).map(key => {
        const valueFromUrl = params.get(key);
        return [key, valueFromUrl ?? SETTINGS_DEFAULTS.get(key)];  // valueFromUrl が undefined の場合、SETTINGS_DEFAULTS からデフォルト値を取得
      })
    );
}

// Update

// 状態パラメータを 追加 または 更新 する
function updateState(key, value) {
    updateStateUrl({ [key]: value })
}

function updateStateUrl(params) {
    const currentParams = getAllStateUrls()
    const updatedParams = { ...currentParams, ...params }
    setStateUrl(updatedParams)
}

// URL状態パラメータを設定する関数
function setStateUrl(params) {
    const url = new URL(window.location.href)          // 現在のURLを URL オブジェクトとして作成

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key)               // 値が null または undefined の場合 該当するキーをURLから完全に削除
        } else {
            url.searchParams.set(key, value)           // キーと値のペアをURLに設定または更新
        }
    })

    // ブラウザの履歴を更新 - 現在のページのURLが変更されますが、ブラウザの履歴に新しいエントリーは作成せず
    // 現在のエントリーを上書きします。これは、ユーザーが「戻る」ボタンを押しても同じページに留まることを保証します。
    window.history.replaceState({}, '', url)

}



// Select the specific keys

// URLから特定の範囲の状態パラメータを取得する汎用関数（ブール値対応）
function getStateUrlsInRange(startIndex, endIndex) {
    const allParams = getAllStateUrls()  // return Object
    const stateKeys = Array.from(SETTINGS_DEFAULTS.keys()).slice(startIndex, endIndex)
    return new Map(
        Object.entries(allParams).filter(([key]) => stateKeys.includes(key))
    )
}
// URLから特定の範囲の状態パラメータを取得する汎用関数
function getStateUrlsInRangeAsMapWithDefaultFill(startIndex, endIndex) {
    const allParams = getStateUrlsAsMapWithDefaultFill()  // return Map
    console.log("allParams: ", allParams)
    const stateKeys = Array.from(SETTINGS_DEFAULTS.keys()).slice(startIndex, endIndex)
    return new Map(
        Object.entries(allParams).filter(([key]) => stateKeys.includes(key))
    )
}
// マップオブジェクトを SETTINGS_DEFAULTS の開始インデックスと終了インデックスでフィルタリングする関数
function filterStateByIndex(stateMap, startIndex, endIndex) {
    const filteredMap = new Map();

    // SETTINGS_DEFAULTS からキーを範囲で抽出
    const keysInRange = Array.from(SETTINGS_DEFAULTS.keys()).slice(startIndex, endIndex + 1);

    // stateMap の中で指定されたキーのみを保持
    keysInRange.forEach((key) => {
        if (stateMap.has(key)) {
            filteredMap.set(key, stateMap.get(key));
        }
    });

    return filteredMap;
}


// SVG optimization の状態パラメータを全て取得する関数
function getStateUrlsOfSvgOptimization() {
    return getStateUrlsInRange(0, 3)
}

// Image customization の状態パラメータを全て取得する関数
function getStateUrlsOfImageCustomization() {
    return getStateUrlsInRange(3, 13)
}

// UI configuration の状態パラメータを全て取得する関数
function getStateUrlsOfUiConfiguration() {
    return getStateUrlsInRange(13, SETTINGS_DEFAULTS.size)
}

// Image customization, UI configuration の状態パラメータを全て取得し 存在しない場合はデフォルト値で補完する関数
// - ブーリアンへの型変換は行わなず 文字列のまま 取得する
function getStateUrlsAsMapExcludesSvgOptimization() {
    const statusExcludeArtworkData = getStateUrlsAsMapWithDefaultFill()
    const statusExcludeSvgOptimization = filterStateByIndex(statusExcludeArtworkData, 3, SETTINGS_DEFAULTS.size)
    return statusExcludeSvgOptimization
}



// Remove the url params to reset

/**
 * 指定されたキー名の配列に対応するURLパラメータを削除する関数
 *
 * @param {string[]} keysToRemove - 削除対象のキー名の配列
 */
function removeUrlParams(keysToRemove) {
    const url = new URL(window.location.href)

    // 指定されたキーを削除
    keysToRemove.forEach(key => {
        url.searchParams.delete(key)
    })

    // 更新したURLで履歴を更新
    window.history.replaceState({}, '', url)
}
