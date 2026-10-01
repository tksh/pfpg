import { decodeUrlParams } from "@tksh/stln-codec";
import { excludeStateKeys } from "common-utils/read-url-params";
import {
  buildCanonicalImageInput,
  hashCanonicalImageInput,
  OGP_KEY_VERSION,
} from "dynamic-ogp/canonical-image-input";

export { getHashForOgImageUrl, getYearAndMonth };

/**
 * Generates the key of the shared image for the current URL.
 *
 * The key identifies the rendered drawing, not the URL text: two URLs that
 * decode to the same geometry, effective colors and rasterization settings
 * get the same key, whichever encoding the codec happened to produce for it.
 * The file format the pixels are stored in is not part of the key either; the
 * upload appends the format to it instead.
 *
 * @async
 * @function getHashForOgImageUrl
 * @returns {Promise<string>} A 32-character hexadecimal string
 */
async function getHashForOgImageUrl(): Promise<string> {
  const urlParams = new URLSearchParams(globalThis.location.search);
  // State keys are the app's own settings, not artwork data
  const artworkParams = excludeStateKeys(urlParams);
  const decoded = await decodeUrlParams(artworkParams);
  const hashHexPadded = hashCanonicalImageInput(
    buildCanonicalImageInput(urlParams, decoded),
  );
  // Only the version and the key: the canonical input holds the whole
  // artwork and is far too large to log.
  console.log(`Shared image key (${OGP_KEY_VERSION}):`, hashHexPadded);

  return hashHexPadded;
}

function getYearAndMonth(): { yyyy: number; yyyymm: string } {
  const dt = new Date();

  const yyyy = dt.getFullYear();
  console.log("yyyy: ", yyyy); // e.g.: 2024

  const mm = ("00" + (dt.getMonth() + 1)).slice(-2); // getMonth() 関数は １月を 0 として返却するので １を加算
  console.log("mm: ", mm); // e.g.: 12

  const yyyymm = `${yyyy}${mm}`;
  console.log("yyyymm: ", yyyymm); // e.g.: 202412

  return { yyyy, yyyymm };
}
