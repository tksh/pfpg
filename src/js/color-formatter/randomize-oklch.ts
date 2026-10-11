export { drawOklchOffset, MAX_CHROMA, randomizeOklch };

export type Oklch = { lightness: number; chroma: number; hue: number };
export type OklchSpread = {
  lightness: number;
  chroma: number;
  hue: number;
};
export type OffsetDistribution = "uniform" | "triangular";

// Injected rather than reached for via `Math.random`, so the whole mapping is
// testable without flakiness: production passes Math.random, tests pass a
// deterministic function.
export type RandomSource = () => number;

// The OKLCH reference chroma range. sRGB has no hard chroma bound — the most
// chromatic sRGB color measures ~0.32 — so 0.4 is the largest chroma value that
// still means something. Larger draws are harmless: oklchToRgb() gamut-maps
// them back down on the way out.
const MAX_CHROMA = 0.4;

// Draw one symmetric offset from [-spread, +spread].
//
// `u1 + u2` is already triangular on [0, 2], so centring it and scaling gives
// a symmetric triangular on [-spread, +spread] whose mode sits on the original
// coordinate — that is what makes the triangular option feel like "mostly
// unchanged" rather than "a different color every time".
function drawOklchOffset(
  spread: number,
  distribution: OffsetDistribution,
  random: RandomSource,
): number {
  // A zero spread is the identity, so no draw is consumed for it. That keeps a
  // pinned channel from shifting the draws the other channels receive.
  if (!(spread > 0)) {
    return 0;
  }

  const u1 = random();
  if (distribution === "triangular") {
    return (u1 + random() - 1) * spread;
  }
  return (u1 - 0.5) * 2 * spread;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Hue is cyclic, so it wraps instead of clamping: a hue of 350 with a spread of
// 30 must be able to reach 20, not stop at 360.
function wrapHue(hue: number): number {
  const wrapped = hue % 360;
  return wrapped < 0 ? wrapped + 360 : wrapped;
}

// Perturb one OKLCH color around itself, per-coordinate, by the given spreads.
//
// Every group is anchored to its own color rather than to a global value, which
// is what "keeping each color near its original brightness" means: a dark group
// stays dark because it is perturbed around its own lightness. At a lightness
// spread of 0 the relative lightness ordering of the groups is preserved
// exactly.
//
// No rounding happens here; oklchToRgb() rounds to bytes only after gamut
// mapping.
function randomizeOklch(
  lightness: number,
  chroma: number,
  hue: number,
  spread: OklchSpread,
  distribution: OffsetDistribution,
  random: RandomSource,
): Oklch {
  return {
    lightness: clamp(
      lightness + drawOklchOffset(spread.lightness, distribution, random),
      0,
      1,
    ),
    chroma: clamp(
      chroma + drawOklchOffset(spread.chroma, distribution, random),
      0,
      MAX_CHROMA,
    ),
    hue: wrapHue(hue + drawOklchOffset(spread.hue, distribution, random)),
  };
}
