import {
  expandHexToSix,
  shortenGroupColor,
} from "@tksh/group-colors-param-codec";
import { normalizedToHex } from "color-formatter/normalized-to-hex";
import { convertColorFormatForArray } from "color-formatter/format-converter";
import { getGroupColorsValues } from "group-colors-svg/group-colors-svg";

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

  const stHexArray = stArray.map((colorValueStr) =>
    expandHexToSix(colorValueStr.slice(1))
  ); // Delete '#'
  const opHexArray = opArray.map((colorValueStr) =>
    normalizedToHex(Number(colorValueStr)).toUpperCase()
  );
  const soHexArray = soArray.map((colorValueStr) =>
    normalizedToHex(Number(colorValueStr)).toUpperCase()
  );

  // Each group is normalized to a 6-digit stroke + 2-digit opacity +
  // 2-digit stroke-opacity, i.e. always 10 hex digits.

  // join the values without any delimiters to form: [stroke][opacity][stroke-opacity]
  // String() preserves the legacy coercion for out-of-range index access (undefined => "undefined").
  const mergedHexArray = stHexArray.map((item, index) =>
    item + String(opHexArray[index]) + String(soHexArray[index])
  );

  // Shorten each group's 10-digit value to its shortest 10|6|5|3|1 form.
  const shortenedHexArray = mergedHexArray.map((tenCharsHex) =>
    shortenGroupColor(tenCharsHex)
  );

  // Join the formatted each groups hex with underscore '_'
  return shortenedHexArray.join("_");
}
