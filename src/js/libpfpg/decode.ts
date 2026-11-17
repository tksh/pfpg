import { type DecodedParams, decodeUrlParams } from "@tksh/stln-codec";

/**
 * Why this module exists
 *
 * The browser decodes an artwork once and then re-renders on every setting
 * change, so the decoded data is worth keeping for the page's lifetime. The
 * OGP server handles arbitrary URLs, so the same cache there would grow
 * without bound as unique URLs arrive. The cache is therefore opt-in and
 * defaults to on, and the server passes `{ cache: false }`.
 */

export interface DecodeOptions {
  /**
   * Keep the last decode for reuse. Defaults to `true`, which suits the
   * browser where one artwork is on screen. Pass `false` for request-scoped
   * callers such as the OGP render endpoint.
   */
  cache?: boolean;
}

interface CacheEntry {
  /** The artwork params the entry was decoded from, for exact comparison. */
  key: string;
  decoded: DecodedParams;
}

let cache: CacheEntry | null = null;

/** Drop the cached decode. Exists for tests and for explicit invalidation. */
export function resetArtworkCache(): void {
  cache = null;
}

/**
 * Decode the artwork params into the data every later render step reads.
 *
 * The returned `DecodedParams` is what `renderArtwork()` consumes, so
 * decoding can happen once per page (browser) or once per request (server)
 * while all subsequent renders stay synchronous.
 */
export async function decodeArtwork(
  artworkParams: URLSearchParams,
  options: DecodeOptions = {},
): Promise<DecodedParams> {
  const useCache = options.cache ?? true;
  // Only the artwork params belong in the key. State keys such as
  // `shapeToTrim` never change the drawing, so including them would defeat the
  // cache.
  const key = artworkParams.toString();

  if (useCache && cache !== null && cache.key === key) {
    return cache.decoded;
  }

  const decoded = await decodeUrlParams(key);

  if (useCache) {
    cache = { key, decoded };
  }

  return decoded;
}
