import { hexShortenAsHalf } from "color-formatter/hex-shorten";
import { normalizedToHex } from "color-formatter/normalized-to-hex";
import { tryDeleteFs } from "color-formatter/try-delete-f";
import { convertColorFormatForArray } from "color-formatter/format-converter";
import { getGroupColorsValues } from "tab-lines/get-colors-from-svg";

export function getGroupColorsAsJoinedHex(inputSvg: string): string {
  // Lines group color attributes (stroke(st), opacity(op), stroke-opacity(so))
  // `stroke` will always be get as HEX format, even if RGB is current selected status.
  const groupColorsValues = getGroupColorsValues(inputSvg);
  const strokeArrayValues = groupColorsValues.get("stroke_array");
  const opacityArrayValues = groupColorsValues.get("opacity_array");
  const strokeOpacityArrayValues = groupColorsValues.get(
    "stroke_opacity_array",
  );
  if (
    !Array.isArray(strokeArrayValues) || !Array.isArray(opacityArrayValues) ||
    !Array.isArray(strokeOpacityArrayValues)
  ) {
    throw new Error("getGroupColorsAsJoinedHex: missing group colors arrays");
  }
  const stArray = convertColorFormatForArray(strokeArrayValues, "hex");
  const opArray = opacityArrayValues;
  const soArray = strokeOpacityArrayValues;
  console.log(stArray); // Type: String | e.g.: Array(5) [ "#97FF6E", "#000000", "#8ACAFF", "#eeeeee", "#ffffff" ]
  console.log(opArray); // Type: String | e.g.: Array(5) [ "0.5", "1", "1", "1", "1" ]
  console.log(soArray); // Type: String | e.g.: Array(5) [ "1", "0.8", "1", "1", "1" ]

  const stHexArray = stArray.map((colorValueStr) =>
    colorValueStr.slice(1).toUpperCase()
  ); // Delete '#'
  const opHexArray = opArray.map((colorValueStr) =>
    normalizedToHex(Number(colorValueStr)).toUpperCase()
  );
  const soHexArray = soArray.map((colorValueStr) =>
    normalizedToHex(Number(colorValueStr)).toUpperCase()
  );
  console.log(stHexArray); // 6 chars hex | e.g.: Array(5) [ "97FF6E", "000000", "8ACAFF", "EEEEEE", "FFFFFF" ]
  console.log(opHexArray); // 2 chars hex | e.g.: Array(5) [ "80", "FF", "FF", "FF", "FF" ]
  console.log(soHexArray); // 2 chars hex | e.g.: Array(5) [ "FF", "CC", "FF", "FF", "FF" ]

  // The formatting hex digits could be possible as 7 (3+2+2) or 10 (6+2+2)
  //   - 'stroke' (3|6) + 'opacity' (2) + 'stroke-opacity' (2)

  // join the values without any delimiters to form: [stroke][opacity][stroke-opacity]
  // String() preserves the legacy coercion for out-of-range index access (undefined => "undefined").
  const mergedHexArray = stHexArray.map((item, index) =>
    item + String(opHexArray[index]) + String(soHexArray[index])
  );

  // Reducing into half length if all hex pairs are duplicated.                  10 => 5
  // And deleting for "FF" (in 5 chars hex) or "FFFF" (in 10 chars hex) at last. 10 => 6, 5 => 3
  const compressedHexArray = mergedHexArray.map((tenCharsHex) =>
    tryDeleteFs(hexShortenAsHalf(tenCharsHex))
  );

  // Join the formatted each groups hex with underscore '_'
  return compressedHexArray.join("_");
}
