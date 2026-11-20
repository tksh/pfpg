import { type DecodedParams, decodeUrlParams } from "@tksh/stln-codec";
import {
  excludeStateKeys,
  normalizeScalarParams,
} from "common-utils/read-url-params";
import {
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "libpfpg/settings";
import { validateArtworkConstraints } from "../state/param-validator.ts";
import {
  buildCanonicalImageInput,
  hashCanonicalImageInput,
} from "shared-image/canonical-image-input";

export { getSharedImageKeyHash, getSharedImageKeyHashForCurrentUrl };

/**
 * Generates the key of the shared image for the given URL parameters.
 *
 * The key identifies the rendered drawing, not the URL text: two URLs that
 * decode to the same geometry, effective colors and rasterization settings
 * get the same key, whichever encoding the codec happened to produce for it.
 * The file format the pixels are stored in is not part of the key either; the
 * upload appends the format to it instead.
 *
 * @async
 * @function getSharedImageKeyHash
 * @param {URLSearchParams} urlParams - The full query parameters of the URL
 * @param {DecodedParams} [decoded] - Already-decoded artwork, when the caller
 *   decoded the same params for rendering. Passing it avoids decoding twice;
 *   it must be the decode of `urlParams` with the state keys filtered out.
 * @returns {Promise<string>} A 32-character hexadecimal string
 */
async function getSharedImageKeyHash(
  urlParams: URLSearchParams,
  decoded?: DecodedParams,
): Promise<string> {
  urlParams = normalizeScalarParams(urlParams);
  const settings = {
    svg: resolveSvgRenderSettings(urlParams),
    raster: resolveRasterSettings(urlParams),
  };
  // State keys are the app's own settings, not artwork data
  const artworkParams = excludeStateKeys(urlParams);
  const artwork = decoded ?? await decodeUrlParams(artworkParams);
  validateArtworkConstraints(artwork, settings);
  return hashCanonicalImageInput(buildCanonicalImageInput(artwork, settings));
}

// Current-page wrapper for the browser callers
function getSharedImageKeyHashForCurrentUrl(): Promise<string> {
  return getSharedImageKeyHash(
    new URLSearchParams(globalThis.location.search),
  );
}
