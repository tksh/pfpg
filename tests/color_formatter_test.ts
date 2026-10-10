import { assert, assertEquals } from "@std/assert";
import { oklchToRgb } from "color-formatter/oklch-to-rgb";
import { rgbToOklch } from "color-formatter/rgb-to-oklch";
import { getTextLightness } from "color-formatter/text-lightness";

// Reference values were produced by colorjs.io 0.7.1 and independently
// reproduced from Björn Ottosson's published OKLab formulas; the two agree to
// ~1e-6, so these fixtures are cross-validated rather than copied from the
// implementation under test. Tolerances: 1e-6 for L and C, 1e-4 for H.

// Loose enough for floating-point color math, tight enough to catch a wrong
// space or a scaled coordinate.
const TOLERANCE_L = 1e-6;
const TOLERANCE_C = 1e-6;
const TOLERANCE_H = 1e-4;

// Every 8-bit input produces lightness within [0, 1]; Color.js returns
// 1.0000000000000002 for white rather than exactly 1.
const MAX_LIGHTNESS = 1.000000000000001;

Deno.test("rgbToOklch: achromatic inputs report zero chroma and a zero hue", () => {
  assertEquals(rgbToOklch(0, 0, 0), { lightness: 0, chroma: 0, hue: 0 });

  // Color.js returns a null hue for achromatic colors; the wrapper normalizes
  // it to 0, which is the contract the rest of the app relies on.
  assertEquals(rgbToOklch(255, 255, 255), {
    lightness: 1.0000000000000002,
    chroma: 0,
    hue: 0,
  });
  assertEquals(rgbToOklch(128, 128, 128), {
    lightness: 0.5998708056221469,
    chroma: 0,
    hue: 0,
  });
  assertEquals(rgbToOklch(60, 60, 60), {
    lightness: 0.356179254678186,
    chroma: 0,
    hue: 0,
  });
  assertEquals(rgbToOklch(200, 200, 200), {
    lightness: 0.8327938177446831,
    chroma: 0,
    hue: 0,
  });
});

Deno.test("rgbToOklch: chromatic inputs match the reference OKLCH values", () => {
  const cases = [
    {
      rgb: [255, 0, 0],
      l: 0.6279553639214311,
      c: 0.2576833038053606,
      h: 29.233880279627897,
    },
    {
      rgb: [0, 255, 0],
      l: 0.8664396175234368,
      c: 0.2948272245426958,
      h: 142.4953450414439,
    },
    {
      rgb: [0, 0, 255],
      l: 0.45201371817442365,
      c: 0.3132143886344849,
      h: 264.0520226163699,
    },
    {
      rgb: [0, 255, 255],
      l: 0.9053992360133608,
      c: 0.1545500236044062,
      h: 194.7689598979818,
    },
    {
      rgb: [255, 0, 255],
      l: 0.7016738591017413,
      c: 0.32249098770537216,
      h: 328.36341517499017,
    },
    {
      rgb: [255, 255, 0],
      l: 0.9679827267927991,
      c: 0.2110058737497979,
      h: 109.76923612816614,
    },
    {
      rgb: [78, 141, 9],
      l: 0.5781622267000762,
      c: 0.162602809494688,
      h: 133.9439992552758,
    },
    { rgb: [100, 100, 100], l: 0.5032293384241285, c: 0, h: 0 },
  ];

  for (const { rgb, l, c, h } of cases) {
    const actual = rgbToOklch(rgb[0] ?? 0, rgb[1] ?? 0, rgb[2] ?? 0);
    assert(
      Math.abs(actual.lightness - l) < TOLERANCE_L,
      `lightness for rgb(${rgb}) was ${actual.lightness}, expected ~${l}`,
    );
    assert(
      Math.abs(actual.chroma - c) < TOLERANCE_C,
      `chroma for rgb(${rgb}) was ${actual.chroma}, expected ~${c}`,
    );
    assert(
      Math.abs(actual.hue - h) < TOLERANCE_H,
      `hue for rgb(${rgb}) was ${actual.hue}, expected ~${h}`,
    );
  }
});

Deno.test("rgbToOklch: every byte-range input stays in the OKLCH ranges", () => {
  for (let v = 0; v <= 255; v++) {
    const gray = rgbToOklch(v, v, v);
    assert(
      gray.lightness >= 0 && gray.lightness <= MAX_LIGHTNESS,
      `gray ${v} lightness out of range: ${gray.lightness}`,
    );
    // The whole gray ramp is achromatic.
    assertEquals(gray.chroma, 0, `gray ${v} chroma should be exactly 0`);
    assertEquals(gray.hue, 0, `gray ${v} hue should be exactly 0`);
  }

  const chromatic = [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255],
    [78, 141, 9],
    [255, 255, 255],
    [0, 0, 0],
  ];
  for (const [r, g, b] of chromatic) {
    const actual = rgbToOklch(r ?? 0, g ?? 0, b ?? 0);
    assert(
      actual.lightness >= 0 && actual.lightness <= MAX_LIGHTNESS,
      `rgb(${r},${g},${b}) lightness out of range: ${actual.lightness}`,
    );
    assert(
      actual.hue >= 0 && actual.hue < 360,
      `rgb(${r},${g},${b}) hue out of [0, 360): ${actual.hue}`,
    );
    if (r !== g || g !== b) {
      assert(
        actual.chroma > 0,
        `rgb(${r},${g},${b}) should have positive chroma, got ${actual.chroma}`,
      );
    }
  }
});

Deno.test("rgbToOklch: legacy sentinel input degrades without throwing", () => {
  // convertToRgbArr returns "Invalid hex string" for bad input, and
  // getTextLightness coerces it with Number(). The old implementation let the
  // NaN flow through; keep that behavior rather than throwing or clamping.
  const sentinel = Number("Invalid hex string");
  const actual = rgbToOklch(sentinel, sentinel, sentinel);
  assert(Number.isNaN(actual.lightness), "NaN lightness should flow through");
});

Deno.test("oklchToRgb: colors already inside sRGB are returned unchanged", () => {
  // In-gamut colors pass through the CSS mapping untouched.
  assertEquals(oklchToRgb(0.5, 0, 0), { r: 99, g: 99, b: 99 });
  assertEquals(
    oklchToRgb(0.6279570211360938, 0.25768082360338185, 29.230195953267355),
    { r: 255, g: 0, b: 0 },
  );
  assertEquals(oklchToRgb(0.578162223, 0.1626028094, 133.943992818), {
    r: 78,
    g: 141,
    b: 9,
  });
});

Deno.test("oklchToRgb: out-of-gamut colors are mapped by the CSS algorithm", () => {
  // These are the reference outputs of the CSS Color 4 binary search. The first
  // one is the regression guard for method "css": clipping the same input would
  // give (0, 223, 0) instead of (0, 194, 72).
  assertEquals(oklchToRgb(0.7, 0.5, 150), { r: 0, g: 194, b: 72 });
  assertEquals(oklchToRgb(0.75, 0.37, 140), { r: 28, g: 211, b: 0 });
  assertEquals(oklchToRgb(0.7, 0.4, 30), { r: 255, g: 88, b: 67 });
});

Deno.test("oklchToRgb: boundary lightness maps to media white and black", () => {
  // The CSS algorithm returns white when L >= 1 and black when L <= 0,
  // regardless of the chroma handed in.
  assertEquals(oklchToRgb(1.0, 0.3, 200), { r: 255, g: 255, b: 255 });
  assertEquals(oklchToRgb(0.0, 0.3, 200), { r: 0, g: 0, b: 0 });
});

Deno.test("oklchToRgb: neutral colors ignore hue", () => {
  assertEquals(oklchToRgb(0.5, 0, 0), { r: 99, g: 99, b: 99 });
  assertEquals(oklchToRgb(0.5, 0, 90), { r: 99, g: 99, b: 99 });
  assertEquals(oklchToRgb(0.5, 0, 270), { r: 99, g: 99, b: 99 });
});

Deno.test("oklchToRgb: valid inputs always give finite bytes in 0-255", () => {
  for (const l of [0, 0.25, 0.5, 0.75, 1]) {
    for (const c of [0, 0.1, 0.3, 0.45]) {
      for (const h of [0, 90, 180, 270]) {
        const actual = oklchToRgb(l, c, h);
        for (const [name, value] of Object.entries(actual)) {
          assert(
            Number.isFinite(value),
            `channel ${name} for oklch(${l},${c},${h}) is not finite: ${value}`,
          );
          assert(
            Number.isInteger(value),
            `channel ${name} for oklch(${l},${c},${h}) is not an integer: ${value}`,
          );
          assert(
            value >= 0 && value <= 255,
            `channel ${name} for oklch(${l},${c},${h}) outside 0-255: ${value}`,
          );
        }
      }
    }
  }
});

Deno.test("getTextLightness: the OKLCH scale is split at its midpoint", () => {
  // White and black sit at opposite ends of the scale and both land on the
  // 0.5 midpoint, maximally far from their own background.
  assert(Math.abs(getTextLightness("#FFFFFF") - 0.5) < TOLERANCE_L);
  assert(Math.abs(getTextLightness("#000000") - 0.5) < TOLERANCE_L);
  assert(Math.abs(getTextLightness("rgb(255 255 255)") - 0.5) < TOLERANCE_L);

  assert(
    Math.abs(getTextLightness("#808080") - 0.0998708056221469) < TOLERANCE_L,
    "mid gray should get text half the scale darker",
  );
  assert(
    Math.abs(getTextLightness("rgb(0 0 255)") - 0.95201371817442365) <
      TOLERANCE_L,
    "blue should get text half the scale lighter",
  );

  // This is the one background whose decision flips against the old CIE
  // threshold, and the flip is the intended outcome, not a regression.
  assert(
    Math.abs(getTextLightness("#008000") - 0.019752) < TOLERANCE_L,
    "dark green should now get dark text (it used to get light text)",
  );
  assert(
    Math.abs(getTextLightness("#00FF00") - 0.366440) < TOLERANCE_L,
    "bright green keeps its direction, only the exact gray shifts",
  );
});

Deno.test("getTextLightness: text and background stay half the scale apart", () => {
  const backgrounds = [
    "#FFFFFF",
    "#000000",
    "#808080",
    "#C8C8C8",
    "#3C3C3C",
    "#FF0000",
    "#008000",
    "#0000FF",
    "#FFFF00",
    "#4E8D09",
    "#636363",
    "#646464",
  ];

  for (const color of backgrounds) {
    const [r, g, b] = [
      parseInt(color.slice(1, 3), 16),
      parseInt(color.slice(3, 5), 16),
      parseInt(color.slice(5, 7), 16),
    ];
    const backgroundLightness = rgbToOklch(r ?? 0, g ?? 0, b ?? 0).lightness;
    const textLightness = getTextLightness(color);

    assert(
      Math.abs(Math.abs(textLightness - backgroundLightness) - 0.5) <
        TOLERANCE_L,
      `text for ${color} is not ~0.5 from its background (${textLightness} vs ${backgroundLightness})`,
    );
    assert(
      textLightness >= 0 && textLightness <= 1,
      `text for ${color} outside [0, 1]: ${textLightness}`,
    );
  }
});

Deno.test("getTextLightness: the decision flips at the documented gray", () => {
  // The OKLCH midpoint sits between gray 99 and gray 100. Adjacent swatches get
  // opposite decisions, which is what the browser check verifies visually.
  const lightText = getTextLightness("#636363");
  const darkText = getTextLightness("#646464");

  assert(lightText > 0.5, "gray 99 should get light text");
  assert(darkText < 0.5, "gray 100 should get dark text");

  // And the two outer swatches bracket the boundary from either side.
  assert(getTextLightness("#555555") > 0.5, "gray 85 should get light text");
  assert(getTextLightness("#808080") < 0.5, "gray 128 should get dark text");
});

Deno.test("getTextLightness: legacy sentinel input degrades without throwing", () => {
  // rgb() and hex() both produce a "Invalid ..." sentinel string for malformed
  // values; Number() turns it into NaN and the old code emitted an invalid
  // color that the CSS parser ignored.
  const actual = getTextLightness("#ZZZZZZ");
  assert(Number.isNaN(actual), "NaN lightness should flow through");
});
