import { SETTINGS_DEFAULTS, URL_PARAMS_EXCLUDED_FROM_ARTWORK } from "constants";
import {
  excludeStateKeys as excludeRenderStateKeys,
  normalizeScalarParams as normalizeRenderScalarParams,
  readLastParam,
} from "libpfpg/settings";

export {
  excludeStateKeys,
  getUrlParamsExceptsStates,
  normalizeScalarParams,
  readLastParam,
};

// Artwork URL params with UI state keys and app-configuration keys (like the
// `lang` locale selector) filtered out, for stln-codec.
// (Decoding itself moved to the library: see `state/render-state.ts`.)

// The library owns the render-setting keys and their order; the app adds the
// keys it owns on top. Sharing one rule keeps the codec input and the OGP key
// from drifting apart on which keys belong to the artwork.
function normalizeScalarParams(params: URLSearchParams): URLSearchParams {
  return normalizeRenderScalarParams(params, [
    ...SETTINGS_DEFAULTS.keys(),
    ...URL_PARAMS_EXCLUDED_FROM_ARTWORK,
  ]);
}

function excludeStateKeys(urlParams: URLSearchParams): URLSearchParams {
  return excludeRenderStateKeys(
    urlParams,
    [
      ...SETTINGS_DEFAULTS.keys(),
      ...URL_PARAMS_EXCLUDED_FROM_ARTWORK,
    ],
  );
}

function getUrlParamsExceptsStates(): URLSearchParams {
  return excludeStateKeys(new URLSearchParams(globalThis.location.search));
}
