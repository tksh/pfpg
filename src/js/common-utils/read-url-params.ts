import { SETTINGS_DEFAULTS, URL_PARAMS_EXCLUDED_FROM_ARTWORK } from "constants";

export { excludeStateKeys, getUrlParamsExceptsStates };

// Artwork URL params with UI state keys and app-configuration keys (like the
// `lang` locale selector) filtered out, for stln-codec.
// (Decoding itself moved to stln-codec; see 'state/url-decode'.)

// Same filtering rule, for params the caller already has, so the codec and
// the OGP key can never drift apart on which keys belong to the artwork.
function excludeStateKeys(urlParams: URLSearchParams): URLSearchParams {
  const excludedKeys = [
    ...Array.from(SETTINGS_DEFAULTS.keys()),
    ...URL_PARAMS_EXCLUDED_FROM_ARTWORK,
  ];
  return new URLSearchParams(
    [...urlParams.entries()].filter(([key]) => !excludedKeys.includes(key)),
  );
}

function getUrlParamsExceptsStates(): URLSearchParams {
  return excludeStateKeys(new URLSearchParams(globalThis.location.search));
}
