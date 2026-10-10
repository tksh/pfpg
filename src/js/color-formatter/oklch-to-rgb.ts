import "color-formatter/colorjs-spaces";
import { to, toGamut } from "colorjs.io/fn";

export { oklchToRgb };

// The single documented route from modified OKLCH coordinates back to 8-bit
// sRGB. Gamut mapping is applied here and only here: RGB->OKLCH consumes colors
// that are already inside the sRGB gamut and must not be mapped.
//
// "css" is explicit on purpose: it is the CSS Color 4 algorithm (binary search
// on chroma + local MINDE via deltaEOK). Do not replace it with "clip",
// "oklch.c", or a hand-written approximation.
function oklchToRgb(
  lightness: number,
  chroma: number,
  hue: number,
): { r: number; g: number; b: number } {
  const mapped = toGamut(
    { space: "oklch", coords: [lightness, chroma, hue] },
    { space: "srgb", method: "css" },
  );
  // toGamut() returns a color in the *input* space (oklch), not sRGB, and it
  // mutates the object it is given. Convert explicitly before scaling to bytes.
  const srgb = to(mapped, "srgb");
  const [r, g, b] = srgb.coords;
  return {
    r: Math.round((r ?? 0) * 255),
    g: Math.round((g ?? 0) * 255),
    b: Math.round((b ?? 0) * 255),
  };
}
