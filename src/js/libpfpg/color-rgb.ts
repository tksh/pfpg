// @tksh/libpfpg: thin compatibility layer over the codec's RGB primitives.
// Every invalid value now throws; the sentinel-string return values are gone.
import {
  opacityToHex,
  parseRgbString,
  type Rgb,
  rgbToHex as codecRgbToHex,
  uint8ToHex as codecUint8ToHex,
} from "@tksh/group-colors-param-codec";

export { normalizedToHex, rgbObjToHex, rgbStrToRgbArr, rgbToHex, uint8ToHex };

function normalizedToHex(num: number): string {
  return opacityToHex(num);
}

function uint8ToHex(num: number): string {
  return codecUint8ToHex(num);
}

function rgbObjToHex(rgb: Rgb): string {
  return codecRgbToHex(rgb);
}

function rgbStrToRgbArr(rgbString: string): number[] {
  const { r, g, b } = parseRgbString(rgbString);
  return [r, g, b];
}

function rgbToHex(rgbString: string): string {
  return `#${codecRgbToHex(parseRgbString(rgbString))}`;
}
