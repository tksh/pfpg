import "color-formatter/colorjs-spaces";
import { to } from "colorjs.io/fn";

export { rgbToOklch };

// 8-bit sRGB channels (0-255) in, OKLCH out: normalized lightness [0, 1],
// OKLCH chroma (not CIE LCH chroma), hue in [0, 360).
//
// Color.js reports a null hue for achromatic colors, where hue is meaningless
// (see src/spaces/lch.js in Color.js: isAchromatic -> h = null). The app never
// reads hue and the CSS string it emits uses 0 0 for chroma/hue anyway, so the
// null is normalized to 0 here rather than leaked into a number-typed field.
function rgbToOklch(
  r: number,
  g: number,
  b: number,
): { lightness: number; chroma: number; hue: number } {
  const oklch = to(
    { space: "srgb", coords: [r / 255, g / 255, b / 255] },
    "oklch",
  );
  // coords is typed (number | null)[]; `?? 0` (not a destructuring default, which
  // only replaces undefined) keeps this assignable to the declared return type.
  const [lightness, chroma, hue] = oklch.coords;
  return {
    lightness: lightness ?? 0,
    chroma: chroma ?? 0,
    hue: hue ?? 0,
  };
}
