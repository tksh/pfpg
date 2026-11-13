import { SETTINGS_DEFAULTS, URL_PARAMS_EXCLUDED_FROM_ARTWORK } from "constants";
import { BASIC_DATA_KEYS } from "@tksh/stln-codec";

export {
  excludeStateKeys,
  getUrlParamsExceptsStates,
  normalizeScalarParams,
  readLastParam,
};

// Artwork URL params with UI state keys and app-configuration keys (like the
// `lang` locale selector) filtered out, for stln-codec.
// (Decoding itself moved to stln-codec; see 'state/url-decode'.)

// Same filtering rule, for params the caller already has, so the codec and
// the OGP key can never drift apart on which keys belong to the artwork.
function normalizeScalarParams(params: URLSearchParams): URLSearchParams {
  const scalarKeys = new Set([
    ...SETTINGS_DEFAULTS.keys(),
    ...URL_PARAMS_EXCLUDED_FROM_ARTWORK,
    ...BASIC_DATA_KEYS,
  ]);
  const entries = [...params.entries()];
  const lastIndex = new Map<string, number>();
  entries.forEach(([key], index) => {
    if (scalarKeys.has(key)) lastIndex.set(key, index);
  });
  return new URLSearchParams(
    entries.filter(([key], index) =>
      !scalarKeys.has(key) || lastIndex.get(key) === index
    ),
  );
}

function readLastParam(params: URLSearchParams, key: string): string | null {
  return params.getAll(key).at(-1) ?? null;
}

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
