import { decodeUrlParams } from "@tksh/stln-codec";
import {
  excludeStateKeys,
  normalizeScalarParams,
} from "common-utils/read-url-params";
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
 * @returns {Promise<string>} A 32-character hexadecimal string
 */
async function getSharedImageKeyHash(
  urlParams: URLSearchParams,
): Promise<string> {
  urlParams = normalizeScalarParams(urlParams);
  // State keys are the app's own settings, not artwork data
  const artworkParams = excludeStateKeys(urlParams);
  const decoded = await decodeUrlParams(artworkParams);
  const hashHexPadded = hashCanonicalImageInput(
    buildCanonicalImageInput(urlParams, decoded),
  );

  return hashHexPadded;
}

// Current-page wrapper for the browser callers
function getSharedImageKeyHashForCurrentUrl(): Promise<string> {
  return getSharedImageKeyHash(
    new URLSearchParams(globalThis.location.search),
  );
}
