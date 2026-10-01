import { SETTINGS_DEFAULTS } from "constants";

export { excludeStateKeys, getUrlParamsExceptsStates };

// Artwork URL params with UI state keys filtered out, for stln-codec.
// (Decoding itself moved to stln-codec; see 'state/url-decode'.)

// Same filtering rule, for params the caller already has, so the codec and
// the OGP key can never drift apart on which keys belong to the artwork.
function excludeStateKeys(urlParams: URLSearchParams): URLSearchParams {
  const stateKeys = Array.from(SETTINGS_DEFAULTS.keys());
  return new URLSearchParams(
    [...urlParams.entries()].filter(([key]) => !stateKeys.includes(key)),
  );
}

function getUrlParamsExceptsStates(): URLSearchParams {
  return excludeStateKeys(new URLSearchParams(globalThis.location.search));
}
