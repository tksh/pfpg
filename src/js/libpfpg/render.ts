import { type DecodedParams, generateSvg } from "@tksh/stln-codec";
import {
  expandGroupColor,
  hexToOpacity,
  hexToRgb,
  rgbToString,
  shortenHexAsHalf,
} from "@tksh/group-colors-param-codec";
import {
  type ColorFormat,
  excludeStateKeys,
  MAX_PARAMS_LENGTH,
  normalizeScalarParams,
  type OpacityStep,
  readHeightPixelSize,
  readPathMode,
  resolveRasterSettings,
  resolveSvgRenderSettings,
  type ShapeToTrim,
  type SvgRenderSettings,
} from "./settings.ts";
import { numbersIncrementByStep, snapToGrid } from "./opacity-steps.ts";
import {
  clipShapeElement,
  slimmedViewBox,
  squircleSlimmedGeometry,
} from "./squircles.ts";
import {
  extractViewboxValues,
  replaceShapeRendering,
  replaceViewBox,
} from "./svg-attrs.ts";
import { optimizeSvgText } from "./optimize.ts";
import { convertColorFormat } from "./color-format.ts";
import { decodeArtwork } from "./decode.ts";

export { numbersIncrementByStep };

/**
 * Render an SVG from already-decoded artwork and resolved settings.
 *
 * Synchronous by design: the caller decodes once (see `decodeArtwork()`), then
 * every later setting change is just this call. That is what lets the browser
 * re-render on each interaction without decoding the URL again.
 *
 * `settings.colorFormat` applies when a step rebuilds the group elements
 * (`groupColors` or `opacitySteps`). When neither is present, pass
 * `overrides.forceColorFormat` to re-serialize the existing groups into that
 * notation; without it the codec's own notation is kept.
 */
export function renderArtwork(
  artwork: DecodedParams,
  settings: SvgRenderSettings,
  overrides: RenderOverrides = {},
): string {
  let svg = generateSvg(artwork, { pathMode: settings.pathMode });
  const colorFormat = settings.colorFormat ?? "rgb";

  if (settings.groupColors) {
    svg = applyGroupColors(
      svg,
      settings.groupColors,
      colorFormat,
      settings.optimize.removeOpacity,
    );
  } else if (overrides.forceColorFormat && settings.colorFormat !== undefined) {
    svg = recolorGroups(svg, settings.colorFormat);
  }
  if (settings.opacitySteps !== undefined) {
    svg = snapToGrid(
      svg,
      settings.opacitySteps,
      colorFormat,
      settings.optimize.removeOpacity,
    );
  }

  svg = applyShape(
    svg,
    settings.shapeToTrim,
    settings.widthNarrowness,
    settings.topHeavyRatio,
    settings.cropSideMargins,
  );
  svg = replaceShapeRendering(svg, settings.shapeRendering);

  return optimizeSvgText(svg, settings.optimize);
}

/**
 * The SVG a picker or thumbnail should be built from.
 *
 * Identical to `renderArtwork()` except that `opacitySteps` is not applied.
 *
 * The step selects which values the opacity controls offer; applying it here
 * would round the artwork's own opacities before a step has been chosen. Every
 * other setting, `groupColors` included, is applied as usual.
 */
/**
 * Per-call rendering choices that are not part of the resolved settings.
 *
 * Kept out of `SvgRenderSettings` on purpose: settings describe the URL, and
 * the shared-image key hashes exactly that. A caller-side choice such as
 * "re-serialize the groups now" must not leak into the key.
 */
export interface RenderOverrides {
  /** Re-serialize every group into `settings.colorFormat`. */
  forceColorFormat?: boolean;
}

/** Re-serialize each group's stroke into `colorFormat`, leaving opacity alone. */
function recolorGroups(svg: string, colorFormat: ColorFormat): string {
  return svg.replace(/<g\b[^>]*stroke="[^"]*"[^>]*>/g, (tag) => {
    const stroke = tag.match(/stroke="([^"]+)"/)?.[1];
    if (stroke === undefined) return tag;
    return tag.replace(stroke, convertColorFormat(stroke, colorFormat));
  });
}

export function renderArtworkWithoutOpacitySteps(
  artwork: DecodedParams,
  settings: SvgRenderSettings,
): string {
  return renderArtwork(artwork, { ...settings, opacitySteps: undefined });
}

/**
 * Render an SVG straight from URL params: decode, resolve, render.
 *
 * This is the one-shot entry point the tests and the OGP endpoint use. The
 * browser keeps a decoded artwork and calls `renderArtwork()` instead.
 *
 * The 8192-byte cap and the `heightPixelSize` validation stay here rather than
 * in `decodeArtwork()` / `renderArtwork()`: the browser's own decoder never
 * imposed the cap, and the server relies on the validation to answer 400
 * instead of 500 for a bad size.
 */
export interface RenderParamsOptions {
  /**
   * Keys to treat as app state rather than artwork data.
   *
   * The library only knows the render settings. The app owns the rest (locale,
   * theme, …) and passes them so one URL renders identically in the browser
   * and on the server. Without them a plain URL such as `?lang=ja` fails to
   * decode, because the codec would read the value as a line group.
   */
  extraStateKeys?: Iterable<string>;
}

export async function renderParamsToSvg(
  input: string | URLSearchParams,
  options: RenderParamsOptions = {},
): Promise<string> {
  const raw = typeof input === "string"
    ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input)
    : input;
  const extraStateKeys = options.extraStateKeys ?? [];
  const params = normalizeScalarParams(raw, extraStateKeys);
  const artworkParams = excludeStateKeys(params, extraStateKeys);
  if (
    new TextEncoder().encode(artworkParams.toString()).length >
      MAX_PARAMS_LENGTH
  ) throw new RangeError("URL parameters exceed 8192 bytes");

  const settings = resolveSvgRenderSettings(params);
  const artwork = await decodeArtwork(artworkParams, { cache: false });

  // Validate the raster settings even though this call only returns SVG, so an
  // unusable `heightPixelSize` fails here as a client error rather than later.
  resolveRasterSettings(params);

  return renderArtwork(artwork, settings);
}

function applyGroupColors(
  svg: string,
  encoded: string,
  format: string,
  removeOpacity: boolean,
): string {
  const colors = encoded.split("_").map((value) => {
    const expanded = expandGroupColor(value);
    const hex = shortenHexAsHalf(expanded.slice(0, 6));
    const stroke = format === "rgb"
      ? rgbToString(hexToRgb(`#${expanded.slice(0, 6)}`))
      : `#${hex}`;
    const opacity = hexToOpacity(expanded.slice(6, 8));
    const strokeOpacity = hexToOpacity(expanded.slice(8, 10));
    return [undefined, stroke, opacity, strokeOpacity] as [
      undefined,
      string,
      number,
      number,
    ];
  });
  let index = 0;
  return svg.replace(/<g[^>]*stroke=[^>]*>/g, (original) => {
    const entry = colors[index];
    if (!entry) {
      index++;
      return original;
    }
    const [, stroke, opacity, strokeOpacity] = entry;
    const attr =
      `id="${index++}" stroke="${stroke}" opacity="${opacity}" stroke-opacity="${strokeOpacity}"`;
    return removeOpacity
      ? `<g ${attr.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, "")}>`
      : `<g ${attr}>`;
  });
}

function applyShape(
  svg: string,
  shape: ShapeToTrim,
  widthNarrowness: number,
  topHeavyRatio: number,
  crop: boolean,
): string {
  const vb = extractViewboxValues(svg);
  if (!vb) throw new Error("viewBox not found in SVG");
  const size = vb.height;
  const geometry = shape === "squircleSlimmed"
    ? squircleSlimmedGeometry(size, { widthNarrowness, topHeavyRatio })
    : undefined;
  const element = clipShapeElement(shape, geometry, size);
  const compact = svg.includes('<clipPath id="shape-to-trim"></clipPath>');
  const clip = compact
    ? `<clipPath id="shape-to-trim">${element}</clipPath>`
    : `<clipPath id="shape-to-trim">\n            ${element}\n        </clipPath>`;
  let output = svg.replace(
    /<clipPath id="shape-to-trim">[\s\S]*?<\/clipPath>/,
    clip,
  );
  if (geometry && crop) {
    output = replaceViewBox(output, slimmedViewBox(geometry, vb));
  } else {
    // Restore the artwork's own canvas. Using the height for both axes would
    // stretch a non-square drawing into a square one.
    output = replaceViewBox(output, `0 0 ${vb.width} ${vb.height}`);
  }
  return output;
}

// Re-exported so callers that only need the raster side do not import the
// whole settings module's readers.
export { readHeightPixelSize, readPathMode };
export type { OpacityStep };
