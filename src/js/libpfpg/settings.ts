import { BASIC_DATA_KEYS } from "@tksh/stln-codec";

export const MAX_PARAMS_LENGTH = 8192;
const stateDefaults = new Map<string, string | boolean | number>([
  ["removeOpacity", false],
  ["removeLineBreaks", false],
  ["removeSpaces", true],
  ["groupColors", ""],
  ["pathMode", "absoluteSeparated"],
  ["opacitySteps", ""],
  ["colorFormat", "rgb"],
  ["shapeToTrim", "square"],
  ["widthNarrowness", 10],
  ["topHeavyRatio", 1],
  ["cropSideMargins", true],
  ["shapeRendering", "crispEdges"],
  ["heightPixelSize", 256],
  ["themeColor", ""],
  ["buttonAction", "download"],
  ["viewScaling", "fit"],
  ["checkerboardBg", true],
  ["textWrapping", false],
  ["imageFormat", "png"],
  ["lang", ""],
]);

export function normalizeScalarParams(
  params: URLSearchParams,
): URLSearchParams {
  const keys = new Set([...stateDefaults.keys(), ...BASIC_DATA_KEYS]);
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

export function excludeStateKeys(params: URLSearchParams): URLSearchParams {
  const excluded = new Set(stateDefaults.keys());
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
export function readOpacitySteps(params: URLSearchParams): number | undefined {
  const value = raw(params, "opacitySteps");
  if (value === null || value === "") return undefined;
  const n = Number(value);
  return [0.04, 0.1, 0.2].includes(n) ? n : undefined;
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
