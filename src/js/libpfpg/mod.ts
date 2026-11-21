/**
 * @tksh/libpfpg — DOM-free SVG renderer for the pfpg subset of Straightlines.
 *
 * This is the package root. The application still imports the individual
 * modules through `libpfpg/*` aliases; when the package is published the app
 * will switch to this single entry point. Until then the barrel is kept in
 * sync with those aliases so the future import rewrite is mechanical.
 */
export {
  convertColorFormat,
  convertColorFormatForArray,
  convertToRgb,
} from "./color-format.ts";
export {
  decodeArtwork,
  type DecodeOptions,
  resetArtworkCache,
} from "./decode.ts";
export {
  buildGroupColorElement,
  getGroupColorsValues,
  getNumberOfGroups,
  getOpacity,
  getStroke,
  getStrokeHex,
  getStrokeOpacity,
  getStrokeRgb,
  GROUP_COLORS_ELEMENT_REGEX,
  regexMatchesOfGroupColors,
  replaceAtIndex,
  restoreOpacity,
} from "./group-colors.ts";
export {
  decodeGroupColorsAsArray,
  getGroupOpacitiesAsMap,
} from "./group-colors-array.ts";
export { getGroupColorsAsJoinedHex } from "./group-colors-encode.ts";
export {
  numbersIncrementByStep,
  resolveDefaultOpacitySteps,
  snapToGrid,
} from "./opacity-steps.ts";
export {
  optimizeSvgText,
  removeLineBreaks,
  removeOpacity,
  removeSpaces,
  tryRemoveSpaces,
} from "./optimize.ts";
export {
  renderArtwork,
  renderArtworkWithoutOpacitySteps,
  type RenderOverrides,
  type RenderParamsOptions,
  renderParamsToSvg,
} from "./render.ts";
export {
  excludeStateKeys,
  MAX_PARAMS_LENGTH,
  normalizeScalarParams,
  readColorFormat,
  readCropSideMargins,
  readGroupColors,
  readHeightPixelSize,
  readLastParam,
  readOpacitySteps,
  readPathMode,
  readRemoveLineBreaks,
  readRemoveOpacity,
  readRemoveSpaces,
  readShapeRendering,
  readShapeToTrim,
  readTopHeavyRatio,
  readWidthNarrowness,
  RENDER_SETTING_DEFAULTS,
  RENDER_SETTING_KEYS,
  resolveRasterSettings,
  resolveSvgRenderSettings,
  SVG_OPTIMIZE_SETTING_DEFAULTS,
  VISUAL_SETTING_DEFAULTS,
} from "./settings.ts";
export type {
  ColorFormat,
  OpacityStep,
  PathMode,
  RasterSettings,
  ResolvedRenderSettings,
  ShapeRendering,
  ShapeToTrim,
  SvgRenderSettings,
} from "./settings.ts";
export {
  applySlimmedViewBox,
  calculateSquircleSlimmedSides,
  clipShapeElement,
  roundToTwoDecimals,
  slimmedViewBox,
  squircleClipPath,
  type SquircleSlimmedGeometry,
  squircleSlimmedGeometry,
  toFixedTrimmed,
} from "./squircles.ts";
export {
  extractViewboxValues,
  replaceShapeRendering,
  replaceViewBox,
  type ViewBox,
} from "./svg-attrs.ts";
