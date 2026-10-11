import { assert, assertAlmostEquals, assertEquals } from "@std/assert";
import { oklchToRgb } from "color-formatter/oklch-to-rgb";
import { rgbToOklch } from "color-formatter/rgb-to-oklch";
import {
  drawOklchOffset,
  MAX_CHROMA,
  randomizeOklch,
} from "color-formatter/randomize-oklch";
import type { Oklch, OklchSpread } from "color-formatter/randomize-oklch";

// A deterministic replacement for Math.random: returns the supplied draws in
// order, and repeats the last one once exhausted, so a test only has to spell
// out the draws it actually cares about. `count` reports how many were read.
function sequenceOf(
  draws: number[],
): { random: () => number; count: () => number } {
  let index = 0;
  return {
    random: () => draws[Math.min(index++, draws.length - 1)] ?? 0,
    count: () => index,
  };
}

// An anchor spanning the interesting parts of the space: near-black, near-white,
// muted, saturated, and a gray.
const ANCHORS: Oklch[] = [
  { lightness: 0.05, chroma: 0.02, hue: 15 },
  { lightness: 0.25, chroma: 0.15, hue: 140 },
  { lightness: 0.5, chroma: 0.1, hue: 250 },
  { lightness: 0.63, chroma: 0.32, hue: 29 },
  { lightness: 0.87, chroma: 0.2, hue: 328 },
  { lightness: 0.98, chroma: 0.05, hue: 100 },
  { lightness: 0.6, chroma: 0, hue: 0 },
];

const SPREADS: OklchSpread[] = [
  { lightness: 0, chroma: 0, hue: 0 },
  { lightness: 0.05, chroma: 0.02, hue: 5 },
  { lightness: 0.3, chroma: 0.15, hue: 60 },
  { lightness: 1, chroma: MAX_CHROMA, hue: 180 },
];

// The default settings: brightness preserved exactly, chroma and hue varying.
const DEFAULT_SPREAD: OklchSpread = { lightness: 0, chroma: 0.1, hue: 30 };

Deno.test("randomizeOklch: a zero spread returns the anchor unchanged", () => {
  // The invariant the whole feature rests on: the headline promise is that a
  // lightness spread of 0 preserves brightness exactly.
  const noSpread: OklchSpread = { lightness: 0, chroma: 0, hue: 0 };

  for (const anchor of ANCHORS) {
    for (const distribution of ["uniform", "triangular"] as const) {
      assertEquals(
        randomizeOklch(
          anchor.lightness,
          anchor.chroma,
          anchor.hue,
          noSpread,
          distribution,
          sequenceOf([0.1, 0.9, 0.42]).random,
        ),
        anchor,
      );
    }
  }
});

Deno.test("randomizeOklch: a pinned channel consumes no draw", () => {
  // Otherwise the draws the remaining channels receive would depend on how many
  // channels happen to be pinned.
  const { random, count } = sequenceOf([0.75]);
  const actual = randomizeOklch(
    0.5,
    0.1,
    200,
    { lightness: 0, chroma: 0.2, hue: 0 },
    "uniform",
    random,
  );
  assertEquals(count(), 1, "only the chroma channel should draw");
  assertEquals(actual.lightness, 0.5);
  // (0.75 - 0.5) * 2 * 0.2 = +0.1
  assertAlmostEquals(actual.chroma, 0.2, 1e-12);
  assertEquals(actual.hue, 200);
});

Deno.test("randomizeOklch: results stay inside the channel ranges", () => {
  for (const anchor of ANCHORS) {
    for (const spread of SPREADS) {
      for (const u of [0, 0.5, 1]) {
        for (const distribution of ["uniform", "triangular"] as const) {
          const actual = randomizeOklch(
            anchor.lightness,
            anchor.chroma,
            anchor.hue,
            spread,
            distribution,
            () => u,
          );
          for (const [name, value] of Object.entries(actual)) {
            assert(
              Number.isFinite(value),
              `${name} is not finite for ${JSON.stringify(anchor)}: ${value}`,
            );
          }
          assert(
            actual.lightness >= 0 && actual.lightness <= 1,
            `lightness ${actual.lightness} escaped [0, 1]`,
          );
          assert(
            actual.chroma >= 0 && actual.chroma <= MAX_CHROMA,
            `chroma ${actual.chroma} escaped [0, ${MAX_CHROMA}]`,
          );
          assert(
            actual.hue >= 0 && actual.hue < 360,
            `hue ${actual.hue} escaped [0, 360)`,
          );
        }
      }
    }
  }
});

Deno.test("randomizeOklch: lightness and chroma clamp, hue wraps", () => {
  const maxSpread: OklchSpread = {
    lightness: 1,
    chroma: MAX_CHROMA,
    hue: 180,
  };

  // Both draws pushed to +1, so every channel moves to its maximum.
  const up = randomizeOklch(0.1, 0.05, 10, maxSpread, "uniform", () => 1);
  assertEquals(up.lightness, 1);
  assertEquals(up.chroma, MAX_CHROMA);
  assertEquals(up.hue, 190);

  // ...and to -1. Hue must wrap past 0 rather than stop there.
  const down = randomizeOklch(0.9, 0.3, 10, maxSpread, "uniform", () => 0);
  assertEquals(down.lightness, 0);
  assertEquals(down.chroma, 0);
  assertEquals(down.hue, 190); // 10 - 180 = -170 => 190

  // A hue of 0 itself must wrap around to the far end, not stay pinned.
  const wrapped = randomizeOklch(
    0.5,
    0.1,
    0,
    { lightness: 0, chroma: 0, hue: 180 },
    "uniform",
    () => 0,
  );
  assertEquals(wrapped.hue, 180);

  // A hue just below the wrap point must reach past 360 and land at the low end.
  const justOver = randomizeOklch(
    0.5,
    0.1,
    350,
    { lightness: 0, chroma: 0, hue: 30 },
    "uniform",
    () => 1,
  );
  assertEquals(justOver.hue, 20);
});

Deno.test("randomizeOklch: a fixed random gives the documented offsets", () => {
  // Pins down that the mapping is exactly the affine offset the plan specifies,
  // rather than something subtly different.
  const actual = randomizeOklch(
    0.6,
    0.1,
    200,
    { lightness: 0.2, chroma: 0.1, hue: 40 },
    "uniform",
    sequenceOf([0.25, 0.75, 0.5]).random,
  );
  // uniform: (u - 0.5) * 2 * spread
  assertAlmostEquals(actual.lightness, 0.5, 1e-12); // 0.25 -> -0.10
  assertAlmostEquals(actual.chroma, 0.15, 1e-12); //  0.75 -> +0.05
  assertAlmostEquals(actual.hue, 200, 1e-12); //       0.5  ->   0
});

Deno.test("randomizeOklch: triangular draws two values per channel", () => {
  const actual = randomizeOklch(
    0.6,
    0.1,
    200,
    { lightness: 0.2, chroma: 0.1, hue: 40 },
    "triangular",
    sequenceOf([0.25, 0.25, 1, 0.5, 0, 0]).random,
  );
  // triangular: (u1 + u2 - 1) * spread
  assertAlmostEquals(actual.lightness, 0.5, 1e-12); // (0.25+0.25-1)*0.2
  assertAlmostEquals(actual.chroma, 0.15, 1e-12); //  (1.0 +0.5 -1)*0.1
  assertAlmostEquals(actual.hue, 160, 1e-12); //     (0.0 +0.0 -1)*40
});

Deno.test("drawOklchOffset: the two distributions match the plan formulas", () => {
  assertAlmostEquals(drawOklchOffset(0.4, "uniform", () => 0), -0.4, 1e-12);
  assertAlmostEquals(drawOklchOffset(0.4, "uniform", () => 0.5), 0, 1e-12);
  assertAlmostEquals(drawOklchOffset(0.4, "uniform", () => 1), 0.4, 1e-12);

  // The extreme draws put triangular at the ends of its support too.
  assertAlmostEquals(
    drawOklchOffset(0.4, "triangular", sequenceOf([0, 0]).random),
    -0.4,
    1e-12,
  );
  assertAlmostEquals(
    drawOklchOffset(0.4, "triangular", sequenceOf([1, 1]).random),
    0.4,
    1e-12,
  );

  // A spread of 0 is the identity for both, and consumes no draw.
  for (const distribution of ["uniform", "triangular"] as const) {
    const { random, count } = sequenceOf([0.5]);
    assertEquals(drawOklchOffset(0, distribution, random), 0);
    assertEquals(count(), 0);
  }
});

Deno.test("drawOklchOffset: both distributions stay within the spread", () => {
  const draws = Array.from({ length: 101 }, (_, i) => i / 100);
  for (const spread of [0.01, 0.1, 0.4, 180]) {
    for (const u of draws) {
      for (const v of draws) {
        for (
          const offset of [
            drawOklchOffset(spread, "uniform", () => u),
            drawOklchOffset(spread, "triangular", sequenceOf([u, v]).random),
          ]
        ) {
          assert(
            offset >= -spread && offset <= spread,
            `offset ${offset} escaped +/-${spread}`,
          );
        }
      }
    }
  }
});

Deno.test("drawOklchOffset: triangular peaks at the original value", () => {
  // The triangular mode sits on the original coordinate and falls off toward
  // the ends of the range, where uniform is flat. This is the difference the
  // distribution dropdown actually buys the user.
  const spread = 40;
  const draws = Array.from({ length: 200 }, (_, i) => (i + 0.5) / 200);
  const shareWithin = (offsets: number[], fraction: number) =>
    offsets.filter((offset) => Math.abs(offset) <= spread * fraction).length /
    offsets.length;

  const uniformOffsets = draws.map((u) =>
    drawOklchOffset(spread, "uniform", () => u)
  );
  const triangularOffsets = draws.flatMap((u) =>
    draws.map((v) =>
      drawOklchOffset(spread, "triangular", sequenceOf([u, v]).random)
    )
  );

  // Near the peak, triangular carries about twice uniform's density...
  assertAlmostEquals(shareWithin(uniformOffsets, 0.05), 0.05, 0.01);
  assertAlmostEquals(shareWithin(triangularOffsets, 0.05), 0.0975, 0.01);

  // ...while three quarters of uniform's mass already sits within the outer
  // quarter of the range, where triangular has barely reached.
  assertAlmostEquals(shareWithin(uniformOffsets, 0.75), 0.75, 0.01);
  assertAlmostEquals(shareWithin(triangularOffsets, 0.75), 0.9375, 0.01);
});

Deno.test("randomizeOklch: a gray stays gray under hue randomization alone", () => {
  // Hue is meaningless when chroma is zero, so the hue slider cannot move a
  // gray on its own. This is why the default chroma spread is non-zero.
  for (let v = 0; v <= 255; v += 15) {
    const anchor = rgbToOklch(v, v, v);
    const actual = randomizeOklch(
      anchor.lightness,
      anchor.chroma,
      anchor.hue,
      { lightness: 0, chroma: 0, hue: 180 },
      "triangular",
      () => 0.9,
    );
    assertEquals(actual.chroma, 0);
    const rgb = oklchToRgb(actual.lightness, actual.chroma, actual.hue);
    assertEquals(rgb.r, rgb.g, `gray ${v} came back with a red skew`);
    assertEquals(rgb.g, rgb.b, `gray ${v} came back with a green skew`);
  }
});

Deno.test("randomizeOklch: randomized colors round-trip to sRGB bytes", () => {
  // The gamut-mapping path is what this feature actually exercises: a wide
  // chroma spread routinely produces colors outside sRGB.
  for (const anchor of ANCHORS) {
    for (const spread of SPREADS) {
      for (const u of [0.05, 0.3, 0.66, 0.95]) {
        for (const distribution of ["uniform", "triangular"] as const) {
          const actual = randomizeOklch(
            anchor.lightness,
            anchor.chroma,
            anchor.hue,
            spread,
            distribution,
            () => u,
          );
          const rgb = oklchToRgb(
            actual.lightness,
            actual.chroma,
            actual.hue,
          );
          for (const [name, value] of Object.entries(rgb)) {
            assert(
              Number.isInteger(value) && value >= 0 && value <= 255,
              `channel ${name} is ${value} for ${JSON.stringify(actual)}`,
            );
          }
        }
      }
    }
  }
});

Deno.test("randomizeOklch: the default spread preserves lightness exactly", () => {
  const anchors = [
    [0, 0, 0],
    [255, 255, 255],
    [128, 128, 128],
    [255, 0, 0],
    [78, 141, 9],
  ];

  for (const [r, g, b] of anchors) {
    const before = rgbToOklch(r ?? 0, g ?? 0, b ?? 0);
    for (const u of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
      const actual = randomizeOklch(
        before.lightness,
        before.chroma,
        before.hue,
        DEFAULT_SPREAD,
        "uniform",
        () => u,
      );
      assertAlmostEquals(actual.lightness, before.lightness, 1e-12);
    }
  }
});

Deno.test("randomizeOklch: the relative lightness order of groups is kept", () => {
  // Each group is anchored to its own color, so a dark group stays darker than
  // a light one however far the chroma and hue spreads reach.
  const anchors = [
    rgbToOklch(20, 20, 20).lightness,
    rgbToOklch(128, 128, 128).lightness,
    rgbToOklch(240, 240, 240).lightness,
  ];

  for (const u of [0, 0.25, 0.5, 0.75, 1]) {
    const actual = anchors.map((lightness) =>
      randomizeOklch(
        lightness,
        0,
        0,
        DEFAULT_SPREAD,
        "uniform",
        () => u,
      ).lightness
    );
    const [dark, mid, light] = actual;
    assert(dark !== undefined && mid !== undefined && light !== undefined);
    assert(dark < mid, `dark ${dark} should stay under mid ${mid}`);
    assert(mid < light, `mid ${mid} should stay under light ${light}`);
  }
});
