// @tksh/libpfpg: switch a stroke between the HEX and RGB notations the UI
// offers. The conversions themselves come from the codec, so a value this
// module keeps has already been parsed by the same rules everywhere else.
import {
  hexToRgb,
  parseRgbString,
  type Rgb,
  rgbToHex as codecRgbToHex,
  rgbToString,
} from "@tksh/group-colors-param-codec";

export { convertColorFormat, convertColorFormatForArray, convertToRgb };

function detectColorFormat(color: string): "rgb" | "hex" {
  // `startsWith("rgb")` misclassified `RGB(...)` and `rgba(...)`; only a value
  // the codec can parse is the RGB notation.
  try {
    parseRgbString(color);
    return "rgb";
  } catch {
    return "hex";
  }
}

function convertColorFormat(color: string, colorFormat: string): string {
  const currentFormat = detectColorFormat(color);
  if (currentFormat === colorFormat) {
    // Keeping the value still validates it: an unparseable color must not be
    // written into the SVG just because its format matched.
    if (currentFormat === "rgb") parseRgbString(color);
    else hexToRgb(color);
    return color;
  }
  if (colorFormat === "rgb") {
    return rgbToString(hexToRgb(color));
  }
  // A hex target — and, for compatibility with the existing UI contract, any
  // other non-"rgb" spelling — converts an RGB stroke to HEX.
  if (currentFormat === "rgb") {
    return `#${codecRgbToHex(parseRgbString(color))}`;
  }
  hexToRgb(color);
  return color;
}

function convertColorFormatForArray(
  strokeArr: string[],
  colorFormat: string,
): string[] {
  return strokeArr.map((color) => convertColorFormat(color, colorFormat));
}

function convertToRgb(colorString: string): Rgb {
  return detectColorFormat(colorString) === "rgb"
    ? parseRgbString(colorString)
    : hexToRgb(colorString);
}
