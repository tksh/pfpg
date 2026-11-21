import { BASIC_DATA_KEYS } from "@tksh/stln-codec";

export const MAX_PARAMS_LENGTH = 8192;

/**
 * SVG optimization toggles, in the order the app serializes them.
 *
 * The entry order is a serialization contract. Consumers that group these keys
 * for the UI select them by membership in this map, not by position.
 */
export const SVG_OPTIMIZE_SETTING_DEFAULTS = new Map<
  string,
  string | boolean | number | undefined
>([
  ["removeOpacity", false],
  ["removeLineBreaks", false],
  ["removeSpaces", true],
]);

/**
 * The one definition of the keys that decide the drawn artwork, in the order
 * the app serializes them. `src/js/constants.ts` derives its settings maps
 * from this, so the library and the UI cannot drift apart.
 *
 * Only entries the library itself reads belong here. UI-only settings
 * (`themeColor`, `buttonAction`, …) stay in the app.
 */
export const VISUAL_SETTING_DEFAULTS = new Map<
  string,
  string | boolean | number | undefined
>([
  ["groupColors", undefined],
  ["pathMode", "absoluteSeparated"],
  ["opacitySteps", undefined],
  ["colorFormat", "rgb"],
  ["shapeToTrim", "square"],
  ["widthNarrowness", 10],
  ["topHeavyRatio", 1],
  ["cropSideMargins", true],
  ["shapeRendering", "crispEdges"],
  ["heightPixelSize", 256],
]);

/**
 * Every key the library reads, in serialization order: SVG optimization
 * first, then the visual settings.
 */
export const RENDER_SETTING_DEFAULTS = new Map<
  string,
  string | boolean | number | undefined
>([...SVG_OPTIMIZE_SETTING_DEFAULTS, ...VISUAL_SETTING_DEFAULTS]);

export const RENDER_SETTING_KEYS: readonly string[] = [
  ...RENDER_SETTING_DEFAULTS.keys(),
];

/**
 * Keys that are app state rather than artwork data. The library only needs the
 * ones that are part of the render contract; the app passes its own additional
 * keys (locale, theme, …) when it filters params.
 */
const stateDefaults = RENDER_SETTING_DEFAULTS;

export function normalizeScalarParams(
  params: URLSearchParams,
  extraKeys: Iterable<string> = [],
): URLSearchParams {
  const keys = new Set([
    ...stateDefaults.keys(),
    ...extraKeys,
    ...BASIC_DATA_KEYS,
  ]);
  const entries = [...params.entries()];
  const last = new Map<string, number>();
  entries.forEach(([key], i) => {
    if (keys.has(key)) last.set(key, i);
  });
  return new URLSearchParams(
    entries.filter(([key], i) => !keys.has(key) || last.get(key) === i),
  );
}

export function readLastParam(
  params: URLSearchParams,
  key: string,
): string | null {
  return params.getAll(key).at(-1) ?? null;
}

/**
 * Drop the app's own state keys so only artwork params remain.
 *
 * `extraKeys` covers state the library does not know about (locale, theme,
 * …); the app passes the keys it owns so the server and the browser filter
 * the same way.
 */
export function excludeStateKeys(
  params: URLSearchParams,
  extraKeys: Iterable<string> = [],
): URLSearchParams {
  const excluded = new Set([...stateDefaults.keys(), ...extraKeys]);
  return new URLSearchParams(
    [...params.entries()].filter(([key]) => !excluded.has(key)),
  );
}

function raw(params: URLSearchParams, key: string): string | null {
  return readLastParam(params, key);
}
/**
 * Read a boolean setting.
 *
 * Only the exact spellings `true` / `false` are accepted. A key that is present
 * with anything else — including `TRUE`, `1` or an empty string — is an error
 * rather than a silent default: coercing a value here while the shared-image key
 * reads it differently is what made one URL produce two different pictures
 * under one key.
 */
function bool(
  params: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const value = raw(params, key);
  if (value === null) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new TypeError(`Invalid ${key}: ${value}`);
}
export function readPathMode(params: URLSearchParams): PathMode {
  const value = raw(params, "pathMode");
  if (value === null) return "absoluteSeparated";
  if (value === "relativeMerged" || value === "absoluteSeparated") return value;
  throw new TypeError(`Invalid pathMode: ${value}`);
}
export function readShapeToTrim(params: URLSearchParams): ShapeToTrim {
  const value = raw(params, "shapeToTrim");
  if (value === null) return "square";
  if (
    value === "square" || value === "circle" || value === "squircle" ||
    value === "squircleSlimmed"
  ) {
    return value;
  }
  throw new TypeError(`Invalid shapeToTrim: ${value}`);
}
export function readColorFormat(
  params: URLSearchParams,
): ColorFormat | undefined {
  const value = raw(params, "colorFormat");
  // Absent means "leave the codec's notation alone". A value that is neither
  // format the UI can express is an error, not a silent default.
  if (value === null) return undefined;
  if (value === "rgb" || value === "hex") return value;
  throw new TypeError(`Invalid colorFormat: ${value}`);
}
export function readGroupColors(params: URLSearchParams): string | undefined {
  const value = raw(params, "groupColors");
  if (value === null) return undefined;
  if (!/^[0-9a-fA-F_]+$/.test(value)) {
    throw new TypeError("Invalid groupColors");
  }
  return value;
}
export function readOpacitySteps(
  params: URLSearchParams,
): OpacityStep | undefined {
  const value = raw(params, "opacitySteps");
  if (value === null) return undefined;
  const n = Number(value);
  if (isOpacityStep(n)) return n;
  throw new TypeError(`Invalid opacitySteps: ${value}`);
}
export function readRemoveOpacity(params: URLSearchParams): boolean {
  return bool(params, "removeOpacity", false);
}
export function readRemoveLineBreaks(params: URLSearchParams): boolean {
  return bool(params, "removeLineBreaks", false);
}
export function readRemoveSpaces(params: URLSearchParams): boolean {
  return bool(params, "removeSpaces", true);
}
export function readCropSideMargins(params: URLSearchParams): boolean {
  return bool(params, "cropSideMargins", true);
}
export function readShapeRendering(params: URLSearchParams): string {
  const value = raw(params, "shapeRendering") ?? "crispEdges";
  if (value !== "crispEdges" && value !== "geometricPrecision") {
    throw new TypeError("Invalid shapeRendering");
  }
  return value;
}
/** The only `widthNarrowness` values the UI can emit. */
const WIDTH_NARROWNESS_VALUES: readonly number[] = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  15,
  20,
  25,
  30,
];
/** The only `topHeavyRatio` values the UI can emit. */
const TOP_HEAVY_RATIO_VALUES: readonly number[] = [-3, -2, -1, 0, 1, 2, 3];
const MAX_HEIGHT_PIXEL_SIZE = 4096;

/**
 * Read an integer whose domain is exactly the choices the UI offers. A value
 * outside that set has no rendered counterpart, so it must fail everywhere
 * instead of being rounded or replaced by the default.
 */
function readClosedInteger(
  params: URLSearchParams,
  key: string,
  allowed: readonly number[],
  fallback: number,
): number {
  const value = raw(params, key);
  if (value === null) return fallback;
  if (!/^-?[0-9]+$/.test(value)) {
    throw new RangeError(`Invalid ${key}: ${value}`);
  }
  const n = Number(value);
  if (!allowed.includes(n)) {
    throw new RangeError(`Invalid ${key}: ${value}`);
  }
  return n;
}

export function readHeightPixelSize(params: URLSearchParams): number {
  const value = raw(params, "heightPixelSize");
  if (value === null) return 256;
  // A unit suffix, exponent or sign is not the decimal spelling the UI emits;
  // `Number`/`parseInt` used to salvage some of them into a valid height.
  if (!/^[1-9][0-9]*$/.test(value)) {
    throw new RangeError(`Invalid heightPixelSize: ${value}`);
  }
  const n = Number(value);
  if (!Number.isSafeInteger(n) || n > MAX_HEIGHT_PIXEL_SIZE) {
    throw new RangeError(`Invalid heightPixelSize: ${value}`);
  }
  return n;
}
export function readWidthNarrowness(params: URLSearchParams): number {
  return readClosedInteger(
    params,
    "widthNarrowness",
    WIDTH_NARROWNESS_VALUES,
    10,
  );
}
export function readTopHeavyRatio(params: URLSearchParams): number {
  return readClosedInteger(
    params,
    "topHeavyRatio",
    TOP_HEAVY_RATIO_VALUES,
    1,
  );
}

export type ShapeToTrim = "square" | "circle" | "squircle" | "squircleSlimmed";
export type ShapeRendering = "crispEdges" | "geometricPrecision";
export type PathMode = "absoluteSeparated" | "relativeMerged";
export type ColorFormat = "rgb" | "hex";
export type OpacityStep = 0.04 | 0.1 | 0.2;

function isOpacityStep(value: number): value is OpacityStep {
  return value === 0.04 || value === 0.1 || value === 0.2;
}

/**
 * Everything that changes the SVG text.
 *
 * This is the resolved, typed form of the URL params. `renderArtwork()` takes
 * it so a caller can render from params once and then re-render synchronously
 * after each change, without decoding again.
 */
export interface SvgRenderSettings {
  pathMode: PathMode;
  /** Raw `groupColors` value; `undefined` means "no override". */
  groupColors?: string;
  /** `undefined` means unspecified, so the artwork keeps its own opacities. */
  opacitySteps?: OpacityStep;
  /** `undefined` keeps whatever notation the codec produced. */
  colorFormat?: ColorFormat;
  shapeToTrim: ShapeToTrim;
  widthNarrowness: number;
  topHeavyRatio: number;
  cropSideMargins: boolean;
  shapeRendering: ShapeRendering;
  optimize: {
    removeOpacity: boolean;
    removeLineBreaks: boolean;
    removeSpaces: boolean;
  };
}

/**
 * Settings that change the raster, not the SVG text.
 *
 * Kept separate because the OGP server always encodes PNG while the browser
 * can pick a format, and because `heightPixelSize` cannot change the markup.
 */
export interface RasterSettings {
  heightPixelSize: number;
}

/**
 * The resolved render settings shared by the renderer, the artwork-constraint
 * validator and the canonical-image key. Pass this around instead of raw URL
 * params so every consumer sees the same validated values.
 */
export interface ResolvedRenderSettings {
  svg: SvgRenderSettings;
  raster: RasterSettings;
}

/**
 * Resolve the typed render settings from URL params.
 *
 * `colorFormat` is carried here but only takes effect when a step rebuilds the
 * group elements (`groupColors` or `opacitySteps`): a lone `colorFormat=hex`
 * leaves the SVG untouched, matching what the page has always done.
 */
export function resolveSvgRenderSettings(
  params: URLSearchParams,
): SvgRenderSettings {
  return {
    pathMode: readPathMode(params),
    groupColors: readGroupColors(params),
    opacitySteps: readOpacitySteps(params),
    colorFormat: readColorFormat(params),
    shapeToTrim: readShapeToTrim(params) as ShapeToTrim,
    widthNarrowness: readWidthNarrowness(params),
    topHeavyRatio: readTopHeavyRatio(params),
    cropSideMargins: readCropSideMargins(params),
    shapeRendering: readShapeRendering(params) as ShapeRendering,
    optimize: {
      removeOpacity: readRemoveOpacity(params),
      removeLineBreaks: readRemoveLineBreaks(params),
      removeSpaces: readRemoveSpaces(params),
    },
  };
}

/**
 * Resolve the raster settings from URL params.
 *
 * `heightPixelSize` accepts a decimal integer in `1..4096` only. Spellings like
 * `96px` are rejected rather than salvaged by `Number.parseInt`, so the browser
 * and the OGP endpoint fail the same URL in the same way.
 */
export function resolveRasterSettings(
  params: URLSearchParams,
): RasterSettings {
  return { heightPixelSize: readHeightPixelSize(params) };
}
