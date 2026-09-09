import { SETTINGS_DEFAULTS } from "constants";

export { getUrlParamsExceptsStates };

// Artwork URL params with UI state keys filtered out, for stln-codec.
// (Decoding itself moved to stln-codec; see 'state/url-decode'.)

function getUrlParamsExceptsStates(): URLSearchParams {
  const urlParams = new URLSearchParams(globalThis.location.search);
  const stateKeys = Array.from(SETTINGS_DEFAULTS.keys());
  // console.log('stateKeys to exclude: ', stateKeys)
  // (17) ['removeOpacity', 'removeLineBreaks', ... 'textWrapping', 'themeColor']

  // stateキーのリストを作成
  const filteredParams = new URLSearchParams(
    [...urlParams.entries()].filter(([key]) => !stateKeys.includes(key)),
  );

  return filteredParams;
}
