import { expandGroupColor } from "@tksh/group-colors-param-codec";
import {
  type DecodedGroup,
  type DecodedGroupColors,
  type DecodedParams,
  decodeGroupColors,
} from "@tksh/stln-codec";
import { murmurHash3_x64_128 } from "@timepp/murmurhash";
import { type SettingValue, VISUAL_CONFIG_DEFAULTS } from "constants";

export {
  buildCanonicalImageInput,
  CANONICAL_SETTING_KEYS,
  type CanonicalGroup,
  type CanonicalImageInput,
  type CanonicalSettings,
  hashCanonicalImageInput,
  serializeCanonicalImageInput,
  SHARED_IMAGE_KEY_VERSION,
};

/**
 * Version of the shared-image key format.
 *
 * Bump this whenever the canonical input below changes, or whenever a change
 * to the SVG generation or the rasterizer changes the rendered pixels. Keys
 * are not a durable content address: they are practical Cloudinary asset
 * names, and MurmurHash3 offers no collision resistance.
 */
const SHARED_IMAGE_KEY_VERSION = "pfpg-ogp-v1";

// Canonical projection of everything that decides the rendered pixels.
//
// Only values that can change those pixels belong here. Encoding choices
// (encoding method, compression, relative coordinates, derived line indices)
// are duplicate representations of the same drawing and are left out, as are
// the basic-data tags (`title`/`desc`/`metadata`), `bits`, `opacitySteps`,
// `pathMode`, `colorFormat` and every UI state. `pathMode` and `colorFormat`
// change the SVG markup but not the pixels (verified for both generated
// artwork variants), and the file format the pixels are encoded into is not
// part of the drawing either.
//
// The shape is a plain tuple/array tree of finite numbers, strings and
// booleans: `JSON.stringify` order is therefore the declaration order, and no
// `undefined`, `null` or `Map` can leak into the hashed text.

/** `[strokeR, strokeG, strokeB, opacity, strokeOpacity]`, all 0-255. */
type CanonicalStyle = [number, number, number, number, number];

/** One line as `[x1, y1, x2, y2]` in absolute canvas coordinates. */
type CanonicalLine = [number, number, number, number];

interface CanonicalGroup {
  /** Effective style after the `groupColors` overrides are applied. */
  style: CanonicalStyle;
  /** Stroke width per line, expanded from the width/count runs. */
  widths: number[];
  /** One entry per line, in draw order. */
  lines: CanonicalLine[];
}

/** Canvas size, image-affecting settings, then the line groups. */
interface CanonicalImageInput {
  /** `[width, height]` of the viewBox the artwork was drawn on. */
  canvas: [number, number];
  /** Image-affecting settings, in the fixed schema order below. */
  settings: CanonicalSettings;
  /** One entry per line group, in draw order. */
  groups: CanonicalGroup[];
}

// The image-affecting settings, in the canonical serialization order.
// These are the `VISUAL_CONFIG_DEFAULTS` keys that change the pixels; the
// tests assert that this list keeps that map's documented relative order.
const CANONICAL_SETTING_KEYS = [
  "shapeToTrim",
  "widthNarrowness",
  "topHeavyRatio",
  "cropSideMargins",
  "shapeRendering",
  "heightPixelSize",
] as const;

type CanonicalSettings = [
  shapeToTrim: string,
  widthNarrowness: number,
  topHeavyRatio: number,
  cropSideMargins: boolean,
  shapeRendering: string,
  heightPixelSize: number,
];

function defaultFor(key: string): SettingValue {
  return VISUAL_CONFIG_DEFAULTS.get(key);
}

// Read one setting the way the app reads it, so the canonical value is the
// value that reaches the renderer. A value the app cannot use is an error
// rather than a silent fallback to the default: a fallback would hand the
// image a key that belongs to a different drawing.
// An unrecognized `shapeToTrim` falls through to the squircle clip path, so
// it is canonicalized to `squircle` instead of producing a key that no other
// URL could share.
function readShapeToTrim(raw: SettingValue): string {
  const value = raw === undefined ? defaultFor("shapeToTrim") : raw;
  if (value === "squircleSlimmed") return "squircleSlimmed";
  if (value === "square" || value === "circle") return value;
  return "squircle";
}

function readShapeRendering(raw: SettingValue): string {
  const value = raw === undefined ? defaultFor("shapeRendering") : raw;
  if (typeof value !== "string") {
    throw new Error(
      "buildCanonicalImageInput: shapeRendering must be a string",
    );
  }
  return value;
}

function readFiniteNumber(
  key: string,
  raw: SettingValue,
  toNumber: (value: string | number | boolean) => number,
): number {
  const value = raw === undefined ? defaultFor(key) : raw;
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error(`buildCanonicalImageInput: ${key} must be a number`);
  }
  const parsed = toNumber(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(
      `buildCanonicalImageInput: ${key} is not a finite number: ${
        JSON.stringify(value)
      }`,
    );
  }
  return parsed;
}

// The app reads the boolean settings through the same case-insensitive
// "true"/"false" rule as the state manager, and treats anything else as off.
function readCropSideMargins(raw: SettingValue): boolean {
  const value = raw === undefined ? defaultFor("cropSideMargins") : raw;
  return String(value).toLowerCase() === "true";
}

function readSettings(params: URLSearchParams): CanonicalSettings {
  return [
    readShapeToTrim(params.get("shapeToTrim") ?? undefined),
    readFiniteNumber(
      "widthNarrowness",
      params.get("widthNarrowness") ?? undefined,
      Number,
    ),
    readFiniteNumber(
      "topHeavyRatio",
      params.get("topHeavyRatio") ?? undefined,
      Number,
    ),
    readCropSideMargins(params.get("cropSideMargins") ?? undefined),
    readShapeRendering(params.get("shapeRendering") ?? undefined),
    readFiniteNumber(
      "heightPixelSize",
      params.get("heightPixelSize") ?? undefined,
      (value) => parseInt(String(value), 10),
    ),
  ];
}

// The `groupColors` state, expanded to the same shape the codec decodes the
// artwork's own group keys into. Overrides are positional: they replace the
// n-th group, and groups the state does not mention keep their own color.
function readColorOverrides(
  groupColors: string | null,
): Map<number, DecodedGroupColors> {
  const overrides = new Map<number, DecodedGroupColors>();
  if (groupColors === null || groupColors === "") return overrides;
  groupColors.split("_").forEach((shortHex, index) => {
    overrides.set(index, decodeGroupColors(expandGroupColor(shortHex)));
  });
  return overrides;
}

function styleOf(colors: DecodedGroupColors): CanonicalStyle {
  const [r, g, b] = colors.gStrokeRgbArr;
  if (r === undefined || g === undefined || b === undefined) {
    throw new Error("buildCanonicalImageInput: incomplete stroke color");
  }
  return [
    r,
    g,
    b,
    colors.gOpacityUint8,
    colors.gStrokeOpacityUint8,
  ];
}

// Expand the `[width][count]…` runs into one width per line, so that a
// different run encoding of the same lines canonicalizes identically.
function widthsOf(group: DecodedGroup): number[] {
  const { widths, counts } = group.widthsAndCounts;
  const expanded: number[] = [];
  for (let run = 0; run < widths.length; run++) {
    const width = widths[run];
    const count = counts[run];
    if (width === undefined || count === undefined) {
      throw new Error(
        `buildCanonicalImageInput: bad width run ${run} in group ${group.encodingMethodFlag}`,
      );
    }
    for (let line = 0; line < count; line++) expanded.push(width);
  }
  return expanded;
}

function linesOf(group: DecodedGroup): CanonicalLine[] {
  const { x1, y1, x2, y2 } = group.absDvalsObj;
  const lines: CanonicalLine[] = [];
  for (let line = 0; line < x1.length; line++) {
    const lineX1 = x1[line];
    const lineY1 = y1[line];
    const lineX2 = x2[line];
    const lineY2 = y2[line];
    if (
      lineX1 === undefined || lineY1 === undefined || lineX2 === undefined ||
      lineY2 === undefined
    ) {
      throw new Error(
        `buildCanonicalImageInput: incomplete line ${line}`,
      );
    }
    lines.push([lineX1, lineY1, lineX2, lineY2]);
  }
  return lines;
}

function groupOf(
  group: DecodedGroup,
  override: DecodedGroupColors | undefined,
): CanonicalGroup {
  const style = styleOf(override ?? group.groupColors);
  const widths = widthsOf(group);
  const lines = linesOf(group);
  if (widths.length !== lines.length) {
    throw new Error(
      `buildCanonicalImageInput: ${widths.length} widths for ${lines.length} lines`,
    );
  }
  return { style, widths, lines };
}

/**
 * Project a decoded artwork and its URL settings onto the canonical input.
 *
 * `params` are the full URL params (state keys included); `decoded` must be
 * the codec's decode of the same URL with the state keys filtered out, so
 * that both sides describe the same drawing.
 */
function buildCanonicalImageInput(
  params: URLSearchParams,
  decoded: DecodedParams,
): CanonicalImageInput {
  const overrides = readColorOverrides(params.get("groupColors"));

  // Map iteration order is the group order of the URL, which is the draw
  // order. It is kept as-is: reordering groups changes the drawing.
  const groups: CanonicalGroup[] = [];
  let index = 0;
  for (const group of decoded.linesData.values()) {
    groups.push(groupOf(group, overrides.get(index)));
    index++;
  }
  if (groups.length === 0) {
    throw new Error("buildCanonicalImageInput: no line groups");
  }

  return {
    canvas: [decoded.sizeData.width, decoded.sizeData.height],
    settings: readSettings(params),
    groups,
  };
}

function serializeCanonicalImageInput(input: CanonicalImageInput): string {
  return JSON.stringify([SHARED_IMAGE_KEY_VERSION, input]);
}

/** The 32-character hexadecimal key for a canonical input. */
function hashCanonicalImageInput(input: CanonicalImageInput): string {
  return murmurHash3_x64_128(serializeCanonicalImageInput(input))
    .toString(16)
    .padStart(32, "0");
}
