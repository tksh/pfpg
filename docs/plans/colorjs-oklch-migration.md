# Plan — Migrate the color conversion to Color.js and OKLCH

Status: approved 2026-10-11 (see the appendix in §12); approved for implementation.
Scope: planning only. This document does not modify application source code,
`deno.jsonc`, tests, build scripts, or lock files.

## 1. Summary and objectives

Replace the hand-rolled CIE LCH conversion in
`src/js/color-formatter/rgb-to-lch.ts` with Color.js 0.7.1 and adopt **OKLCH** as the
application's single perceptual color space.

Concretely:

- `rgbToLch()` becomes `rgbToOklch()`, backed by Color.js, returning OKLCH coordinates
  (normalized lightness [0, 1], OKLCH chroma, hue in [0, 360)).
- A new `oklchToRgb()` wrapper is the single documented route from modified OKLCH
  coordinates back to 8-bit sRGB, using Color.js gamut mapping with
  `method: "css"` (CSS Color 4 binary search + local MINDE).
- The one existing call site's heuristic moves to
  `src/js/color-formatter/text-lightness.ts` and onto the normalized lightness scale
  (§8.3).
- Tests cover both directions, the achromatic-hue case, byte-range invariants, and the
  existing foreground-color decision.

Explicitly **out of scope**: the future "randomize hue" artwork feature, any
contrast-ratio/accessibility algorithm, and any other refactoring.

### Known constraint this plan must respect

These are hard limits from `AGENTS.md` §5 and §8, and from the migration request:

- No second color library, no CDN import, no inline `npm:` specifier in application
  source, no `package.json` workflow.
- No CIE LCH parallel implementation and no misleadingly named leftovers.
- The `deno.jsonc` `imports` map is *merged*, never replaced.
- Gamut mapping is Color.js's built-in `"css"` method only — never clipping, never
  `"oklch.c"`, never raytracing, never a hand-written approximation.
- RGB→OKLCH conversion does **not** gamut-map (the input is already in the sRGB gamut).
- Gamut mapping is applied only when a concrete sRGB output is required.

## 2. Verified current implementation and call-site analysis

All findings below were verified by reading the repository at the time of writing.

### 2.1 `rgbToLch()` — current implementation

File: `src/js/color-formatter/rgb-to-lch.ts` (53 lines total).

It is a pure function, three hand-written stages:

- `rgbToXyz(r, g, b)` (lines 3–17): 8-bit channels → linear sRGB (the sRGB transfer
  function) → XYZ via the sRGB→XYZ matrix.
- `xyzToLab(x, y, z)` (lines 19–32): CIE Lab.
- `labToLch(l, a, b)` (lines 34–42): polar conversion, hue wrapped to [0, 360).

Signature (lines 44–53):

```ts
function rgbToLch(
  r: number,
  g: number,
  b: number,
): { lightness: number; chroma: number; hue: number }
```

Verified numerical behavior, reproduced locally:

| Input (8-bit)  | lightness (0–100) | chroma (CIE units) |
| -------------- | ----------------- | ------------------ |
| `(0, 0, 0)`    | 0.00              | 0.00               |
| `(128, 128, 128)` | 53.59          | 6.11               |
| `(255, 0, 0)`  | 53.23             | 98.79              |
| `(0, 128, 0)`  | 46.23             | 73.41              |
| `(0, 0, 255)`  | 32.30             | 135.58             |
| `(78, 141, 9)` | 52.61             | 68.58              |

Two defects worth recording, because the migration must not silently preserve them:

1. **Inconsistent white point.** Line 50 divides X by 0.96422 and Z by 0.82521 — the
   D50 white point — while `rgbToXyz` produced D65 XYZ and no chromatic adaptation is
   applied. A correct D65 reference computation gives `rgb(255, 0, 0)` a chroma of
   104.552, not 98.79; lightness (53.24) is nearly identical, so the defect is mostly
   invisible through the current caller, which only reads lightness.
2. **Hue is unguarded for neutral colors.** `labToLch` computes `atan2(0, 0)`, which
   returns 0 rather than an "undefined hue" marker. OKLCH does not behave the same way
   (see §3.3).

Also note: lightness and chroma use CIE LCH conventions, not OKLCH. **Do not** divide
the old L by 100 and assume the thresholds still hold.

### 2.2 Call sites — exactly one

Verified by grepping the whole repository for `rgbToLch`, `color-formatter/rgb-to-lch`,
`lch(`, and `getTextLightness`. The only production consumer is:

File: `src/js/page-specific/index/tab-lines/group-colors-generator.ts`

| Line(s)     | Role |
| ----------- | ---- |
| 5           | `import { rgbToLch } from "color-formatter/rgb-to-lch";` |
| 222–223     | `createStrokeThumbnailDivElement()`: `getTextLightness(strokeColorStr)` → `style.color = `lch(${textLightness} 0 0)`` |
| 240–247     | `getTextLightness(colorString)`: parses the color, calls `rgbToLch`, `Math.round(lch.lightness)` (integer 0–100), delegates to `calculateContrast` |
| 249–254     | `calculateContrast(fillLightness)`: `fillLightness <= 50 ? fillLightness + 50 : fillLightness - 50` |
| 342–343     | Alwan `change` listener: same `getTextLightness` + `lch(...)` assignment for the picked color |

The **entire** purpose of the conversion is choosing a readable foreground text color
over the group-color thumbnail swatch. No other code reads lightness, chroma, or hue,
and no stored/encoded value is affected. Nothing serializes LCH values.

Both call sites emit a CSS `lch()` string with chroma 0 and hue 0, i.e. a neutral gray
whose only meaningful coordinate is lightness.

### 2.3 Supporting modules and conventions (verified)

- `src/js/color-formatter/format-converter.ts` — `convertColorFormat`,
  `convertColorFormatForArray`, `convertToRgbArr`. Pure functions, DOM-free.
- `src/js/color-formatter/normalized-from-hex.ts` — `hexToRgbArr` returns
  `Array<number | string> | string`, where the string case is the sentinel
  `"Invalid hex string"` or `"Invalid RGB string format"`.
- `src/js/page-specific/index/utils/number-rounding.ts` — `roundToOneDecimal`,
  `roundToTwoDecimals`, `toFixedTrimmed`.
- The formatter does **not** sort import statements, only specifiers inside braces
  (`import { a, b } from "..."`). Existing import blocks show deliberate grouping.
- Tests: `tests/*_test.ts`, `Deno.test` + `@std/assert` via the `@std/assert` import-map
  key. Existing files: `goldens_test.ts`, `image_encoder_test.ts`,
  `shared_image_key_test.ts`, `svg_and_shared_image_key_golden_test.ts`.
- `deno.jsonc`: `tasks.test` is `deno test --allow-read tests/` (line 35);
  `tasks.check` is `deno check tests/ src/ scripts/ functions/ netlify/ server/`
  (line 36); `imports` begins at line 56; the rgb-to-lch entry is line 180.
- Third-party credits live in three places: `README.md` dependency table,
  `src/index.html` "Built with" list, and `src/licenses/` (texts + `index.html`).
- No CI workflow exists in the repository (`.github/` is absent); validation is local.

### 2.4 What the migration must preserve (and what legitimately changes)

Preserve:

- The *purpose*: pick a readable foreground over the swatch background.
- The heuristic's *structure*: compare background lightness against a midpoint, then
  offset by half the scale so the two colors stay maximally far apart.
- DOM-free purity of the color helpers, and the legacy `Number()` coercion of the
  sentinel strings.

Legitimately changes (and is called out in §8 so the reviewer can see it):

- The rendered text gray changes slightly, because OKLCH L ≠ CIE L/100.
- Backgrounds whose OKLCH lightness is within ~±0.07 of the midpoint get the opposite
  decision from today (§3.5).
- The emitted CSS function changes from `lch()` to `oklch()`.

## 3. Color-space decision and API contract

### 3.1 Color space: OKLCH, one space only

OKLCH is the application's single perceptual cylindrical space. There is no CIE LCH
code path left, and no second library. Coordinate conventions (verified against
`colorjs.io` `src/spaces/oklch.js`):

- Lightness `L`: normalized, reference range `[0, 1]`.
- Chroma `C`: OKLCH chroma, reference range `[0, 0.4]` — **not** CIE LCH chroma units.
- Hue `H`: degrees, `[0, 360)`, coordinate type `angle`.

### 3.2 API: Color.js procedural API, `colorjs.io/fn`

Chosen because it is the smaller, documented import surface and the migration request
pins it. Measured with `deno bundle --platform=browser` on an isolated probe (see §9.3):

| Import surface                          | Raw bytes | Gzip bytes |
| --------------------------------------- | --------- | ---------- |
| `colorjs.io/fn` (procedural)            | 102,524   | 27,225     |
| `colorjs.io` (default, class-based)     | 199,712   | 50,496     |

Imports in application code come from the **bare specifier** `colorjs.io/fn`.

### 3.3 Color-space registration (mandatory, easy to miss)

Color.js's procedural API registers **nothing** by default. Using a space id string in
`to()`/`toGamut()` throws
`TypeError: No color space found with id = "srgb"` unless it was registered.
Verified empirically.

So the plan requires exactly two registrations, once, at module scope:

```ts
import { ColorSpace, OKLCH, sRGB } from "colorjs.io/fn";

ColorSpace.register(sRGB);
ColorSpace.register(OKLCH);
```

Only these two spaces are needed: `srgb` (the byte input/output space and the gamut
target) and `oklch` (the working space). Nothing else is registered.

The registration lives in a dedicated module so that both wrappers and any future
feature share one copy and the side effect happens exactly once per process
(`ColorSpace.register` is idempotent for the same object, but one site is clearer):

File: `src/js/color-formatter/colorjs-spaces.ts` (new, ~8 lines)

### 3.4 Achromatic hue: Color.js uses `null`, and TypeScript will force a decision

Verified in `src/spaces/lch.js` (the OKLCH space's `fromBase`): when `|a|` and `|b|`
are both below the space epsilon, Color.js sets `h = null` and `C = 0`. The hue is
therefore **`null`, not 0, and not `NaN`** for neutral colors.

Verified output:

| Input (8-bit)  | lightness | chroma | hue          |
| -------------- | --------- | ------ | ------------ |
| `(0, 0, 0)`    | 0         | 0      | `null`       |
| `(255, 255, 255)` | 1     | 0      | `null`       |
| `(128, 128, 128)` | 0.5999 | 0     | `null`       |
| `(200, 200, 200)` | 0.8328 | 0     | `null`       |

Two consequences the implementer must handle:

1. **The return type cannot be `number` for hue unless the null is normalized.** The
   `.coords` array is typed `(number | null)[]`, so destructuring defaults
   (`const [h = 0] = coords`) do **not** satisfy the compiler — defaults only replace
   `undefined`. Verified: `deno check` fails with TS2322 / TS18047 on that pattern.
   The plan therefore specifies `?? 0` coalescing.
2. **Chosen handling: document it, then normalize.** The wrapper returns
   `hue: 0` for achromatic colors and documents that hue is *not meaningful* when
   chroma is zero. Rationale: the app never reads hue; the CSS string the app emits
   already uses `0 0` for chroma/hue; and the upcoming hue-randomization feature
   picks its own hue anyway. Returning `null` through a `number`-typed field would be
   a lie; returning a sentinel like `-1` invents a value Color.js does not use.

This is the one place where "do not assume hue is always meaningful" has teeth, and it
is settled here so the implementer does not have to guess.

### 3.5 The lightness threshold: what it becomes, and how it was chosen

The old threshold `50` is a midpoint on a 0–100 scale, and the old offset `50` is half
that scale. The structural port to OKLCH is midpoint `0.5`, offset `0.5`:

```
lightness <= 0.5  ?  lightness + 0.5  :  lightness - 0.5
```

This is **not** "50 divided by 100 re-validated". It is the same *rule* — split the
scale at the midpoint and jump to the far side — re-expressed on a scale whose shape
differs from CIE L. Because the two scales are not linearly related, the decision
boundary lands at a different *color*.

Verified comparison (`deno run` on the current implementation vs the proposed rule):

| Background (8-bit) | CIE L (old) | Old text (`lch(L 0 0)`) → rgb | OKLCH L (new) | New text (`oklch(L 0 0)`) → rgb |
| ------------------ | ----------- | ---------------------------- | ------------- | ------------------------------ |
| `(255, 255, 255)`  | 100.00      | `lch(50 0 0)` → 119,119,119  | 1.000000      | `oklch(0.5 0 0)` → 99,99,99    |
| `(0, 0, 0)`        | 0.00        | `lch(50 0 0)` → 119,119,119  | 0.000000      | `oklch(0.5 0 0)` → 99,99,99    |
| `(128, 128, 128)`  | 53.59       | `lch(4 0 0)` → 14,14,14      | 0.599871      | `oklch(0.0999 0 0)` → 3,3,3    |
| `(200, 200, 200)`  | 80.60       | `lch(31 0 0)` → 73,73,73     | 0.832794      | `oklch(0.3328 0 0)` → 54,54,54 |
| `(60, 60, 60)`     | 25.32       | `lch(75 0 0)` → 185,185,185  | 0.356179      | `oklch(0.8562 0 0)` → 208,208,208 |
| `(255, 0, 0)`      | 53.23       | `lch(3 0 0)` → 11,11,11      | 0.627955      | `oklch(0.1280 0 0)` → 7,7,7    |
| `(0, 128, 0)`      | 46.23       | `lch(96 0 0)` → 243,243,243  | 0.519752      | `oklch(0.0198 0 0)` → 0,0,0      |
| `(0, 255, 0)`      | 87.74       | `lch(38 0 0)` → 92,92,92     | 0.866440      | `oklch(0.3664 0 0)` → 63,63,63  |
| `(0, 0, 255)`      | 32.30       | `lch(82 0 0)` → 204,204,204  | 0.452014      | `oklch(0.9520 0 0)` → 239,239,239 |
| `(255, 255, 0)`    | 97.14       | `lch(47 0 0)` → 111,111,111  | 0.967983      | `oklch(0.4680 0 0)` → 90,90,90 |
| `(78, 141, 9)`     | 52.61       | `lch(3 0 0)` → 11,11,11      | 0.578162      | `oklch(0.0782 0 0)` → 2,2,2    |

The second green row is the one flip, and it is the honest cost of the scale change:

- **Green `(0, 128, 0)`**: CIE L 46.23 → old picks light text (243,243,243); OKLCH
  L 0.5198 → new picks dark text (0,0,0). The new choice is the more readable of
  the two, so this particular flip is an improvement rather than a regression.
- Its brighter sibling `(0, 255, 0)` keeps its direction (dark text), only the exact
  gray shifts (old 92,92,92 → new 63,63,63).

The flip band, measured by sweeping the neutral ramp: grays **100–120** inclusive
switch sides (CIE L 42.4–50.4 vs OKLCH L 0.5032–0.5727). Outside that band neutrals
keep their direction, and only the exact gray shifts. Saturated colors whose OKLCH
lightness lands near 0.5 from the other side than their CIE L/100 lands near 50 —
`(0, 128, 0)` being the documented example — flip too; the sweep above covers only
neutrals, which is why the browser check in §9.2 is part of acceptance.

**How the threshold should be tested** (this is the acceptance criterion, so that the
choice is verified rather than assumed):

1. For the eight backgrounds above, assert the *direction* (light-text vs dark-text),
   not just the number.
2. Assert round-trip sanity: applying the rule to a mid-gray must keep the two
   lightnesses ~0.5 apart, i.e. `|textL − bgL| ≈ 0.5`.
3. Human eyeball check in the browser on real thumbnails (§9.2), because "readable"
   is a perceptual judgment a unit test cannot settle.

**Explicitly considered and rejected:** introducing a WCAG contrast-ratio algorithm.
The request forbids it, it is a different design decision, and it would change the
look of the pickers. It is recorded here as a *separate* future decision with its own
justification, not mixed into this migration.

## 4. Dependency and Deno import-map changes

### 4.1 The dependency

Add **`colorjs.io@0.7.1`**, imported via the import map as `colorjs.io/fn`.

Version check performed while preparing this plan: the npm registry `dist-tags` for
`colorjs.io` reports `latest: 0.7.1` (published 2026-07-24); the only published
releases are 0.6.x, 0.7.0, and 0.7.1. **No newer stable release exists**, so 0.7.1 is
confirmed current with no version discrepancy to document.

Justification (AGENTS.md §5 requires it): CIE-Lab/OKLab gamut mapping requires correct
chromatic adaptation, the OKLab matrix, and the CSS Color 4 gamut-mapping algorithm
(binary search + local MINDE + deltaEOK). No jsr.io package in this repository or in
the project's dependency set provides OKLCH, and the repo's existing packages
(`@tksh/*`, jsquash, alwan) contain no color-space conversion. Reimplementing the CSS
gamut-mapping algorithm by hand is exactly what the request forbids.

### 4.2 The exact `deno.jsonc` change

Merge **one** entry into the existing `imports` object — do not replace the object, and
do not touch unrelated imports. Add it in the "Common imports for both index.html and
data-manipulator.html" block, adjacent to the other shared color helpers, so both pages
can reach it:

```jsonc
"colorjs.io/fn": "npm:colorjs.io@0.7.1/fn"
```

Rules for the implementer:

- Application code imports the **bare specifier** `colorjs.io/fn`, never an inline
  `npm:colorjs.io@...` specifier and never a remote URL.
- No `package.json`, no separate `npm install`, no CDN.
- Add the import-map entry for the renamed helper at the same time
  (`color-formatter/rgb-to-oklch`), replacing the old `color-formatter/rgb-to-lch`
  entry on line 180. Deleting the stale entry is part of the rename, not an unrelated
  change.

### 4.3 The `deno.lock` and the permission change (both are forced)

**`deno.lock` is version 5 and already has an `npm` section** containing
`@jsquash/oxipng@2.3.0`, `@jsquash/png@3.1.1`, `@jsquash/webp@1.5.0`, `alwan@2.3.1`,
and `wasm-feature-detect@1.9.0`. Adding an npm dependency therefore adds a
`colorjs.io@0.7.1` entry to that section on the next cache. The implementer must run
a cache-writing command (`deno check`, `deno task test`, or `deno install`) and commit
the resulting `deno.lock` update — an out-of-date lock will make `deno task build`
fail in a clean environment. `node_modules/` is gitignored and irrelevant here.

**The test task needs `--allow-env=NODE_ENV`.** This is a verified, unavoidable
consequence of the import, not a preference. `colorjs.io@0.7.1/src/defaults.js` reads
`process.env.NODE_ENV` at module load time, so importing the package from a Deno test
requires env access:

```
error: (in promise) NotCapable: Requires env access to "NODE_ENV", run again with the --allow-env flag
    verbose: globalThis?.process?.env?.NODE_ENV?.toLowerCase() !== "test",
```

Verified: `deno test --allow-read --allow-env=NODE_ENV` passes all tests, while
`deno test --allow-read` (the current task definition) fails with the error above.
The narrow permission is sufficient and is preferred over a blanket `--allow-env`.

Change line 35 of `deno.jsonc` from:

```jsonc
"test": "deno test --allow-read tests/",
```

to:

```jsonc
// --allow-env=NODE_ENV is required by colorjs.io (it reads process.env.NODE_ENV at
// module load); the narrow grant is enough, a blanket --allow-env is not needed.
"test": "deno test --allow-read --allow-env=NODE_ENV tests/",
```

`deno bundle` needs no permission change (verified: bundling the probe HTML with no
flags succeeded), and neither does `deno check`. `scripts/dev.ts` and
`scripts/build.sh` are untouched.

## 5. Proposed implementation steps, in order

Ordered so that each step compiles and type-checks on its own; the migration is one
logical change per AGENTS.md §7, split into steps only for reviewability.

### Step 1 — Add the dependency entry and the registration module

1. `deno.jsonc` line 180: replace
   `"color-formatter/rgb-to-lch": "./src/js/color-formatter/rgb-to-lch.ts"` with
   `"color-formatter/rgb-to-oklch": "./src/js/color-formatter/rgb-to-oklch.ts"`.
2. Add `"colorjs.io/fn": "npm:colorjs.io@0.7.1/fn"` to `imports` (§4.2) and
   `"color-formatter/colorjs-spaces": "./src/js/color-formatter/colorjs-spaces.ts"`.
3. Create `src/js/color-formatter/colorjs-spaces.ts`:

```ts
// Registers the only two color spaces this app converts between. Color.js's
// procedural API registers nothing by default, and using an unregistered space id
// throws. Side-effect import, exactly once per process.
import { ColorSpace, OKLCH, sRGB } from "colorjs.io/fn";

ColorSpace.register(sRGB);
ColorSpace.register(OKLCH);
```

### Step 2 — Create `rgb-to-oklch.ts` and delete `rgb-to-lch.ts`

Create `src/js/color-formatter/rgb-to-oklch.ts`:

```ts
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
```

Note the input is a plain object literal with a *string* space id — this is why the
registration side-effect import is required. `to()` returns a plain object
`{ space, coords, alpha }`; the coordinates are read positionally.

Then `git rm src/js/color-formatter/rgb-to-lch.ts`. Do not leave a shim, do not keep
the old name as an alias.

### Step 3 — Create `oklch-to-rgb.ts`

Create `src/js/color-formatter/oklch-to-rgb.ts`:

```ts
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
```

Rounding happens **only here**, after gamut mapping and conversion — never before.

### Step 4 — Move the heuristic into its own module and port it to OKLCH

This is one step because the move and the scale change touch the same lines, and doing
them together keeps `group-colors-generator.ts` free of color math entirely (approved
option B, §8.3).

1. Create `src/js/color-formatter/text-lightness.ts` with the function body from §8.3,
   verbatim — same name, same signature, same JSDoc, and the legacy `Number()`
   coercion with its comment intact.
2. Delete the `getTextLightness`/`calculateContrast` pair (lines 240–254) from
   `src/js/page-specific/index/tab-lines/group-colors-generator.ts`. The two functions
   become one: `calculateContrast`'s midpoint/offset is folded into the return
   expression, because a separate one-line helper no longer earns its keep once the
   rounding is gone.
3. Replace the import on line 5:

```ts
import { getTextLightness } from "color-formatter/text-lightness";
```

   The file no longer references `rgbToOklch` directly, so **do not** also add the
   `color-formatter/rgb-to-oklch` import there — the conversion is reached through
   `text-lightness.ts`.
4. Add the import-map entry in `deno.jsonc`:

```jsonc
"color-formatter/text-lightness": "./src/js/color-formatter/text-lightness.ts"
```

The `Math.round()` in the old code is dropped deliberately, and this is the one place
where a mechanical port would be wrong: on a 0–100 CIE scale it produced an integer
for CSS convenience; on the 0–1 OKLCH scale, rounding would make almost every
background either 0 or 1 and pick the same text color for all of them. Dropping it is
part of the scale change, not an oversight.

### Step 5 — Update the two DOM call sites

In `createStrokeThumbnailDivElement` (lines 222–223) and the Alwan `change` listener
(lines 342–343), emit an `oklch()` string with the normalized value:

```ts
strokeThumbDiv.style.color = `oklch(${textLightness} 0 0)`;
```

`lch(...)` becomes `oklch(...)`, same chroma-0/hue-0 neutral-gray construction. Emitting
the value unrounded keeps full precision in the string; CSS parses it fine. The
`change` listener calls the same `getTextLightness`, so it inherits the OKLCH behavior
automatically once step 4 is in — no other change there.

### Step 6 — Add the tests

Create `tests/color_formatter_test.ts` per §8. Then run the full validation (§9).

### Step 7 — Update the credits

Color.js is MIT and ships in the browser bundle, so the repo's license-shipping
convention applies. Four small, mechanical updates:

1. Add `src/licenses/colorjs-MIT.txt`, the verbatim MIT text from the
   `colorjs.io@0.7.1` package (`Copyright (c) 2021 Lea Verou, Chris Lilley`).
2. Add an `<li>` entry to `src/licenses/index.html` in the same form as the others,
   linking that file.
3. Add a row to the `README.md` "Dependencies" table:
   `[colorjs.io](https://www.npmjs.com/package/colorjs.io) | MIT | Color-space
   conversion (sRGB ↔ OKLCH) and CSS Color 4 gamut mapping`
4. Add a `<dd>` credit to the "Built with" list in `src/index.html`
   (after the Alwan entry, line 644), in the same style:
   `<a href="https://colorjs.io" title="colorjs.io: Color-space conversion and gamut mapping">colorjs.io (MIT license)</a>`

`deno task copy:licenses` already copies `src/licenses/*` to `dist/licenses/`, so no
build-script change is needed.

### Why no other files change

The conversion is only reached through `group-colors-generator.ts`, and after step 4
only through `text-lightness.ts`. `deno.jsonc` imports are keyed by path, so no other
module references the renamed file. The theme-color, opacity, SVG, and codec paths
never touch LCH, and no fixture, encoder, or codec test depends on the old values.

## 6. Gamut-mapping design and exact Color.js API options

### 6.1 The algorithm

Gamut mapping uses **CSS Color 4 Binary Search + Local MINDE, as implemented by
Color.js**. The call is:

```ts
toGamut(color, { space: "srgb", method: "css" })
```

`method: "css"` is set **explicitly** even though Color.js's default happens to be
`"css"` too (`src/defaults.js` sets `gamut_mapping: "css"`). The request requires the
explicit option; relying on a default that a future minor version could change is how
silent regressions start.

Not permitted, and none of them appear in this plan:

- simple channel clipping, or `method: "clip"`
- generic chroma reduction such as `method: "oklch.c"`
- the ray-tracing method (`method: "raytrace"`)
- any hand-written approximation of the CSS algorithm

The binary search, the local-MINDE comparison, the deltaEOK calculation, and the
stopping conditions are all Color.js's. This plan writes none of them.

### 6.2 What `toGamut()` actually does (verified against v0.7.1 source)

Two behaviors are surprising enough that guessing wrong would produce a subtly broken
conversion:

1. **It mutates the color it is given** and returns that same object. Passing a shared
   or reused color object would corrupt it. Our wrapper builds a fresh literal per
   call, so this is safe, but it is why the wrapper never accepts a color object.
2. **It does not necessarily return a color in the target space.** Reading
   `src/toGamut.js` for v0.7.1: when the input space differs from the target space,
   the mapped coordinates are converted back to the *input* space
   (`spaceColor = to(spaceColor, color.space)`), and the returned object carries
   `color.space`. So `toGamut({space:"oklch",...}, {space:"srgb"})` returns an
   **OKLCH** color whose coordinates have been mapped into the sRGB gamut.

Verified empirically:

```
in-gamut gray : mapped space=oklch  oklch=[0.5, 0, 0]              srgb=[0.3886,...] bytes=[99,99,99]
out C=0.5 h150: mapped space=oklch  oklch=[0.70912, 0.21034, 147.07] srgb=[0, 0.76063, 0.28104] bytes=[0,194,72]
L=1.0 C=0.3   : mapped space=oklch  oklch=[1, 0, null]             srgb=[1,1,1] bytes=[255,255,255]
```

Conclusion baked into `oklchToRgb()`: **always** follow `toGamut()` with an explicit
`to(mapped, "srgb")`. Assuming `toGamut()` already returned sRGB coordinates would
silently feed OKLCH numbers into the byte conversion.

A second verified quirk worth documenting: for out-of-range lightness the CSS algorithm
returns media white/black (`L >= 1` → white, `L <= 0` → black), and the achromatic hue
comes back as `null` — which is exactly why `oklchToRgb()` coalesces with `?? 0` too.

### 6.3 Processing order

1. Construct or receive an OKLCH color (`{ space: "oklch", coords: [L, C, H] }`).
2. Modify the intended OKLCH coordinates.
3. Map into the sRGB gamut with `method: "css"`.
4. Convert the mapped result to sRGB coordinates with `to(mapped, "srgb")`.
5. Convert normalized channels to integers 0–255 with `Math.round(... * 255)`,
   rounding only after mapping and conversion.

Out-of-gamut OKLCH values are preserved during intermediate operations; gamut mapping
is applied when a concrete sRGB output is needed, never as a constraint on OKLCH
itself.

### 6.4 What gamut mapping does and does not guarantee

Documented for the caller and the reviewer:

- It preserves *perceptual appearance* as well as the CSS algorithm can; it generally
  reduces chroma as needed.
- The final mapped color does **not** preserve L and H with mathematically exact
  equality. The binary search stops when the difference from the clipped color falls
  below a just-noticeable difference, so small L/H drift is expected and correct.
- Hue in the mapped result may come back `null` for neutral colors (§6.2).

### 6.5 Worked examples (verified outputs, for the reviewer)

| Input OKLCH (L, C, H)                          | In sRGB gamut? | `oklchToRgb()` output |
| ---------------------------------------------- | -------------- | --------------------- |
| `(0.6279570211360938, 0.25768082360338185, 29.230195953267355)` | yes (red) | `(255, 0, 0)` |
| `(0.578162223, 0.1626028094, 133.943992818)`   | yes (app teal) | `(78, 141, 9)` |
| `(0.5, 0, 0)`                                  | yes (gray)     | `(99, 99, 99)`        |
| `(0.5, 0, 90)`                                 | yes (gray, hue irrelevant at C=0) | `(99, 99, 99)` |
| `(0.7, 0.5, 150)`                              | no             | `(0, 194, 72)`        |
| `(0.75, 0.37, 140)`                            | no             | `(28, 211, 0)`        |
| `(0.7, 0.4, 30)`                               | no             | `(255, 88, 67)`       |
| `(1.0, 0.3, 200)`                              | L out of range | `(255, 255, 255)` — white |
| `(0.0, 0.3, 200)`                              | L out of range | `(0, 0, 0)` — black   |

Note that `(0.7, 0.5, 150)` under the CSS method yields `(0, 194, 72)`, whereas
`method: "clip"` would give `(0, 223, 0)` — a direct, testable proof that the `"css"`
method is in effect rather than clipping.

## 7. Files expected to change

| Path | Change | Purpose |
| ---- | ------ | ------- |
| `deno.jsonc` | add `colorjs.io/fn` import (line ~176 block); rename line 180 `color-formatter/rgb-to-lch` → `color-formatter/rgb-to-oklch`; add `color-formatter/colorjs-spaces`, `color-formatter/oklch-to-rgb`, and `color-formatter/text-lightness` entries; add `--allow-env=NODE_ENV` to `test` (line 35) | dependency, aliases, and the forced test permission |
| `src/js/color-formatter/colorjs-spaces.ts` | **new**, ~8 lines | register `sRGB` + `OKLCH` once |
| `src/js/color-formatter/rgb-to-oklch.ts` | **new**, ~30 lines | `rgbToOklch()`, OKLCH out of 8-bit sRGB |
| `src/js/color-formatter/rgb-to-lch.ts` | **deleted** | the custom CIE LCH path, removed entirely |
| `src/js/color-formatter/oklch-to-rgb.ts` | **new**, ~30 lines | `oklchToRgb()`, the single CSS-mapped route back to sRGB |
| `src/js/color-formatter/text-lightness.ts` | **new**, ~20 lines | `getTextLightness()` moved out of the UI file (approved §8.3); the one place the lightness threshold lives |
| `src/js/page-specific/index/tab-lines/group-colors-generator.ts` | edit line 5 (import); replace lines 222–223 and 342–343 (`lch(` → `oklch(`); delete lines 240–254 (the two helper functions) | the only call site; the heuristic now lives in `text-lightness.ts` |
| `tests/color_formatter_test.ts` | **new** | unit tests for both conversions and the heuristic |
| `src/licenses/colorjs-MIT.txt` | **new** | verbatim MIT text for the shipped dependency |
| `src/licenses/index.html` | add one `<li>` | link the new text from the licenses page |
| `README.md` | add one dependency-table row | keep the credits table accurate |
| `src/index.html` | add one `<dd>` (after line 644) | keep the "Built with" list accurate |
| `deno.lock` | regenerated by cache (not hand-edited) | records `colorjs.io@0.7.1` |

Files deliberately **not** touched: every other module under `src/js/`, all fixture
files, `scripts/`, `functions/`, `netlify/`, `server/`, `dist/`, `AGENTS.md`, and the
archived plans.

## 8. Tests and acceptance criteria

File: `tests/color_formatter_test.ts`. Follow the existing convention
(`import ... from "@std/assert"`, `Deno.test`, no DOM). This test file is DOM-free
by design — it exercises only `rgb-to-oklch.ts`, `oklch-to-rgb.ts`, and a small pure
helper for the foreground decision (see §8.4 for why the decision logic needs its own
module).

### 8.1 `rgbToOklch` — RGB to OKLCH

Expected values below were produced by Color.js 0.7.1 **and independently reproduced
from Björn Ottosson's published OKLab formulas**; the two agree to ~1e-6, so the
fixtures are cross-validated rather than copied from the implementation under test.
Tolerance: `1e-6` for L and C, `1e-4` for H.

| Input | lightness | chroma | hue |
| ----- | --------- | ------ | --- |
| `(0, 0, 0)` | 0 | 0 | 0 (achromatic) |
| `(255, 255, 255)` | ≈1 (`1.0000000000000002`) | 0 | 0 (achromatic) |
| `(128, 128, 128)` | 0.5998708056221469 | 0 | 0 (achromatic) |
| `(100, 100, 100)` | 0.5032293384241285 | 0 | 0 (achromatic) |
| `(60, 60, 60)` | 0.356179254678186 | 0 | 0 |
| `(200, 200, 200)` | 0.8327938177446831 | 0 | 0 |
| `(255, 0, 0)` | 0.6279553639214311 | 0.2576833038053606 | 29.233880279627897 |
| `(0, 255, 0)` | 0.8664396175234368 | 0.2948272245426958 | 142.4953450414439 |
| `(0, 0, 255)` | 0.45201371817442365 | 0.3132143886344849 | 264.0520226163699 |
| `(0, 255, 255)` | 0.9053992360133608 | 0.1545500236044062 | 194.7689598979818 |
| `(255, 0, 255)` | 0.7016738591017413 | 0.32249098770537216 | 328.36341517499017 |
| `(255, 255, 0)` | 0.9679827267927991 | 0.2110058737497979 | 109.76923612816614 |
| `(78, 141, 9)` | 0.5781622267000762 | 0.162602809494688 | 133.9439992552758 |

Use tolerance-based assertions for L/C/H, but **exact** equality for the achromatic
rows' `chroma === 0` and `hue === 0`, since those are the null-normalization contract
and an approximate 0 would defeat the purpose.

Additional cases:

- **Neutrals have exactly zero chroma** — assert `chroma === 0` for
  `(0,0,0)`, `(128,128,128)`, `(200,200,200)`.
- **Hue normalization** — every hue is in `[0, 360)`. Verified against hue-bearing
  primaries; also assert the cyan/magenta rows above, whose hues are 194.77 and
  328.36.
- **Byte-range sweep** — for every `v` in `0..255` on the gray ramp: L within
  `[0, 1.000000000000001]`, `C === 0`, `hue === 0`; for the primaries and
  `(78, 141, 9)`: L in range, `chroma > 0`, `hue` in `[0, 360)`.
- **Legacy sentinel degradation** — `rgbToOklch(NaN, NaN, NaN)` (what
  `Number("Invalid hex string")` produces) yields NaN lightness without throwing,
  matching the old behavior where the sentinel flowed through and produced NaN.

### 8.2 `oklchToRgb` — gamut mapping and byte conversion

Reference outputs, verified with the pinned version:

| Input (L, C, H) | Expected (r, g, b) | Note |
| --------------- | ------------------ | ---- |
| `(0.6279570211360938, 0.25768082360338185, 29.230195953267355)` | `(255, 0, 0)` | in gamut, identity |
| `(0.578162223, 0.1626028094, 133.943992818)` | `(78, 141, 9)` | in gamut, identity |
| `(0.5, 0, 0)` | `(99, 99, 99)` | in gamut, neutral |
| `(0.5, 0, 90)` | `(99, 99, 99)` | neutral: hue ignored at C=0 |
| `(0.7, 0.5, 150)` | `(0, 194, 72)` | out of gamut, CSS-mapped |
| `(0.75, 0.37, 140)` | `(28, 211, 0)` | out of gamut, CSS-mapped |
| `(0.7, 0.4, 30)` | `(255, 88, 67)` | out of gamut, CSS-mapped |
| `(1.0, 0.3, 200)` | `(255, 255, 255)` | L out of range → white |
| `(0.0, 0.3, 200)` | `(0, 0, 0)` | L out of range → black |

- **Channel bounds** — sweep `L ∈ {0, 0.25, 0.5, 0.75, 1}` × `C ∈ {0, 0.1, 0.3, 0.45}`
  × `H ∈ {0, 90, 180, 270}`: every channel is a finite integer in `[0, 255]`.
- **Proof of `"css"` over clipping** — `(0.7, 0.5, 150)` must be `(0, 194, 72)`;
  `method: "clip"` would give `(0, 223, 0)`. This case is the regression guard for
  the explicitly-chosen method.
- **Boundary lightness** — `L = 0` and `L = 1` with nonzero chroma map to black and
  white respectively, as the CSS algorithm specifies.
- **Neutral handling** — `C = 0` with any hue yields the same gray bytes.

### 8.3 The foreground-text decision (existing behavior)

**Decision: extract the decision into a pure helper module, then test it** (approved,
see §12). The alternative — testing it inside `group-colors-generator.ts` — is not
possible without a DOM harness: that file statically imports `alwan` and `alwan/css`.
Verified: `import "alwan/css"` throws `SyntaxError: Unexpected token ':'` under Deno,
because npm CSS is not a JS module. A DOM shim or string-matching extraction would be
worse than moving the function.

Move `getTextLightness` out of `group-colors-generator.ts` into
`src/js/color-formatter/text-lightness.ts`, keeping the same name, signature, and
JSDoc, and importing `convertToRgbArr` from `color-formatter/format-converter`
(already DOM-free) plus `rgbToOklch`. `group-colors-generator.ts` then imports the
helper instead of defining it. This is a pure move with no logic change: it keeps the
UI file free of a color heuristic and makes the decision unit-testable exactly as the
request requires. Add the import-map entry `color-formatter/text-lightness` alongside
the others.

The exact contents of `src/js/color-formatter/text-lightness.ts`:

```ts
import { convertToRgbArr } from "color-formatter/format-converter";
import { rgbToOklch } from "color-formatter/rgb-to-oklch";

export { getTextLightness };

/**
 * Get text color with calculated lightness for optimal contrast
 * @param {string} colorString - RGB|HEX color value string, e.g.: "rgb(0 0 0)"|"#000000"
 * @return {number} - Lightness value for OKLCH, [0-1]
 */
function getTextLightness(colorString: string): number {
  const rgbArr = convertToRgbArr(colorString);
  // Number() preserves the legacy coercion for invalid input (sentinel strings flow the same way).
  const oklch = rgbToOklch(
    Number(rgbArr[0]),
    Number(rgbArr[1]),
    Number(rgbArr[2]),
  ); // r, g, b UInt8 [0-255]
  // OKLCH lightness is normalized [0, 1], so the midpoint is 0.5 and the offset is
  // half the scale. Rounding to an integer here would collapse the scale to {0, 1}
  // and destroy the contrast decision entirely.
  return oklch.lightness <= 0.5 ? oklch.lightness + 0.5 : oklch.lightness - 0.5;
}
```

`group-colors-generator.ts` loses the function body and gains
`import { getTextLightness } from "color-formatter/text-lightness";`, replacing the
`rgbToOklch` import added in step 4 (the file no longer calls the conversion itself).

Tests for the helper:

```
getTextLightness("#FFFFFF")  ≈ 0.5      (lightness 1.0 > 0.5 -> 1.0 - 0.5)
getTextLightness("#000000")  ≈ 0.5      (lightness 0   <= 0.5 -> 0 + 0.5)
getTextLightness("#808080")  ≈ 0.0999   (0.599871 - 0.5)
getTextLightness("rgb(0 0 255)") ≈ 0.9520  (0.452014 + 0.5)
getTextLightness("#008000")  ≈ 0.0198   (0.519752 - 0.5)  [direction flips vs old]
getTextLightness("#00FF00")  ≈ 0.3664   (0.866440 - 0.5)  [same direction as old]
```

Plus a table-driven test over the eight representative backgrounds from §3.5 asserting
the *direction* (light-text vs dark-text), so a future scale change cannot silently
invert the heuristic. And: for a representative set of inputs,
`Math.abs(result − inputLightness) ≈ 0.5` (round-trip invariant).

### 8.4 "All call sites use the renamed helper"

`grep -rn "rgbToLch" src/ tests/` must return nothing; `grep -rn "lch(" src/` must
return nothing outside `oklch(` occurrences. The old file must not exist. This is a
one-line check in the implementation report, not a test.

### 8.5 Acceptance criteria summary

1. `deno task check`, `deno task lint`, `deno fmt --check` (changed files only),
   `deno task test`, `deno task build` all clean.
2. All §8.1–§8.3 tests pass, including the null-hue normalization.
3. The clip-vs-css reference value proves `method: "css"` is active.
4. Browser check per §9.2 shows readable thumbnails and no regression in the pickers.
5. `deno.lock` records `colorjs.io@0.7.1`, and the built bundle contains no runtime
   network fetch for the library.
6. Credits updated (§5 step 7).

## 9. Deno, browser, and build validation

All commands below are the repository's existing tasks (verified in `deno.jsonc`); no
new scripts are introduced.

### 9.1 Automated checks

Run in this order, from the repository root:

1. `deno task check` — `deno check tests/ src/ scripts/ functions/ netlify/ server/`
   (strict + `noUncheckedIndexedAccess`; this is what catches the
   `(number | null)[]` typing problem).
2. `deno task test` — `deno test --allow-read --allow-env=NODE_ENV tests/`.
3. `deno task lint` — `deno lint` over the whole project.
4. `deno fmt --check` on the changed files only — the repo's convention is to run
   `deno fmt` without reformatting untouched lines, and `deno.jsonc` excludes the
   byte-exact fixtures from formatting.
5. `deno task build` — `build:index`, `build:data-manipulator`, `build:404`,
   `build:history`, `postprocessing`. This exercises `deno bundle --platform=browser`
   for every page that pulls in the new import.
6. `git diff deno.lock` — confirm the only change is the `colorjs.io@0.7.1` addition.

Note on step 2: `deno install` (README's install step) writes the npm cache and lock;
running it once after the `deno.jsonc` edit avoids a mid-run cache write.

### 9.2 Browser verification (the pages that use the helper)

The helper is reachable from `src/index.html` only (`data-manipulator.html` has no
color pickers). Two paths:

- `deno task dev` then open `http://localhost:8000` and load an artwork via a query
  string, **or**
- `deno task build` then serve `dist/` (`deno task serve`) and open it.

Check, per background color:

- the group-color thumbnail text stays readable (that is the whole feature);
- the text color flips direction across the flip band (§3.5). The boundary sits between
  gray `#636363` (L 0.4997 → **light** text) and gray `#646464` (L 0.5032 → **dark**
  text) — adjacent swatches with opposite decisions. `#555555` and `#808080`, one on
  each side further out, should show light then dark text, matching the table in §3.5;
- the Alwan picker's `change` event updates the thumbnail text color immediately;
- no console errors, and nothing in the Network tab indicates the library was fetched
  at runtime (see §9.3);
- light and dark UI themes and both color formats (RGB and HEX) behave identically.

### 9.3 Dependency resolution and bundle-size impact

**Resolution through the import map.** The application imports
`colorjs.io/fn`, which resolves via `deno.jsonc` `imports` to `npm:colorjs.io@0.7.1/fn`.
`npm:colorjs.io@0.7.1/fn` is a valid subpath of the package (its `exports` map declares
`"./fn"` → `./src/index-fn.js`), so no deep path or `exports` workaround is needed.

**No runtime network dependency.** `deno bundle --platform=browser` inlines the
package's ES modules. The only `https://` strings in the bundle are doc-comment URLs
inside Color.js source, not runtime fetches. Confirm after building by searching the
emitted `dist/*.js` for `import(` / `fetch(` of a remote URL.

**Bundle size, measured rather than guessed.** Measured on an isolated probe
(same `deno bundle --platform=browser` pipeline as the project's build tasks), comparing
an empty module, the procedural API plus the two wrappers, and the default class-based
API:

| Probe | Raw bytes | Gzip |
| ----- | --------- | ---- |
| empty module (Deno bundle baseline) | 49 | 89 |
| `colorjs.io/fn` + both wrappers | 102,524 | 27,225 |
| `colorjs.io` default API | 199,712 | 50,496 |

So the migration adds roughly **+102 KB raw / +27 KB gzipped** to a page that imports
it, and the procedural API halves the cost versus the class-based import. The
intended-page delta can be read off the same way before and after: bundle
`src/index.html` with `deno bundle src/index.html --platform=browser --outdir /tmp`
and compare the JS size against the pre-migration build.

This is the concrete cost to weigh against deleting ~50 lines of hand-written color
math, and it is the reason the request pins the procedural API.

## 10. Risks, compatibility considerations, and rollback

### 10.1 Risks

| Risk | Likelihood | Mitigation |
| ---- | ---------- | ---------- |
| Threshold flips for backgrounds near the OKLCH midpoint (gray 100–120 and perceptual neighbors) — visible behavior change | Certain (it is the point of the change, but must be seen by the human) | §3.5 table + §8.3 direction tests + §9.2 browser check; the human signs off on the flip band before merge |
| `deno task test` fails with `NotCapable ... NODE_ENV` if the permission is added to the wrong task or the implementer runs bare `deno test` | Medium (verified to fail without it) | §4.3 gives the exact line-35 diff; §9.1 runs `deno task test`, never bare `deno test` |
| `deno.lock` not committed, so CI/clean builds fail | Medium | §9.1 step 6 explicitly diffs the lock |
| Hue `null` mishandled → `TS2322`, or `null` leaking into the returned object | Medium (the compiler catches it, but only if the return type is declared) | §3.4 mandates `?? 0` + a declared return type; §8.1 asserts the achromatic rows exactly |
| Chroma/hue semantics misread (treating C as CIE chroma, or L as 0–100) and a caller divides/multiplies wrongly | Low, one caller, no arithmetic on C or H | §2.2 documents that no code reads C or H; §3.1 fixes the ranges; old thresholds are deleted, not converted |
| `toGamut()` mutation corrupting a shared color object | Low (fresh literal per call) | §6.2 explains the mutation and why the wrapper never accepts an object |
| Bundle-size regression vs the class-based API if someone "simplifies" the import | Low | §9.3 measurement; the import map pins `fn` |

### 10.2 Compatibility considerations

- **OKLCH semantics change, not just units.** Do not scale old values. Any stored
  artwork data is untouched: only the thumbnail's text color is computed, nothing is
  serialized.
- **CSS `oklch()` vs `lch()`.** `oklch()` is supported in all current evergreen
  browsers (Chrome 111+, Safari 16.4+, Firefox 113+), the same generation that supports
  `lch()`. The project already relies on modern CSS and Deno; a graceful-degradation
  concern for very old browsers applies equally to the current `lch()` string and is
  not a new class of risk. If the project ever needs to support such a browser, the
  fallback would be to emit an `rgb()` string for the text color — a separate decision,
  not part of this migration.
- **Rounding.** The old code rounded to an integer 0–100 for CSS; the new value is a
  0–1 float emitted as-is. Rounding on the OKLCH scale would collapse nearly every
  background to `0` or `1`, which is why it is dropped (§5, step 4).
- **`--allow-env=NODE_ENV`** slightly widens the test task's permissions. It is the
  narrowest grant that works (verified), and `NODE_ENV` carries no secret.
- **Node/npm shim.** Color.js reads `process.env.NODE_ENV` at import time. In the
  browser bundle this is a no-op on `globalThis.process`; under Deno tests it requires
  the permission above. No other Node API is touched.

### 10.3 Rollback strategy

The change is small, self-contained, and reversible in one step:

- `git revert` the migration commit(s). Because the only behavioral consumer is the
  thumbnail text color and nothing is persisted, a revert restores the previous look
  exactly, with no data migration or cache to invalidate.
- If a revert must be split: reverting only `group-colors-generator.ts` (restoring the
  import to `rgb-to-lch.ts` and the `lch()` strings) leaves the new modules present but
  dead, which still type-checks as long as `deno.jsonc` keeps their import-map entries.
- Removing `colorjs.io` from `deno.jsonc` after a revert must be paired with restoring
  `deno.lock` (`git checkout deno.lock`) and dropping `--allow-env=NODE_ENV` from the
  test task, or the lock and permissions drift.
- No feature flag is proposed: the behavior is a single text color, and a flag would
  add more machinery than the thing it guards.

## 11. Official technical references

- Color.js procedural API — https://colorjs.io/docs/procedural
  (documents the `colorjs.io/fn` import and `ColorSpace.register(sRGB)` usage that
  §3.3 is based on; note the docs' own example registers each space explicitly.)
- Color.js gamut mapping — https://colorjs.io/docs/gamut-mapping
  (documents the CSS Color 4 binary-search method, the deltaE/JND comparison, and the
  `L >= 1` → white / `L <= 0` → black behavior cited in §6.2.)
- Color.js v0.7.1 `toGamut` source — https://github.com/color-js/color.js/blob/v0.7.1/src/toGamut.js
  (source of the return-in-input-space and mutation behavior verified in §6.2.)
- Color.js v0.7.1 procedural exports — https://github.com/color-js/color.js/blob/v0.7.1/src/index-fn.js
  (named exports `to`, `toGamut`, `ColorSpace`, `sRGB`, `OKLCH` used in §5.)
- Color.js v0.7.1 `spaces/index-fn.js` — https://github.com/color-js/color.js/blob/v0.7.1/src/spaces/index-fn.js
  (the `OKLCH`/`sRGB` named exports.)
- Color.js v0.7.1 `spaces/lch.js` — https://github.com/color-js/color.js/blob/v0.7.1/src/spaces/lch.js
  (the `isAchromatic → h = null` rule behind §3.4.)
- Color.js v0.7.1 `defaults.js` — https://github.com/color-js/color.js/blob/v0.7.1/src/defaults.js
  (the `process.env.NODE_ENV` read behind §4.3.)
- npm registry, `colorjs.io` dist-tags — https://registry.npmjs.org/colorjs.io
  (`latest: 0.7.1`, published 2026-07-24; confirms §4.1's version choice.)
- Deno configuration and import maps — https://docs.deno.com/runtime/reference/deno_json/
  (the `imports` map merged in §4.2.)
- Björn Ottosson, "Calculate OKLab coordinates and sRGB for a color" —
  https://bottosson.github.io/posts/oklab/
  (the independent formula set used to cross-validate the §8.1 fixtures.)
- CSS Color 4 gamut mapping — https://drafts.csswg.org/css-color/#css-gamut-mapping
  (the algorithm Color.js implements as `method: "css"`.)

## 12. Decisions requested from the human

Per AGENTS.md §2 the human is the decision-maker; this plan stops here.

1. **Approve the OKLCH threshold of 0.5 with offset 0.5** (§3.5), knowing that
   backgrounds in the gray-100–120 band (and perceptual neighbors such as
   `#008000`) get the opposite text color from today — one flip, green, is arguably
   an improvement.
2. **Approve the `colorjs.io@0.7.1` dependency** (AGENTS.md §5: no new dependencies
   without justification, and the justification is §4.1 + §9.3's measured cost).
3. **Choose (A) or (B) in §8.3** for testing the foreground decision. Recommended:
   **(B)**, extract `getTextLightness` into `src/js/color-formatter/text-lightness.ts`
   — a pure move, but it is a structural change and needs the human's blessing.
4. **Approve the `--allow-env=NODE_ENV` change to `deno task test`** (§4.3). It is
   forced by the import, but it widens a permission.
5. **Approve the credit updates** (§5 step 7), or state that the licenses page should
   not list colorjs.io.

No application code has been changed in preparing this plan.

---

## Appendix — Approval record (2026-10-11)

All five items in §12 were approved by the human on 2026-10-11. Item 3 was decided in
favor of **(B)**: extract `getTextLightness` into
`src/js/color-formatter/text-lightness.ts`. Items 1, 2, 4, and 5 were approved as
written. The plan is approved for implementation; §8.3 now documents the chosen
approach rather than a choice.

**Implementation notes for the agent, flowing directly from these approvals:**

- The extraction in §8.3 is a *pure move plus the scale change*. Keep the function's
  name, signature, and JSDoc, and keep the legacy `Number()` coercion and its comment —
  those are the existing behavior, not leftovers.
- `group-colors-generator.ts` imports `getTextLightness` (not `rgbToOklch`) after the
  move; confirm the now-unused `rgbToOklch` import is removed there.
- `deno.jsonc` gains a fourth `color-formatter/*` entry,
  `color-formatter/text-lightness`, and the `test` task gains
  `--allow-env=NODE_ENV` (both counted in §7's file table).
- §8.5's acceptance criteria are unchanged and binding; the gray-100–120 flip and the
  `#008000` flip from §3.5 are expected outcomes, not regressions to be "fixed".

The plan above is now the authoritative specification; nothing in this appendix
changes its technical content.
