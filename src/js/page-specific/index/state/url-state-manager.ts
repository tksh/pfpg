import { SETTINGS_DEFAULTS, type SettingValue } from "constants";
import { readLastParam } from "common-utils/read-url-params";

export {
  getState,
  getStateUrl,
  getStateUrlsAsMapExcludesSvgOptimization,
  getStateUrlsAsRawWithDefaultFill,
  getStateUrlsInRangeAsMapWithDefaultFill,
  getStateUrlsOfImageCustomization,
  getStateUrlsOfSvgOptimization,
  getStateUrlsOfUiConfiguration,
  removeUrlParams,
  updateState,
  updateStateUrl,
};

// Get

// URL状態パラメータから値を取得し、無ければデフォルト値を返す
function getState(key: string): SettingValue {
  const stateValue = getStateUrl(key);
  return stateValue !== undefined ? stateValue : SETTINGS_DEFAULTS.get(key);
}

// URLから特定の状態パラメータを取得する関数（ブール値対応）
function getStateUrl(key: string): SettingValue {
  const allParams = getAllStateUrls();
  return allParams[key];
}

// URLから全ての状態パラメータを取得し、true/falseをブール値に変換する関数
function getAllStateUrls(): Record<string, string | boolean> {
  const params = new URLSearchParams(globalThis.location.search);
  return Object.fromEntries(
    Array.from(params.entries())
      // SETTINGS_DEFAULTS マップに存在するキーのみを抽出
      .filter(([key]) => SETTINGS_DEFAULTS.has(key))
      .map(([key, value]): [string, string | boolean] => {
        // true/falseをブール値に変換
        if (value.toLowerCase() === "true") return [key, true];
        if (value.toLowerCase() === "false") return [key, false];

        return [key, value];
      }),
  );
}

// URLから全ての状態パラメータを取得する関数
// - 存在しない場合は SETTINGS_DEFAULTS のデフォルト値を使用する
// - ブーリアンへの型変換は行わなず 文字列のまま 取得する
function getStateUrlsAsMapWithDefaultFill(): Map<string, SettingValue> {
  const params = new URLSearchParams(globalThis.location.search);
  const result = new Map<string, SettingValue>();

  // SETTINGS_DEFAULTSの全ての項目をチェック
  for (const [key, defaultValue] of SETTINGS_DEFAULTS) {
    if (params.has(key)) {
      // URLパラメータに存在する場合はその値を使用
      result.set(key, readLastParam(params, key) ?? defaultValue);
    } else {
      // URLパラメータに存在しない場合はデフォルト値を使用
      result.set(key, defaultValue);
    }
  }

  return result;
}

function getStateUrlsAsRawWithDefaultFill(): Record<string, SettingValue> {
  const params = new URLSearchParams(globalThis.location.search);
  return Object.fromEntries(
    Array.from(SETTINGS_DEFAULTS.keys()).map((key): [string, SettingValue] => {
      const valueFromUrl = readLastParam(params, key);
      return [key, valueFromUrl ?? SETTINGS_DEFAULTS.get(key)]; // valueFromUrl が undefined の場合、SETTINGS_DEFAULTS からデフォルト値を取得
    }),
  );
}

// Update

// 状態パラメータを 追加 または 更新 する
function updateState(key: string, value: SettingValue | null): void {
  updateStateUrl({ [key]: value });
}

function updateStateUrl(params: Record<string, SettingValue | null>): void {
  const currentParams = getAllStateUrls();
  const updatedParams: Record<string, SettingValue | null> = {
    ...currentParams,
    ...params,
  };
  setStateUrl(updatedParams);
}

// URL状態パラメータを設定する関数
function setStateUrl(params: Record<string, SettingValue | null>): void {
  const url = new URL(globalThis.location.href); // 現在のURLを URL オブジェクトとして作成

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      url.searchParams.delete(key); // 値が null または undefined の場合 該当するキーをURLから完全に削除
    } else {
      url.searchParams.set(key, String(value)); // キーと値のペアをURLに設定または更新
    }
  });

  // ブラウザの履歴を更新 - 現在のページのURLが変更されますが、ブラウザの履歴に新しいエントリーは作成せず
  // 現在のエントリーを上書きします。これは、ユーザーが「戻る」ボタンを押しても同じページに留まることを保証します。
  globalThis.history.replaceState({}, "", url);
}

// Select the specific keys

// URLから特定の範囲の状態パラメータを取得する汎用関数（ブール値対応）
function getStateUrlsInRange(
  startIndex: number,
  endIndex: number,
): Map<string, string | boolean> {
  const allParams = getAllStateUrls(); // return Object
  const stateKeys = Array.from(SETTINGS_DEFAULTS.keys()).slice(
    startIndex,
    endIndex,
  );
  return new Map(
    Object.entries(allParams).filter(([key]) => stateKeys.includes(key)),
  );
}
// URLから特定の範囲の状態パラメータを取得する汎用関数
function getStateUrlsInRangeAsMapWithDefaultFill(
  startIndex: number,
  endIndex: number,
): Map<string, SettingValue> {
  const allParams = getStateUrlsAsMapWithDefaultFill(); // return Map
  const stateKeys = Array.from(SETTINGS_DEFAULTS.keys()).slice(
    startIndex,
    endIndex,
  );
  return new Map(
    Object.entries(allParams).filter(([key]) => stateKeys.includes(key)),
  );
}
// マップオブジェクトを SETTINGS_DEFAULTS の開始インデックスと終了インデックスでフィルタリングする関数
function filterStateByIndex(
  stateMap: Map<string, SettingValue>,
  startIndex: number,
  endIndex: number,
): Map<string, SettingValue> {
  const filteredMap = new Map<string, SettingValue>();

  // SETTINGS_DEFAULTS からキーを範囲で抽出
  const keysInRange = Array.from(SETTINGS_DEFAULTS.keys()).slice(
    startIndex,
    endIndex + 1,
  );

  // stateMap の中で指定されたキーのみを保持
  keysInRange.forEach((key) => {
    if (stateMap.has(key)) {
      filteredMap.set(key, stateMap.get(key));
    }
  });

  return filteredMap;
}

// SVG optimization の状態パラメータを全て取得する関数
function getStateUrlsOfSvgOptimization(): Map<string, string | boolean> {
  return getStateUrlsInRange(0, 3);
}

// Image customization の状態パラメータを全て取得する関数
function getStateUrlsOfImageCustomization(): Map<string, string | boolean> {
  return getStateUrlsInRange(3, 13);
}

// UI configuration の状態パラメータを全て取得する関数
function getStateUrlsOfUiConfiguration(): Map<string, string | boolean> {
  return getStateUrlsInRange(13, SETTINGS_DEFAULTS.size);
}

// Image customization, UI configuration の状態パラメータを全て取得し 存在しない場合はデフォルト値で補完する関数
// - ブーリアンへの型変換は行わなず 文字列のまま 取得する
function getStateUrlsAsMapExcludesSvgOptimization(): Map<string, SettingValue> {
  const statusExcludeArtworkData = getStateUrlsAsMapWithDefaultFill();
  const statusExcludeSvgOptimization = filterStateByIndex(
    statusExcludeArtworkData,
    3,
    SETTINGS_DEFAULTS.size,
  );
  return statusExcludeSvgOptimization;
}

// Remove the url params to reset

/**
 * 指定されたキー名の配列に対応するURLパラメータを削除する関数
 *
 * @param {string[]} keysToRemove - 削除対象のキー名の配列
 */
function removeUrlParams(keysToRemove: string[]): void {
  const url = new URL(globalThis.location.href);

  // 指定されたキーを削除
  keysToRemove.forEach((key) => {
    url.searchParams.delete(key);
  });

  // 更新したURLで履歴を更新
  globalThis.history.replaceState({}, "", url);
}
