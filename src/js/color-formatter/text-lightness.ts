import { convertToRgb } from "libpfpg/color-format";
import { rgbToOklch } from "color-formatter/rgb-to-oklch";

export { getTextLightness };

/**
 * Get text color with calculated lightness for optimal contrast
 * @param {string} colorString - RGB|HEX color value string, e.g.: "rgb(0 0 0)"|"#000000"
 * @return {number} - Lightness value for OKLCH, [0-1]
 */
function getTextLightness(colorString: string): number {
  // convertToRgb throws on a malformed color; no sentinel or NaN ever reaches
  // the perceptual conversion.
  const { r, g, b } = convertToRgb(colorString);
  const oklch = rgbToOklch(r, g, b); // r, g, b UInt8 [0-255]
  // OKLCH lightness is normalized [0, 1], so the midpoint is 0.5 and the offset is
  // half the scale. Rounding to an integer here would collapse the scale to {0, 1}
  // and destroy the contrast decision entirely.
  return oklch.lightness <= 0.5 ? oklch.lightness + 0.5 : oklch.lightness - 0.5;
}
