import { decodeUrlToSvg } from "@tksh/stln-codec";
import {
  expandGroupColor,
  shortenHexAsHalf,
} from "@tksh/group-colors-param-codec";
import {
  excludeStateKeys,
  MAX_PARAMS_LENGTH,
  normalizeScalarParams,
  readColorFormat,
  readCropSideMargins,
  readGroupColors,
  readHeightPixelSize,
  readOpacitySteps,
  readPathMode,
  readRemoveLineBreaks,
  readRemoveOpacity,
  readRemoveSpaces,
  readShapeRendering,
  readShapeToTrim,
  readTopHeavyRatio,
  readWidthNarrowness,
} from "./settings.ts";
import { numbersIncrementByStep, snapToGrid } from "./opacity-steps.ts";
import { clipShapeElement, squircleSlimmedGeometry } from "./squircles.ts";
import {
  extractViewboxValues,
  replaceShapeRendering,
  replaceViewBox,
} from "./svg-attrs.ts";
import { optimizeSvgText } from "./optimize.ts";

export async function renderParamsToSvg(
  input: string | URLSearchParams,
): Promise<string> {
  const raw = typeof input === "string"
    ? new URLSearchParams(input.startsWith("?") ? input.slice(1) : input)
    : input;
  const params = normalizeScalarParams(raw);
  const artworkParams = excludeStateKeys(params);
  if (
    new TextEncoder().encode(artworkParams.toString()).length >
      MAX_PARAMS_LENGTH
  ) throw new RangeError("URL parameters exceed 8192 bytes");
  const { svg: decodedSvg } = await decodeUrlToSvg(artworkParams, {
    pathMode: readPathMode(params),
  });
  let svg = decodedSvg;
  const colors = readGroupColors(params);
  if (colors) {
    svg = applyGroupColors(
      svg,
      colors,
      readColorFormat(params),
      readRemoveOpacity(params),
    );
  }
  const steps = readOpacitySteps(params);
  if (steps !== undefined) {
    svg = snapToGrid(
      svg,
      steps,
      readColorFormat(params),
      readRemoveOpacity(params),
    );
  }
  svg = applyShape(
    svg,
    readShapeToTrim(params),
    readWidthNarrowness(params),
    readTopHeavyRatio(params),
    readCropSideMargins(params),
  );
  svg = replaceShapeRendering(svg, readShapeRendering(params));
  readHeightPixelSize(params);
  return optimizeSvgText(svg, {
    removeOpacity: readRemoveOpacity(params),
    removeLineBreaks: readRemoveLineBreaks(params),
    removeSpaces: readRemoveSpaces(params),
  });
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
      ? `rgb(${
        [0, 2, 4].map((i) => parseInt(expanded.slice(i, i + 2), 16)).join(" ")
      })`
      : `#${hex}`;
    const opacity = Number(
      (parseInt(expanded.slice(6, 8), 16) / 255).toFixed(2),
    );
    const strokeOpacity = Number(
      (parseInt(expanded.slice(8, 10), 16) / 255).toFixed(2),
    );
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
  shape: string,
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
    /<clipPath id="shape-to-trim">(?:\n?).*(?:\n?).*<\/clipPath>/s,
    clip,
  );
  if (geometry && crop) {
    output = replaceViewBox(
      output,
      `${geometry.left} ${vb.y} ${geometry.right - geometry.left} ${vb.height}`,
    );
  } else output = replaceViewBox(output, `0 0 ${size} ${size}`);
  return output;
}

export { numbersIncrementByStep };
