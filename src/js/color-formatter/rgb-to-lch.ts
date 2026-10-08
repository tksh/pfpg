export { rgbToLch };

function rgbToXyz(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;

  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;

  return [x, y, z];
}

function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  const ε = 216 / 24389;
  const κ = 24389 / 27;

  const fx = x > ε ? Math.cbrt(x) : (κ * x + 16) / 116;
  const fy = y > ε ? Math.cbrt(y) : (κ * y + 16) / 116;
  const fz = z > ε ? Math.cbrt(z) : (κ * z + 16) / 116;

  const l = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [l, a, b]; // lightness, a and b axes
}

function labToLch(l: number, a: number, b: number): [number, number, number] {
  const c = Math.sqrt(a * a + b * b);
  const hRadians = Math.atan2(b, a);
  let hDegrees = hRadians * 360 / (2 * Math.PI);
  if (hDegrees < 0) {
    hDegrees += 360;
  }
  return [l, c, hDegrees];
}

function rgbToLch(
  r: number,
  g: number,
  b: number,
): { lightness: number; chroma: number; hue: number } {
  const [x, y, z] = rgbToXyz(r, g, b);
  const [l, a, bLab] = xyzToLab(x / 0.96422, y, z / 0.82521); // D65のXYZ値で正規化
  const [lightness, chroma, hue] = labToLch(l, a, bLab);
  return { lightness, chroma, hue };
}
