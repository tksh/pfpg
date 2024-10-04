import { stateList } from 'state/state-as-map-obj'

export
    { getAllStateUrl
    , getStateUrl
    , updateStateUrl
    , resetAllStateUrl
    }


// URLから 全ての状態パラメータを取得する関数
function getAllStateUrl() {
    const params = new URLSearchParams(window.location.search);
    return Object.fromEntries(params);
}

// URLから 特定の状態パラメータを取得する関数
function getStateUrl(key) {
    const allParams = getAllStateUrl();
    return allParams[key];
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

// 特定の状態パラメータをリセット（削除）する関数
function resetStateUrl(paramsToReset) {
    const currentParams = getAllStateUrl();
    paramsToReset.forEach(param => {
        delete currentParams[param];
    });
    setStateUrl(currentParams);
}

// 状態パラメータを 追加 または 更新 する
function updateStateUrl(params) {
    const currentParams = getAllStateUrl();
    const updatedParams = { ...currentParams, ...params };
    setStateUrl(updatedParams);
}


// 全ての状態パラメータを リセット（削除）
function resetAllStateUrl() {
    const allStateParams = [...stateList.keys()]
    resetStateUrl(allStateParams)
}

// 使用例

// // 状態パラメータを追加または更新
// updateStateUrl({
//     removeOpacity: 'true',
//     pathMode: 'relativeMerged',
//     newParam: 'value'
// });
