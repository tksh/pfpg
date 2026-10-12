# Plan — Randomizing group line colors in OKLCH

Date: 2026-10-11 Scope: **planning only**. No application code is changed by
this document. It follows the Color.js / OKLCH migration (plan:
`pfpg/docs/plans-archived/colorjs-oklch-migration.md`, commit `942a305`), whose
`oklchToRgb()` this feature is the first consumer of.

Related implementation (already merged): the migration added
`src/js/color-formatter/rgb-to-oklch.ts`, `oklch-to-rgb.ts`,
`colorjs-spaces.ts`, and `text-lightness.ts`. The gamut-mapped reverse direction
that made random hue generation possible exists precisely because of it.

---

## 1. Purpose

Add a control to the **Lines** tab that replaces every line group's color with a
new color generated at random, while keeping each color near its original
brightness.

The headline behavior, at the default settings, is: **lightness is preserved
exactly, chroma and hue vary.** The three sliders widen or narrow how far each
of the three OKLCH coordinates may wander from the original value.

A control that does this is the natural next step after the migration: random
hue rotation produces many out-of-sRGB-gamut colors, and `oklchToRgb()` already
maps them back with the CSS Color 4 algorithm instead of clipping them.

---

## 2. What already exists (verified in the repository)

Everything below was confirmed by reading the code, and is what the feature
reuses rather than rebuilds.

### 2.1 The color core (from the migration)

| Module                                     | Provides                                                                        |
| ------------------------------------------ | ------------------------------------------------------------------------------- |
| `src/js/color-formatter/rgb-to-oklch.ts`   | `rgbToOklch(r, g, b)` → `{lightness, chroma, hue}` from 8-bit sRGB              |
| `src/js/color-formatter/oklch-to-rgb.ts`   | `oklchToRgb(l, c, h)` → `{r, g, b}` via `toGamut({space:"srgb", method:"css"})` |
| `src/js/color-formatter/colorjs-spaces.ts` | registers `sRGB` + `OKLCH` once                                                 |

Both are DOM-free and unit-tested. The feature needs exactly this pair, plus one
new DOM-free function for the randomization itself.

### 2.2 The group-color pipeline

A color change currently flows like this (verified in
`src/js/page-specific/index/tab-lines/group-colors-listener.ts`):

1. `getSvgString()` reads the `<textarea id="svg-string">`.
2. `regexMatchesOfGroupColors()` finds every `<g ... stroke=...>` element
   (`GROUP_COLORS_ELEMENT_REGEX`).
3. `generateGroupColorsSvgTags(gId, [undefined, stroke, opacity, strokeOpacity])`
   rebuilds one `<g>` element.
4. `replaceAtIndex(svgString, pattern, newElem, gId)` swaps it in.
5. The textarea value is set, then
   `updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg))` persists
   it.
6. `executeSvg2png(...)` re-renders the PNG.

`updateSvgWithNewColorValue()` does steps 1–6 **for a single group**. The
randomizer is the first feature that changes **all groups at once**, so it needs
the multi-group equivalent. `applyGroupColors()` (`apply-group-colors.ts`)
already shows the shape of a multi-group rewrite and additionally calls
`generateGroupColorsHtmlElements(...)` to rebuild the pickers — which is what
the randomizer must do too, or the Alwan pickers will desync from the
thumbnails.

### 2.3 UI patterns to match

Verified in `src/index.html` and `src/css/index/style.css`:

- **Collapsible**: `<details id="lines-option-details" class="padding-top-1">`
  with
  `<summary class="font-size-small font-color-lighter">More settings:</summary>`,
  at line 74, inside `<div id="tab-1">`. (This summary text is renamed to
  `Artwork format:` by §7.3; the markup pattern it demonstrates is what matters
  here.)
- **Settings rows**: `.setting-container` > `.setting-item` with a
  `<label for="...">Label: </label>` and a control. Labels are `Noun:` and use
  the domain vocabulary of the app (`Path mode:`, `Opacity steps:`,
  `Color format:`).
- **Range input**: one exists today (`#png-size-range`, line 219), styled by
  `div.setting-item input[type="range"]` (line 297 of `style.css`), paired with
  `type="number"` + `-`/`+` buttons and `syncInputNumberAndRange()`.
- **Buttons**: `main button` supplies base styling; action buttons are plain
  verb phrases — `Download as PNG`, `Download as SVG`, `Clear and Reload`.
- **Secondary text**: `.font-size-small .font-color-lighter` is used for hint
  lines (e.g.
  `<i>id</i>: <i>stroke</i>, <i>opacity</i>, <i>stroke-opacity</i>`).

### 2.4 State contract

`VISUAL_CONFIG_DEFAULTS` in `src/js/constants.ts` (line 127) enumerates the URL
keys and carries the comment _"Do not reorder entries unless the canonical
format is intentionally changed."_ A manual color-picker change already
overwrites the `groupColors` URL entry via `history.replaceState`, so persisting
a color change is the established behavior — the randomizer inherits that, and
adds nothing new to the contract.

---

## 3. Naming

### 3.1 What the feature actually does (this is what a name has to be honest about)

It **generates new colors**, each one derived from its own group's current
color, bounded per-coordinate by the sliders. It does not rearrange an existing
palette.

That distinction decides most of the naming question, so it is worth stating
plainly:

- **"Shuffle" is a misnomer.** In every UI vocabulary the word implies
  _permuting a fixed set_ — the same N colors in a different order. This feature
  does not do that: it invents colors that are not in the current palette. A
  user who clicks "Shuffle" and gets a color that was never there before has
  been misled. **Recommend rejecting it.**
- **"Random" names the mechanism, not the action.** It is also already spoken
  for in this codebase: `main.ts` selects _a random artwork_ on page load when
  no query string is present. Two unrelated "random" behaviors in one app
  invites confusion.
- **"Shuffle"/"Random" both omit the defining trait**: the colors stay near the
  original lightness. That constraint is the whole point, and it is what the
  sliders expose.

### 3.2 Recommendation

| Element             | Recommended label          | Rationale                                                                                                                                                                                              |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Trigger button      | **`Randomize colors`**     | Verb phrase, matches the house style (`Download as PNG`, `Clear and Reload`). Says exactly what happens, no metaphor to misread.                                                                       |
| Collapsible summary | **`Color randomization:`** | Noun phrase with the colon the settings labels use; names the _group_ of controls, not the action.                                                                                                     |
| Runner-up (button)  | `Reroll colors`            | Shorter; the dice metaphor is genuinely apt — same anchors, a new roll — and it conveys repeatability ("roll again"). Rejected as primary because the metaphor may not land for a non-gaming audience. |

Also considered and rejected: `Recolor` (says nothing about randomness),
`New palette` (implies replacing the whole palette rather than varying each
color), `Variations` (accurate but not an action, so it reads oddly on a
button).

Note on Japanese, if the UI is ever localized: the English labels are what ship
today (the app's UI is English-only). Natural equivalents for reference would be
`ランダムに色を変更` for the button and `色のランダム化:` for the summary;
`シャッフル` should be avoided for the same permutation reason as its English
counterpart.

---

## 4. Parameters and labels

The model proposed in the request is adopted as-is, with concrete numbers: each
slider sets the **half-width of the random range** around the group's own
original coordinate. A value of **0 pins that coordinate to its original
value**; increasing it widens the range symmetrically. A fourth control chooses
the _shape_ of the draw (§4.3).

### 4.1 The three sliders

| # | Label              | Channel | Unit    | Min | Max | Step | Default  | At 0        | At max                  |
| - | ------------------ | ------- | ------- | --- | --- | ---- | -------- | ----------- | ----------------------- |
| 1 | `Lightness range:` | OKLCH L | — (0–1) | 0   | 1.0 | 0.01 | **0**    | L unchanged | L ± 1.0 → any lightness |
| 2 | `Chroma range:`    | OKLCH C | —       | 0   | 0.4 | 0.01 | **0.10** | C unchanged | C ± 0.4                 |
| 3 | `Hue range:`       | OKLCH H | degrees | 0   | 180 | 1    | **30**   | H unchanged | H ± 180° → any hue      |

**Why these maxima** — the maximum means "this coordinate may go anywhere the
channel allows," and with these three values that is true from **every** anchor:

| Channel   | Max  | Reaches the full channel from _every_ anchor?             |
| --------- | ---- | --------------------------------------------------------- |
| Lightness | 1.0  | **Yes** — `L ± 1.0 ⊇ [0, 1]` for any `L`.                 |
| Chroma    | 0.4  | **Yes** — for any anchor `C ≤ 0.4`, `C ± 0.4 ⊇ [0, 0.4]`. |
| Hue       | 180° | **Yes** — ±180° is a full turn of the wheel.              |

This is deliberate, so that the three sliders read the same way at their far
right: "anything goes." Lightness needed `1.0` rather than half the scale to get
there, because a _symmetric_ offset around an off-centre anchor otherwise clips
the far end — at the earlier value of `0.5`, a colour at L 0.3 could only reach
`[0.00, 0.80]`.

One honest caveat about lightness at `1.0`: because the offset is symmetric and
clamped, a **mid-lightness** colour already has the whole scale available from a
spread of `0.5` onward, so its top half of the slider is effectively saturated —
larger values buy reach only for colours near black or white. The slider is
therefore progressive for extreme colours and saturating for mid ones. This is
inherent to the symmetric-offset model and is accepted in exchange for the
consistent "max = total freedom" reading.

Chroma has no hard sRGB bound — the OKLCH reference range is `[0, 0.4]` — so it
is capped at **0.4**, the largest chroma value that means anything, and that cap
does deliver complete freedom. (The most chromatic sRGB color measures ≈ 0.32 at
magenta `rgb(255, 0, 255)`; anything above that is simply gamut-mapped back down
by `oklchToRgb()`, which is harmless.)

**Why these defaults** — `L = 0` is the headline promise made literally:
brightness is preserved exactly. `C = 0.10` and `H = 30` are chosen to produce a
clearly different but still tasteful palette: a muted red stays within a 60° hue
cone of itself and wobbles ±0.1 in chroma. Setting `H = 0` by default would make
the button look broken.

### 4.2 The slider semantics, precisely

For a group with original OKLCH `(L, C, H)` and slider values `(sL, sC, sH)`:

```
L' = clamp(L + O(-sL, +sL),  0, 1)
C' = clamp(C + O(-sC, +sC),  0, 0.4)
H' = wrap (H + O(-sH, +sH), 0, 360)
```

where `O(-x, +x)` is a draw from the distribution chosen in §4.3. Rounding is
deferred to the very end: `oklchToRgb()` rounds to bytes only after gamut
mapping, per the migration's contract. No intermediate rounding.

### 4.3 Distribution: uniform or triangular

A fourth control, a `<select>`, chooses the _shape_ of the draw. It is not a
slider, because it is a choice rather than a magnitude.

| Control  | Label           | Options                 | Default   |
| -------- | --------------- | ----------------------- | --------- |
| Dropdown | `Distribution:` | `Uniform`, `Triangular` | `Uniform` |

- **Uniform** — every value in `[-x, +x]` is equally likely. Matches the "widen
  the range by that amount" mental model directly, and is what the three-slider
  table describes.
- **Triangular** — values near each colour's original coordinate are much more
  likely than values at the edges of the range. Softer and more organic; small
  slider values stay subtle while large ones still reach the ends.

The draw, for `u1, u2 ~ U(0, 1)`:

```
Offset = (u1 + u2 − 1) · x        // triangular, peaked at 0, support [-x, +x]
Offset = (u1 − 0.5) · 2 · x       // uniform, support [-x, +x]
```

`u1 + u2` is already triangular on `[0, 2]`, so centring it and scaling by `x`
gives a symmetric triangular on `[-x, +x]` with its mode at the original value.
Applying the same distribution to all three channels keeps the result coherent;
mixing distributions per channel is deliberately not offered.

Like the sliders, this setting is ephemeral and is not written to the URL (§6) —
a shared link must not re-randomize. Opening the link always yields `Uniform`.

### 4.4 Hint text

A single hint line under the sliders, in the established secondary style:

```html
<p class="font-size-small font-color-lighter">
  0 keeps each color's original value; a larger value widens its random range.
</p>
```

This is what makes the three sliders self-explanatory, and it is the cheapest
way to teach the model without a tooltip system the app does not have.

### 4.5 Live value readout

Each range should show its current value, because `0`, `0.1`, `0.4`, and `30`
are not inferable from a thumb position. Recommended: a small `<span>` updated
on `input`, next to or under the label. `syncInputNumberAndRange()` in
`tab-render/sync-number-and-range.ts` already does number↔range sync, but it is
hardcoded to the `png-size-number`/`png-size-range` ids, so a small dedicated
readout is simpler than generalizing it.

---

## 5. Behavior specification

### 5.1 Per group

Every group is randomized **independently, anchored to its own original color**.
This is what "maintaining brightness" means in practice: a dark group stays dark
and a light group stays light, because each is perturbed around its own anchor
rather than around a global mean.

A direct consequence worth stating: **at `Lightness range = 0` the relative
lightness ordering of the groups is preserved exactly.** Only a non-zero
lightness spread can reorder groups. That is a useful property — the default is
structurally safe, and the slider is what trades safety for variety.

### 5.2 Anchor: the artwork's own line colors

> Corrected 2026-10-13. The text originally specified here — a snapshot taken
> from the decoded `groupColorsByGroups` array inside `applyGroupColors`, with
> the current-color anchor as a fallback — was wrong on both counts. See
> `docs/plans/base-colors-dropdown.md`, which supersedes this section and §4.6.

There are exactly **two** sets of line colors, not three:

| Anchor                  | Where it lives                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| **Artwork line colors** | the `<g stroke>` values in the decoded SVG, taken _before_ the `groupColors` override is applied |
| **Current line colors** | the `groupColors` value                                                                          |

There is no third "live" state waiting independently between them. The live
`#svg-string` is **always** equal to `groupColors`, because the textarea is
`readonly` (`src/index.html:441`), the only two operations that change a stroke
— the Alwan picker and the randomizer — both write `groupColors` back via
`updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg))`
(`group-colors-listener.ts:158`, `randomize-group-colors.ts:153`), and every
other writer recovers and re-emits strokes unchanged (`path-mode.ts:162`,
`opacity-steps.ts:197`). `color-format.ts` only rewrites the hex ↔ `rgb()`
spelling of the same color.

So `Current line colors` **is** the `groupColors` value, and it needs no stored
snapshot of its own. Only `Original line colors` needs state, because it must be
captured before the override is applied.

**Capture it unconditionally, from the decoded `svgString`, not from
`groupColorsByGroups`.** The `groupColorsByGroups` array is the wrong anchor: it
is the override, not the artwork. And capturing it conditionally — inside
`if (groupColors)`, as an earlier implementation did — leaves the snapshot
`null` on any URL without that key, so a fallback reads the live value, which
advances with every click, and repeated clicks random-walk the palette:

```
roll 0 (artwork as decoded): rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 1:                      rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 2:                      rgb(219 144 175)  rgb(0 0 0)  rgb(255 255 255)
roll 3:                      rgb(193 158 177)  rgb(0 0 0)  rgb(255 255 255)
roll 4:                      rgb(212 150 160)  rgb(0 0 0)  rgb(255 255 255)
roll 5:                      rgb(214 152 143)  rgb(0 0 0)  rgb(255 255 255)
```

A silent fallback is what let that ship unnoticed. With the artwork snapshot
taken unconditionally there is no missing-anchor case left to fall back from, so
the new code should have no path that substitutes one anchor for another.

_One caveat, for accuracy:_ the live-equals-`groupColors` invariant holds for
**stroke** only. Changing `Opacity steps` rewrites the live SVG without calling
`updateState("groupColors", …)`, so the opacity bytes in the URL can go stale.
That does not affect anchoring, which only reads strokes.

### 5.3 Achromatic colors

An achromatic group (a gray) has a `null` hue in Color.js, normalized to `0` by
`rgbToOklch()`. Hue randomization has **no visible effect** on such a group
unless the chroma spread is also non-zero, because **hue is meaningless when
chroma is zero**. So with `Chroma range = 0` and `Hue range = 180`, grays stay
gray — correct, but potentially surprising.

This is documented for the user rather than worked around: a new entry goes in
the footer's `Usage` → `Additional Information:` block (§7.5), which already
carries exactly this kind of per-option caveat (e.g. the `Path mode` and
`Height pixel size` notes).

### 5.4 What gets updated on each click

All of it, or the UI desyncs:

1. Rebuild every group's `<g>` element with the new stroke, via the existing
   `generateGroupColorsSvgTags` / `replaceAtIndex` path.
2. Write the new SVG into `<textarea id="svg-string">`.
3. `updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg))` — same
   contract as a manual color change, so a shared link and a reload both keep
   the result.
4. Rebuild the pickers with `generateGroupColorsHtmlElements(...)` so the Alwan
   pickers and the thumbnail text colors match the new strokes. _This is
   essential_: the Alwan instances hold their own color state and would
   otherwise show the old colors.
5. `executeSvg2png(...)` to re-render the preview.

Note that step 4 also recomputes the thumbnail text color through the (just
migrated) `oklch()`-based `getTextLightness()`, so nothing extra is needed
there.

### 5.5 What is _not_ done

- Opacity and stroke-opacity are untouched.
- The artwork geometry is untouched.
- No new URL keys are introduced (see §6).

---

## 6. State and URL: do not persist the sliders

Recommendation: **the three slider values and the distribution dropdown are
ephemeral and are not written to the URL.** Reasons, in order of weight:

1. **A shared link would re-randomize.** If the spreads lived in the URL,
   opening a shared link would re-roll colors on load, and the recipient would
   see different colors than the sharer did. That is a serious footgun for a
   tool whose whole premise is shareable artwork URLs (`?bits=...&g_...`).
2. **It changes the canonical format.** `VISUAL_CONFIG_DEFAULTS` is the URL
   contract and explicitly warns against reordering or changing it. Adding keys
   is a format change with a compatibility cost.
3. **They are exploration knobs, not artwork data.** The artwork is the colors
   themselves; the sliders are the _means_ of choosing them, like the position
   of a slider on any other control.

The _resulting colors_ do persist, via the existing `groupColors` key — which is
exactly how a manual color change behaves. Nothing new is added to the URL
contract.

The `Distribution` dropdown follows the same rule: opening a shared link always
yields `Uniform`, so the recipient sees exactly the palette that was shared.

---

## 7. Architecture

Follow the pattern the migration established for `getTextLightness`: put the
testable logic in a DOM-free module, keep the DOM wiring thin.

### 7.1 New DOM-free core

`src/js/color-formatter/randomize-oklch.ts`:

```ts
export type RandomSource = () => number;

export function randomizeOklch(
  lightness: number,
  chroma: number,
  hue: number,
  spread: { lightness: number; chroma: number; hue: number },
  random: RandomSource,
): { lightness: number; chroma: number; hue: number } {
  // U(-x, +x) draws, then clamp L to [0, 1], clamp C to [0, 0.4],
  // wrap H into [0, 360). No rounding here.
}
```

The injectable `random` is the important part: it is `Math.random` in production
and a deterministic function in tests, which makes the whole feature testable
without flakiness.

### 7.2 New DOM module

A sibling under `src/js/page-specific/index/tab-lines/`, e.g.
`randomize-group-colors.ts`, that reads the sliders, maps over every group
(`rgbToOklch` → `randomizeOklch` → `oklchToRgb` → hex/rgb string), performs
§5.4's five steps, and is wired to the button and to the range `input` events.
It imports only the existing pipeline functions listed in §2.2.

### 7.3 Markup and placement

**Placement: a sibling of the existing collapsible, not nested inside it.** The
feature is unlike the other entries — it _acts_ on the colors rather than
configuring how the lines are read and displayed — so it gets its own top-level
`<details>` in `<div id="tab-1">`, directly after the renamed existing one.

**Rename.** `More settings:` is too abstract to sit beside
`Color randomization:`. Recommended: **`Artwork format:`** — it uses the app's
own term for the decoded data ("Import artwork data from a URL..."), and the
three settings inside _are_ format choices: `Path mode` (how paths are emitted),
`Color format` (rgb vs hex), and `Opacity steps` (the granularity of the opacity
selectors, detected from the artwork).

Alternative names if you prefer: `Line format:` (shorter, ties to the tab name)
or `SVG output format:` (most literal, though it undersells `Opacity steps`).

Only the `<summary>` text changes — the `id="lines-option-details"` stays,
because `details-toggle-listener.ts` and the layout code reference it. Renaming
the id too is optional and mechanical.

```html
<div id="tab-1" class="tab-content">
  <!-- Lines -->
  ... group color pickers ...

  <details id="lines-option-details" class="padding-top-1">
    <summary class="font-size-small font-color-lighter">
      Artwork format:
    </summary>
    <div id="lines-options" class="padding-left-1">
      <!-- Path mode, Opacity steps, Color format — unchanged -->
    </div>
  </details>

  <!-- NEW: sibling, not nested -->
  <details id="color-randomization" class="padding-top-1">
    <summary class="font-size-small font-color-lighter">
      Color randomization:
    </summary>

    <div class="padding-left-1">
      <div class="setting-container">
        <div class="setting-item">
          <button type="button" id="randomize-colors">Randomize colors</button>
        </div>
      </div>

      <div class="setting-container">
        <div class="setting-item flex-direction-column">
          <label for="lightness-range">Lightness range: </label>
          <input type="range" id="lightness-range"
            min="0" max="1" step="0.01" value="0">
          <span id="lightness-range-value">0</span>
        </div>
      </div>

      <!-- Chroma range, then Hue range, in the same shape -->

      <div class="setting-container">
        <div class="setting-item">
          <label for="randomization-distribution">Distribution: </label>
          <select name="randomization-distribution"
            id="randomization-distribution">
            <option value="uniform" selected>Uniform</option>
            <option value="triangular">Triangular</option>
          </select>
        </div>
      </div>

      <p class="font-size-small font-color-lighter">
        0 keeps each color's original value; a larger value widens its random
        range. Hue has no effect on gray, whose chroma is zero.
      </p>
    </div>
  </details>
</div>
```

The hint text now carries the achromatic caveat too, so it is discoverable at
the point of use as well as in the footer (§7.5).

**Layout listener.** `initOptionDetailsToggleListener()` in
`tab-lines/details-toggle-listener.ts` binds to `#lines-option-details` alone
and calls `adjustLayoutIfNotMobile("detailsOpened")` on toggle. Because the new
`<details>` is now a _sibling_ at the same level, extend that function to attach
the same handler to both ids (a two-element list, or a shared class) — otherwise
opening the new panel in a narrow viewport will not re-adjust the layout.

### 7.4 Tests

New `tests/randomize_oklch_test.ts`, DOM-free, with an injected `random`:

- **Spread 0 is the identity** — all three spreads 0 must return the input
  coordinates exactly (modulo float), which is the invariant the whole feature
  rests on.
- **Bounds** — for a sweep of anchors and spreads, `L' ∈ [0, 1]`,
  `C' ∈ [0, 0.4]`, `H' ∈ [0, 360)`, and all finite.
- **Clamping** — an anchor near `L = 0` or `L = 1` with a large spread never
  escapes the range; hue wraps rather than clamping.
- **Determinism** — a fixed `random` gives a fixed, asserted result, proving the
  mapping is exactly the intended affine-offset one and not something else.
- **Round trip** — `oklchToRgb(randomizeOklch(...))` yields bytes in `[0, 255]`
  for a sweep of anchors/spreads, covering the gamut-mapping path this feature
  actually exercises.
- **Achromatic anchor** — a gray anchor with `Hue range > 0` and
  `Chroma range = 0` stays gray.
- **Distribution shape** — with `random` fixed, assert that `uniform` and
  `triangular` produce the documented offsets from the same draws (the two
  formulas in §4.3), so the dropdown really selects between them. And a
  distribution sweep over many draws confirms the triangular mode sits at the
  original value (offsets cluster near 0) while the uniform one does not.

### 7.5 The `Usage` → `Additional Information:` entry

Add one entry to the existing block in `src/index.html`, matching the shape of
the `Path mode` and `Height pixel size` notes already there:

```html
<dl>
  <dt>Effect of the <i>Color randomization</i> options (in <i>Lines</i> tab):</dt>
  <dd>
    <ul>
      <li><i>Hue range</i> has no visible effect on gray, because hue is meaningless
        when chroma is zero — raise <i>Chroma range</i> as well to change a gray's
        color.</li>
    </ul>
  </dd>
</dl>
```

---

## 8. Decisions (resolved 2026-10-11)

All five items were decided by the human, plus four further changes requested at
the same time. They are recorded here so the plan is now specification, not
proposal.

1. **Anchor (§5.2)** — **randomize from the original artwork colors.** Repeated
   clicks therefore produce a family of variations of the one palette, never
   drifting into noise. Implementation consequence: the original palette must be
   captured once, at decode time in `applyGroupColors` (via
   `groupColorsByGroups`), and held somewhere the randomizer can read; every
   click draws from that snapshot rather than from the current,
   already-randomized colors.
2. **Naming (§3.2)** — `Randomize colors` (button) / `Color randomization:`
   (summary), as recommended.
3. **Defaults (§4.1)** — `L = 0`, `C = 0.10`, `H = 30`, and
   `Distribution = Uniform`, as recommended.
4. **Chroma maximum (§4.1)** — `0.4`, as recommended.
5. **Distribution** — added as a user-switchable dropdown (`Uniform` /
   `Triangular`), defaulting to `Uniform` (§4.3). Not merely fixed to one of the
   two.

Further changes decided at the same time:

6. **Lightness maximum raised from `0.5` to `1.0`** (§4.1), so that all three
   sliders read the same way at their far right — "the coordinate may go
   anywhere." The known trade-off (a mid-lightness colour saturates in the
   slider's upper half) is accepted and documented in §4.1 rather than designed
   around.
7. **Placement** — as a sibling of the existing collapsible in the Lines tab,
   _not_ nested inside it, because the feature acts on the colors rather than
   configuring the lines' format (§7.3).
8. **Rename `More settings:` → `Artwork format:`** (§7.3), because the old name
   was too abstract to sit beside `Color randomization:`. Only the `<summary>`
   text changes.
9. **Achenotic-hue note in the footer** — `Usage` → `Additional Information:`
   gains an entry stating that hue is meaningless when chroma is zero (§7.5),
   and the same caveat goes in the in-panel hint text.

No open questions remain in this plan.

## 9. Out of scope

- The randomization trigger button itself is the only new control; no "randomize
  opacity", no per-group randomization, no "copy palette" action.
- No undo stack. The app has none today; the only way back is another randomize,
  a manual color edit, or the category reset modal — exactly as with a manual
  color change.
- No new URL keys (§6).
- No changes to `oklchToRgb()` / `rgbToOklch()` themselves; they are already
  tested and this feature only consumes them.
- No UI localization; the labels are English to match the rest of the app.

---

## 10. Risks

| Risk                                                                          | Mitigation                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anchoring to the original palette needs state the app does not currently hold | §8.1 — capture the snapshot once at decode time in `applyGroupColors`; if that proves awkward, the current-color anchor is a known fallback with the drift caveat documented |
| Grays appear not to respond to the hue slider                                 | §5.3; the default chroma spread of 0.10 means this only bites at `Chroma range = 0`. Called out in the in-panel hint and the footer's `Additional Information:` entry (§7.5) |
| Alwan pickers desync after randomization                                      | §5.4 step 4 is mandatory — rebuild the pickers, not just the thumbnails                                                                                                      |
| Out-of-gamut results look wrong                                               | `oklchToRgb()` uses the CSS algorithm by design; a large chroma spread is the only way to produce them, and the migration's tests already cover that path                    |
| Sliders persist and a shared link re-randomizes                               | §6 — do not add URL keys                                                                                                                                                     |
| The new sibling `<details>` does not re-adjust the layout on mobile           | §7.3 — extend the existing layout-adjust listener to both ids                                                                                                                |
| Lightness slider's upper half feels dead for mid-lightness colors             | §4.1 — inherent to the symmetric-offset model; accepted as the cost of "max = total freedom"                                                                                 |
