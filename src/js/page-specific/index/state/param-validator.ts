import type { DecodedParams } from "@tksh/stln-codec";
import type { Locale } from "i18n/supported-locales";
import {
  normalizeScalarParams,
  type ResolvedRenderSettings,
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "libpfpg/settings";
import {
  resolveLocaleStrict,
  resolveUiSettings,
  type UiSettings,
} from "state/ui-settings";

export { parseStartupUrl, validateArtworkConstraints, validateParamsSchema };

export interface ValidatedParams extends ResolvedRenderSettings {
  ui: UiSettings;
  locale: Locale;
}

export interface StartupUrl {
  validated: ValidatedParams;
  normalizedSearch: string;
}

const MAX_RENDERED_SIDE = 4096;

/**
 * The browser's first step: validate the whole query and only then compute the
 * normalized search that the page may write back. A rejected URL produces no
 * normalized value at all, so no `replaceState` can run for it.
 */
function parseStartupUrl(search: string): StartupUrl {
  const params = new URLSearchParams(search);
  const validated = validateParamsSchema(params);
  return {
    validated,
    normalizedSearch: normalizeScalarParams(params).toString(),
  };
}

/**
 * Stage 1: validate every URL-only value before decoding, side effects or DOM
 * work. All four resolvers share this entry point so the browser and the OGP
 * endpoints cannot disagree about the same URL.
 */
function validateParamsSchema(params: URLSearchParams): ValidatedParams {
  return {
    svg: resolveSvgRenderSettings(params),
    raster: resolveRasterSettings(params),
    ui: resolveUiSettings(params),
    locale: resolveLocaleStrict(params),
  };
}

/**
 * Stage 2: validate constraints that only exist once the artwork is decoded.
 *
 * Stage 1 (`libpfpg/settings.ts` plus the app's UI resolver) has already narrowed
 * every URL value to a closed domain. What remains depends on the drawing: how
 * many groups it has and how wide it becomes at the requested raster height.
 * Callers must run this after decoding and before rendering or key generation.
 */
function validateArtworkConstraints(
  artwork: DecodedParams,
  settings: ResolvedRenderSettings,
): void {
  const groupColors = settings.svg.groupColors;
  if (groupColors !== undefined) {
    const specified = groupColors.split("_").length;
    if (specified > artwork.linesData.size) {
      throw new TypeError("Excess groupColors specified for artwork");
    }
  }

  const { width, height } = artwork.sizeData;
  const renderedWidth = Math.round(
    settings.raster.heightPixelSize * (width / height),
  );
  if (
    Math.max(renderedWidth, settings.raster.heightPixelSize) >
      MAX_RENDERED_SIDE
  ) {
    throw new RangeError("Rendered image dimensions exceed 4096px");
  }
}
