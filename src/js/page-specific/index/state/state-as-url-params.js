import { stateList } from 'state/state-as-map-obj'

export
    { getStateUrlsOfImageCustomization
    , getStateUrlsOfSvgStrOptimization
    , getStateUrlsOfUiConfiguration
    , getStateUrl
    , updateStateUrl
    , resetAllStateUrls
    }


// URLから 全ての状態パラメータを取得する関数
function getAllStateUrls() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
}

// URLから 特定の状態パラメータを取得する関数
function getStateUrl(key) {
    const allParams = getAllStateUrls();
    return allParams[key];
}


// URLから特定の範囲の状態パラメータを取得する汎用関数
function getStateUrlsInRange(startIndex, endIndex) {
    const urlParams = new URLSearchParams(window.location.search);
    const stateKeys = Array.from(stateList.keys()).slice(startIndex, endIndex);
    return new Map([...urlParams.entries()].filter(([key]) => stateKeys.includes(key)));
}

// SVG optimization の状態パラメータを全て取得する関数
function getStateUrlsOfSvgStrOptimization() {
    return getStateUrlsInRange(0, 3);
}

// Image Customization の状態パラメータを全て取得する関数
function getStateUrlsOfImageCustomization() {
    return getStateUrlsInRange(3, 13);
}

// UI configuration の状態パラメータを全て取得する関数
function getStateUrlsOfUiConfiguration() {
    return getStateUrlsInRange(13, stateList.size);
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

// 状態パラメータを 追加 または 更新 する
function updateStateUrl(params) {
    const currentParams = getAllStateUrls();
    const updatedParams = { ...currentParams, ...params };
    setStateUrl(updatedParams);
}


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
    const allStateParams = [...stateList.keys()]
    resetStateUrl(allStateParams)
}
