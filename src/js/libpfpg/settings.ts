import { BASIC_DATA_KEYS } from "@tksh/stln-codec";

export const MAX_PARAMS_LENGTH = 8192;

/**
 * SVG optimization toggles, in the order the app serializes them.
 *
 * Entry order is part of the contract: `url-state-manager.ts` slices the
 * combined settings list by position, so inserting a key moves those
 * boundaries.
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
function bool(
  params: URLSearchParams,
  key: string,
  fallback: boolean,
): boolean {
  const value = raw(params, key);
  if (value === null) return fallback;
  if (/^true$/i.test(value)) return true;
  if (/^false$/i.test(value)) return false;
  return Boolean(value);
}
function finite(
  params: URLSearchParams,
  key: string,
  fallback: number,
): number {
  const value = raw(params, key);
  if (value === null) return fallback;
  const n = Number(value);
  if (!Number.isFinite(n)) throw new RangeError(`${key} must be finite`);
  return n;
}

export function readPathMode(
  params: URLSearchParams,
): "absoluteSeparated" | "relativeMerged" {
  return raw(params, "pathMode") === "relativeMerged"
    ? "relativeMerged"
    : "absoluteSeparated";
}
export function readShapeToTrim(params: URLSearchParams): string {
  const value = raw(params, "shapeToTrim");
  if (value === null) return "square";
  return ["square", "circle", "squircle", "squircleSlimmed"].includes(value)
    ? value
    : "squircle";
}
export function readColorFormat(params: URLSearchParams): string {
  return raw(params, "colorFormat") ?? "rgb";
}
export function readGroupColors(params: URLSearchParams): string | undefined {
  const value = raw(params, "groupColors");
  if (!value) return undefined;
  if (!/^[0-9a-fA-F_]+$/.test(value)) {
    throw new TypeError("Invalid groupColors");
  }
  return value;
}
export function readOpacitySteps(
  params: URLSearchParams,
): OpacityStep | undefined {
  const value = raw(params, "opacitySteps");
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return isOpacityStep(n) ? n : undefined;
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
export function readHeightPixelSize(params: URLSearchParams): number {
  const value = raw(params, "heightPixelSize");
  const n = value === null ? 256 : Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) {
    throw new RangeError("heightPixelSize must be positive");
  }
  return n;
}
export function readWidthNarrowness(params: URLSearchParams): number {
  return finite(params, "widthNarrowness", 10);
}
export function readTopHeavyRatio(params: URLSearchParams): number {
  return finite(params, "topHeavyRatio", 1);
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
  colorFormat: ColorFormat;
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
    colorFormat: readColorFormat(params) as ColorFormat,
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
 * Uses `Number.parseInt` rather than `Number` so `96px` still yields 96, which
 * is what the page and the OGP endpoint have always accepted.
 */
export function resolveRasterSettings(
  params: URLSearchParams,
): RasterSettings {
  return { heightPixelSize: readHeightPixelSize(params) };
}
