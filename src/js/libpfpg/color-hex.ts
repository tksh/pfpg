// @tksh/libpfpg: thin compatibility layer over the codec's hex primitives.
// Every invalid value now throws; the sentinel-string return values are gone.
import {
  hexToOpacity,
  hexToRgb,
  hexToUint8,
  rgbToString,
} from "@tksh/group-colors-param-codec";

export { hexToRgbArr, hexToUint8, normalizedFromHex, rgbStringify };

function hexToRgbArr(threeOrSixDigitsHex: string): number[] {
  const { r, g, b } = hexToRgb(threeOrSixDigitsHex);
  return [r, g, b];
}

function normalizedFromHex(twoDigitsHex: string): number {
  return hexToOpacity(twoDigitsHex);
}

function rgbStringify(rgbArr: readonly number[]): string {
  if (rgbArr.length !== 3) {
    throw new TypeError(
      `rgbStringify: expected 3 channels, got ${rgbArr.length}`,
    );
  }
  const [r, g, b] = rgbArr;
  if (r === undefined || g === undefined || b === undefined) {
    throw new TypeError("rgbStringify: incomplete channels");
  }
  return rgbToString({ r, g, b });
}
