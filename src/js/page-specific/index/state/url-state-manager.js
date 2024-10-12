import { settingsDefaults } from 'state/settings-defaults'

export
    { getStateUrlsOfImageCustomization
    , getStateUrlsOfSvgOptimization
    , getStateUrlsOfUiConfiguration
    , getStateUrl
    , updateStateUrl
    , removeUrlParams
    }


// Get

// URLから全ての状態パラメータを取得し、true/falseをブール値に変換する関数
function getAllStateUrls() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
        Array.from(params.entries())

            // settingsDefaults マップに存在するキーのみを抽出
            .filter(([key]) => settingsDefaults.has(key))

            .map(([key, value]) => {

                // true/falseをブール値に変換
                if (value.toLowerCase() === 'true') return [key, true];
                if (value.toLowerCase() === 'false') return [key, false];

                return [key, value];
            })
    );
}

// URLから特定の状態パラメータを取得する関数（ブール値対応）
function getStateUrl(key) {
    const allParams = getAllStateUrls();
    return allParams[key];
}



// Update

// 状態パラメータを 追加 または 更新 する
function updateStateUrl(params) {
    const currentParams = getAllStateUrls();
    const updatedParams = { ...currentParams, ...params };
    setStateUrl(updatedParams);
}

// URL状態パラメータを設定する関数
function setStateUrl(params) {
    const url = new URL(window.location.href);          // 現在のURLを URL オブジェクトとして作成

    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);               // 値が null または undefined の場合 該当するキーをURLから完全に削除
        } else {
            url.searchParams.set(key, value);           // キーと値のペアをURLに設定または更新
        }
    });

    // ブラウザの履歴を更新 - 現在のページのURLが変更されますが、ブラウザの履歴に新しいエントリーは作成せず
    // 現在のエントリーを上書きします。これは、ユーザーが「戻る」ボタンを押しても同じページに留まることを保証します。
    window.history.replaceState({}, '', url);

}



// Select the specific keys

// URLから特定の範囲の状態パラメータを取得する汎用関数（ブール値対応）
function getStateUrlsInRange(startIndex, endIndex) {
    const allParams = getAllStateUrls();
    const stateKeys = Array.from(settingsDefaults.keys()).slice(startIndex, endIndex);
    return new Map(
        Object.entries(allParams).filter(([key]) => stateKeys.includes(key))
    );
}

// SVG optimization の状態パラメータを全て取得する関数
function getStateUrlsOfSvgOptimization() {
    return getStateUrlsInRange(0, 3);
}

// Image customization の状態パラメータを全て取得する関数
function getStateUrlsOfImageCustomization() {
    return getStateUrlsInRange(3, 13);
}

// UI configuration の状態パラメータを全て取得する関数
function getStateUrlsOfUiConfiguration() {
    return getStateUrlsInRange(13, settingsDefaults.size);
}



// Remove the url params to reset

/**
 * 指定されたキー名の配列に対応するURLパラメータを削除する関数
 *
 * @param {string[]} keysToRemove - 削除対象のキー名の配列
 */
function removeUrlParams(keysToRemove) {
    const url = new URL(window.location.href);

    // 指定されたキーを削除
    keysToRemove.forEach(key => {
        url.searchParams.delete(key);
    });

    // 更新したURLで履歴を更新
    window.history.replaceState({}, '', url);
}
