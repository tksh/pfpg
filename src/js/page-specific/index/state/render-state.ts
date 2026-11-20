import type { DecodedGroup, DecodedParams } from "@tksh/stln-codec";
import { decodeArtwork } from "libpfpg/decode";
import { renderArtwork, type RenderOverrides } from "libpfpg/render";
import {
  resolveRasterSettings,
  resolveSvgRenderSettings,
  type SvgRenderSettings,
} from "libpfpg/settings";
import { getUrlParamsExceptsStates } from "common-utils/read-url-params";
import { validateArtworkConstraints } from "./param-validator.ts";

/**
 * The page's render state.
 *
 * Only the artwork is held. Settings are read from the URL on every render,
 * because the URL is already the source of truth: every handler persists its
 * change through `updateState()`. Keeping a second copy of the settings would
 * create exactly the drift this refactor is meant to remove.
 */

let artwork: DecodedParams | null = null;

/**
 * Decode the artwork URL params, reusing the library's cache so rendering the
 * same artwork again does not decode it twice.
 */
export async function loadArtwork(): Promise<DecodedParams> {
  const params = getUrlParamsExceptsStates();
  if (params.toString() === "") {
    throw new Error("There are no artwork URL params to decode");
  }
  const decoded = await decodeArtwork(params);
  artwork = decoded;
  return decoded;
}

/** The artwork decoded at startup. Throws when called too early. */
export function currentArtwork(): DecodedParams {
  if (artwork === null) {
    throw new Error("currentArtwork: no artwork loaded yet");
  }
  return artwork;
}

/** The settings the URL currently asks for. */
export function currentSettings(): SvgRenderSettings {
  return resolveSvgRenderSettings(
    new URLSearchParams(globalThis.location.search),
  );
}

/**
 * Render the current artwork with the current settings.
 *
 * Synchronous, so a handler can re-render after each change without decoding
 * the URL again. Roughly 0.25 ms for a typical artwork, far below the
 * rasterization that follows it.
 */
export function renderCurrentSvg(
  overrides: RenderOverrides = {},
): string {
  const artwork = currentArtwork();
  const settings = currentSettings();
  // Validate after the artwork is decoded and before anything is drawn, on
  // every re-render — the group colors can change from a UI handler too.
  validateArtworkConstraints(artwork, {
    svg: settings,
    raster: resolveRasterSettings(
      new URLSearchParams(globalThis.location.search),
    ),
  });
  return renderArtwork(artwork, settings, overrides);
}

/**
 * The decoded line groups, for UI that derives a setting from the artwork
 * itself rather than from the URL.
 *
 * Reading them here is what keeps a second decode out of the startup path:
 * `decodeUrlParams()` costs about 5-7 ms, and the artwork never changes while
 * the page is open.
 */
export function currentLinesData(): Map<number, DecodedGroup> {
  return currentArtwork().linesData;
}
