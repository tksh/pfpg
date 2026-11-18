import type { DecodedParams } from "@tksh/stln-codec";
import { decodeArtwork, type DecodeOptions } from "../src/js/libpfpg/decode.ts";
import { renderArtwork } from "../src/js/libpfpg/render.ts";
import {
  excludeStateKeys,
  MAX_PARAMS_LENGTH,
  normalizeScalarParams,
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "../src/js/libpfpg/settings.ts";
import {
  SETTINGS_DEFAULTS,
  URL_PARAMS_EXCLUDED_FROM_ARTWORK,
} from "../src/js/constants.ts";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import { svg2rgba } from "svg2ui8a";

/**
 * State keys the app owns and the library does not know about.
 *
 * A shared URL carries the locale and the UI settings, and they are not artwork
 * data: the codec would read them as line groups and the request would fail.
 * The browser filters them through `common-utils/read-url-params.ts`; the server
 * has to pass them explicitly, or the same URL renders in the browser and 400s
 * on the OGP endpoint.
 */
const APP_STATE_KEYS: readonly string[] = [
  ...SETTINGS_DEFAULTS.keys(),
  ...URL_PARAMS_EXCLUDED_FROM_ARTWORK,
];

export interface OgpRenderResult {
  key: string;
  svg: string;
  pixels: Uint8Array;
  width: number;
  height: number;
}

export class InvalidOgpParamsError extends Error {
  constructor(cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause), { cause });
    this.name = "InvalidOgpParamsError";
  }
}

export async function renderPipeline(
  input: URLSearchParams,
): Promise<OgpRenderResult> {
  if (input.has("auto")) {
    throw new InvalidOgpParamsError(
      'The "auto" query parameter is no longer supported',
    );
  }
  const params = normalizeScalarParams(
    new URLSearchParams(input),
    APP_STATE_KEYS,
  );

  let svg: string;
  let key: string;
  let height: number;
  try {
    const artworkParams = excludeStateKeys(params, APP_STATE_KEYS);
    if (
      new TextEncoder().encode(artworkParams.toString()).length >
        MAX_PARAMS_LENGTH
    ) {
      throw new RangeError("URL parameters exceed 8192 bytes");
    }

    // The server answers arbitrary URLs, so it must not keep a cache keyed by
    // user input: unique URLs would grow the isolate's memory without bound.
    const decodeOptions: DecodeOptions = { cache: false };
    const decoded = await decodeArtwork(artworkParams, decodeOptions);

    svg = renderArtwork(decoded, resolveSvgRenderSettings(params));
    // Reuse the decode the render already did; decoding again here would double
    // the cost of every request.
    key = await getSharedImageKeyHash(params, decoded);
    height = resolveRasterSettings(params).heightPixelSize;
  } catch (error) {
    throw new InvalidOgpParamsError(error);
  }

  const raster = await svg2rgba(svg, { height });
  return {
    key,
    svg,
    pixels: raster.pixels,
    width: raster.width,
    height: raster.height,
  };
}

export function renderFailureResponse(error: unknown): Response {
  const status = error instanceof InvalidOgpParamsError ? 400 : 500;
  return new Response(
    JSON.stringify({
      error: error instanceof Error ? error.message : String(error),
    }),
    { status, headers: { "content-type": "application/json" } },
  );
}

// Kept for callers that only need the decoded artwork of a request.
export type { DecodedParams };
