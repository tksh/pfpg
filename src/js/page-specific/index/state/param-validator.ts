import type { DecodedParams } from "@tksh/stln-codec";
import type { ResolvedRenderSettings } from "libpfpg/settings";

export { validateArtworkConstraints };

const MAX_RENDERED_SIDE = 4096;

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
