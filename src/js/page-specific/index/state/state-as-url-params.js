import { settingsDefaults } from 'state/settings-defaults'

export
    { getStateUrlsOfImageCustomization
    , getStateUrlsOfSvgOptimization
    , getStateUrlsOfUiConfiguration
    , getStateUrl
    , updateStateUrl
    , resetAllStateUrls
    }


// Get

// URLから全ての状態パラメータを取得し、true/falseをブール値に変換する関数
function getAllStateUrls() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(
        Array.from(params.entries()).map(([key, value]) => {
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



// Update

// 状態パラメータを 追加 または 更新 する
function updateStateUrl(params) {
    const currentParams = getAllStateUrls();
    const updatedParams = { ...currentParams, ...params };
    setStateUrl(updatedParams);
}

// URL状態パラメータを設定する関数
function setStateUrl(params) {
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, value);
        }
    });
    window.history.replaceState({}, '', url);
}



// Reset

// 特定の状態パラメータをリセット（削除）する関数
function resetStateUrl(paramsToReset) {
    const currentParams = getAllStateUrls();
    paramsToReset.forEach(param => {
        delete currentParams[param];
    });
    setStateUrl(currentParams);
}

// 全ての状態パラメータを リセット（削除）
function resetAllStateUrls() {
    const allStateParams = [...settingsDefaults.keys()]
    resetStateUrl(allStateParams)
}
