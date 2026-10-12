# Plan — `Base colors:` dropdown: `Original line colors` / `Current line colors`

Date: 2026-10-13 Scope: **planning only**. No application code is changed by
this document.

Follow-up to `docs/plans-archived/randomize-line-colors-in-oklch.md`, whose §4.6
specified a `Base colors:` dropdown that **was never built**. This plan
implements that dropdown with the two values decided there, and supersedes §4.6
and §5.2 of the archived plan.

---

## 1. Objective

Add a **`Base colors:`** dropdown to the _Lines_ tab's `Color randomization:`
panel, choosing which of the two sets of line colors the L/C/H ranges are
applied around.

| Value                              | Anchor                                                                         | Drifts on repeated clicks? |
| ---------------------------------- | ------------------------------------------------------------------------------ | -------------------------- |
| `Original line colors` _(default)_ | the artwork's own `<g stroke>` values, **ignoring** any `groupColors` override | No                         |
| `Current line colors`              | the `groupColors` value — which is also always the live `#svg-string` value    | **Yes**                    |

The default is `Original line colors`. Changing it requires the user to select
`Current line colors`; nothing forces it.

### 1.1 There are only two sets of colors, not three

This is the point the previous draft of this plan got wrong, so it is stated
first and proved.

The artwork's own line colors, and the value `groupColors` overwrites them with,
are the only two color states that exist. There is no third "live" state waiting
independently between them, because **the live `#svg-string` is always equal to
`groupColors`**:

| Claim                                                                     | Evidence                                                                                                                                                                                                                                              |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The textarea cannot be edited by hand                                     | `readonly` — `src/index.html:441`                                                                                                                                                                                                                     |
| Only two operations change a stroke: the Alwan picker, and the randomizer | `updateSvgWithNewColorValue()` (`group-colors-listener.ts`) and `randomizeEveryGroupColor()` (`randomize-group-colors.ts`)                                                                                                                            |
| Both write `groupColors` back to the URL                                  | `group-colors-listener.ts:158` and `randomize-group-colors.ts:153`, each `updateState("groupColors", getGroupColorsAsJoinedHex(updatedSvg))`                                                                                                          |
| Every other textarea writer preserves strokes                             | `path-mode.ts:162` `recoverCurrentGroupColorsValues()` re-emits the stroke unchanged; `opacity-steps.ts:197` reads the stroke back out of the thumbnail and re-emits it; `color-format.ts` only rewrites the hex ↔ `rgb()` spelling of the same color |

So `Current line colors` **is** the `groupColors` value. It needs no stored
snapshot of its own — it is read at click time. Only `Original line colors`
needs state, because it must be captured before the override is applied.

_One caveat, stated for accuracy:_ the invariant holds for **stroke** only.
Changing `Opacity steps` rewrites the live SVG without calling
`updateState("groupColors", …)`, so the opacity bytes in the URL can go stale.
That does not affect anchoring, which only reads strokes.

### 1.2 What already ships, and what does not

Verified in the repository.

**Shipped** (`src/js/page-specific/index/tab-lines/randomize-group-colors.ts`):

- The `Randomize colors` button, the three range controls, and the
  `Distribution:` dropdown (`#randomization-distribution`).
- One snapshot, `originalGroupStrokes` (line 35), filled by
  `rememberOriginalGroupStrokes()` (line 37) from the decoded `groupColors`
  array.
- A fallback at line 104: `originalGroupStrokes ?? matches.map(…)`.

**Not shipped:** no `Base colors:` dropdown, no `resolveAnchorStrokes()`, no
`BaseMode` type, and no test anywhere covering which colors are chosen.

Note also that archived §4.5 is stale against the shipped UI — the ranges are
now number inputs with `-`/`+` buttons, not sliders with a readout `<span>`.
This plan is written against the shipped code, not the archived prose.

### 1.3 The bug this fixes

The snapshot is captured from `groupColors`, and its only call site is inside
`if (groupColors) { … }` (`apply-url-state.ts:99`). Neither showcase artwork's
URL carries a `groupColors` key, so the snapshot stays `null`, line 104's `??`
reads the live value instead — and the live value advances with every click,
because each click writes a new `groupColors`. Repeated clicks therefore
random-walk the palette:

```
roll 0 (artwork as decoded): rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 1:                      rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 2:                      rgb(219 144 175)  rgb(0 0 0)  rgb(255 255 255)
roll 3:                      rgb(193 158 177)  rgb(0 0 0)  rgb(255 255 255)
roll 4:                      rgb(212 150 160)  rgb(0 0 0)  rgb(255 255 255)
roll 5:                      rgb(214 152 143)  rgb(0 0 0)  rgb(255 255 255)
```

This is the drift the archived plan's §8.1 decision was meant to eliminate. Two
rules follow, and both are load-bearing:

1. **The artwork snapshot must be captured unconditionally**, before the
   override is applied. `svgString` in `applyImageCustomization()` is the
   decoded artwork and is never mutated — `let updatedSvg = svgString`, and the
   existing `generateGroupColorsHtmlElements(svgString, …)` at
   `apply-url-state.ts:71` already runs against it before `applyGroupColors`
   applies the override.
2. **A fallback must never be silent.** The line 104 `??` is precisely what let
   this ship unnoticed. With the snapshot unconditional, the fallback is not
   needed at all, and the new code should have no path that substitutes one
   anchor for another.

---

## 2. Naming

### 2.1 Label: `Base colors:`

Unchanged from the archived plan. A noun plus a colon, matching `Path mode:`,
`Opacity steps:`, `Color format:` and `Distribution:`. Considered and rejected:
`Anchor:` (jargon), `Randomize from:` (a verb phrase, against house style),
`Color source:` (accurate but abstract).

### 2.2 The two values

**`Original line colors`** — the artwork's own colors, ignoring any
`groupColors` override. "line colors" keeps the app's established term for these
values: the _Lines_ tab, the header's
`Color and two opacities for line groups:`, and the footer's
`id: stroke, opacity, stroke-opacity`.

**`Current line colors`** — the `groupColors` value. Kept as decided on
2026-10-13. It is worth being explicit about what "current" denotes, since it is
the one term in the panel that could be misread: it means the colors the URL
currently carries, _not_ an editable field. Per §1.1 it is always equal to what
is on screen, so nothing is lost by the name — and it is the name that pairs
correctly with `Original`.

No third value. A previous draft proposed `Imported line colors` as a third
option; that was wrong, because it denotes the same state as
`Current line colors` (§1.1). Two values only.

No palette- or permutation-flavoured wording is used, for the reasons recorded
in archived §3.1.

---

## 3. Parameters and labels

| # | Label           | Options (in order)                            | Default                |
| - | --------------- | --------------------------------------------- | ---------------------- |
| 1 | `Base colors:`  | `Original line colors`, `Current line colors` | `Original line colors` |
| 2 | `Distribution:` | `Uniform`, `Triangular`                       | `Uniform`              |

`Distribution:` is unchanged. The two are a pair: `Base colors:` chooses what
the draw is applied _around_, `Distribution:` chooses its _shape_.

---

## 4. Behavior

### 4.1 What each value draws from

- **`Original line colors`** — every click draws each group from the artwork's
  own color. Repeated clicks give a family of variations of the one palette the
  artwork defines, and never drift.
- **`Current line colors`** — every click draws from the colors the link
  currently carries. Each click therefore builds on the previous one, and
  repeated clicks walk the palette away from the original. This is a legitimate
  thing to want — "keep nudging from where I am" — but it is opt-in, and the
  footer states the difference in both directions.

### 4.2 Per-group anchoring is unchanged

Every group is anchored to **its own** color rather than to a shared value, so a
dark group stays dark and a light group stays light. At `Lightness range = 0`
the relative lightness ordering of the groups is preserved exactly, under either
base. The base choice changes only _which palette_ each group is anchored to.

### 4.3 Opacity, geometry, and the URL

Unchanged from the archived plan: opacity and stroke-opacity ride along
untouched, artwork geometry is untouched, and `randomizeOklch()` is not modified
— anchor selection is a DOM concern, and the OKLCH core has no notion of an
anchor.

### 4.4 `Base colors:` is not persisted

Same rule as the sliders and `Distribution:`, and the same reason: a shared link
must not behave differently for its recipient. Persisting it would give the
sharer (who set it) and the recipient (who gets the default) different anchor
families from one identical URL. Opening a link always yields
`Original line colors`.

---

## 5. Architecture

### 5.1 New DOM-free module

`src/js/color-formatter/resolve-anchor-strokes.ts` — the selection logic,
extracted so it can be tested. It currently has no home that is both DOM-free
and honest about what it is: `randomize-oklch.ts` is OKLCH mathematics and knows
nothing about anchors.

```ts
export type BaseMode = "original" | "current";

export function resolveAnchorStrokes(
  base: BaseMode,
  artworkLineStrokes: string[],
  currentLineStrokes: string[],
): string[];
```

Contract:

- `original` returns `artworkLineStrokes`, ignoring `currentLineStrokes`
  entirely.
- `current` returns `currentLineStrokes`.
- The returned set is checked against `currentLineStrokes.length`; a mismatch is
  an error, never a partial randomization.

`artworkLineStrokes` is deliberately **not** nullable: capture is unconditional
(§1.3), so the "missing anchor" case is designed out rather than handled by a
fallback. That is what removes the hazard that produced the drift.

_Alternative, smaller diff:_ put the function in `randomize-oklch.ts`. Not
recommended — it would put colour-string selection in the OKLCH maths module.

### 5.2 One snapshot, renamed

`rememberOriginalGroupStrokes()` becomes `rememberArtworkLineStrokes()` and
takes the decoded SVG string rather than the `groupColors` array:

```ts
function rememberArtworkLineStrokes(svgString: string): void {
  const strokes = regexMatchesOfGroupColors(svgString).map((match, gId) => {
    const stroke = getStroke(match);
    if (stroke === undefined) {
      throw new Error(
        `rememberArtworkLineStrokes: no stroke for group ${gId}: ${match}`,
      );
    }
    return stroke;
  });
  artworkLineStrokes = strokes;
}
```

It reuses `regexMatchesOfGroupColors` and `getStroke` from
`group-colors-svg/group-colors-svg` — no new parsing.

`Current line colors` needs no stored state: it is read from the textarea at
click time, which §1.1 establishes is always the `groupColors` value.

### 5.3 Capture unconditionally

In `apply-url-state.ts`, call it **before** the `if (groupColors) { … }` block,
and delete the existing call at line 99:

```ts
// Before the override is applied: the artwork's own line colors. Always
// available, and the anchor 'Original line colors' needs. Captured here rather
// than inside applyGroupColors() to keep that module free of a dependency back
// onto the randomizer.
rememberArtworkLineStrokes(svgString);
```

Deleting the line 99 call also removes the last use of the
`groupColorsByGroupsArr` snapshot, which is correct: that array was the wrong
anchor under decision 10.

No new import edge is created, so there is no `apply-group-colors` ↔
`randomize-group-colors` cycle.

### 5.4 Wire the dropdown

```html
<div class="setting-container">
  <div class="setting-item">
    <label for="randomization-base">Base colors: </label>
    <select name="randomization-base"
      id="randomization-base" autocomplete="off">
      <option value="original" selected>Original line colors</option>
      <option value="current">Current line colors</option>
    </select>
  </div>
</div>
```

Placed in `#color-randomization`, immediately after the `Distribution:` block so
the two dropdowns sit together and the three range controls stay contiguous.

No new CSS: this is a `<select>` in a `.setting-item`, not a sized element, so
the `box-sizing` caveat that affects sized controls inside a `<details>` does
not reach it.

Alongside the existing `readDistributionFromSelect()`:

```ts
function readBaseFromSelect(): BaseMode {
  const select = document.getElementById("randomization-base");
  // …
  return (select as HTMLSelectElement).value === "current"
    ? "current"
    : "original";
}
```

plus one `change` listener in `initRandomizeGroupColors()`. The listener does
not need to do anything beyond being read at click time — the base is applied
only when the button is pressed, so the two dropdowns need no cross-wiring.

### 5.5 Use it

In `randomizeEveryGroupColor()`, replace lines 101-112 with:

```ts
const currentStrokes = matches.map((match, gId) => {
  const stroke = getStroke(match);
  if (stroke === undefined) {
    throw new Error(
      `randomizeEveryGroupColor: could not parse a stroke at group ${gId}: ${match}`,
    );
  }
  return stroke;
});

if (artworkLineStrokes === null) {
  throw new Error("randomizeEveryGroupColor: artwork snapshot was never taken");
}

const anchors = resolveAnchorStrokes(
  readBaseFromSelect(),
  artworkLineStrokes,
  currentStrokes,
);
```

The existing `getStroke()` throw on an unparseable stroke stays; it is a real
parse failure, not a missing anchor.

### 5.6 Footer

`Usage` → `Additional Information:` gains a bullet stating what each value draws
from, phrased conditionally. An unconditional "repeated clicks give variations
of the same palette" is false once `Current line colors` is chosen, and a footer
that says something untrue is worse than no footer.

---

## 6. Tests

New `tests/resolve_anchor_strokes_test.ts`, DOM-free:

- **`original` ignores the current colors** — given two different inputs,
  `original` returns the artwork set. This is the headline assertion.
- **`current` ignores the artwork set** and returns the current set.
- **Group-count mismatch is rejected for both modes** — a wrong-length artwork
  set against a known group count is an error, not a partial randomization.
- **The returned array is not aliased to an input** — mutating the result must
  not corrupt the snapshot, or a later click would anchor on a mutated palette.

The existing `tests/randomize_oklch_test.ts` is unaffected: `randomizeOklch()`
does not change.

---

## 7. Verification

Run `deno task fmt`, `deno task lint`, `deno task check`, `deno task test` and
`deno task build`. Then, in a browser against the built `dist/`:

- **A URL without `groupColors`** (either showcase artwork): two consecutive
  `Randomize colors` clicks produce two _variations of the artwork's palette_.
  This is the drift case from §1.3 and it must now be fixed. Assert against the
  decoded palette, not eyeball it — a gray anchor moves in chroma and hue while
  its lightness stays pinned, so compare converted OKLCH, not the hex strings.
- **A URL carrying `groupColors`** (one randomize, then reload): selecting
  `Current line colors` re-randomizes around the imported palette, and
  `Original line colors` returns to the artwork's palette.
- No base-colors key appears in the query string after any of it.
- Opening the new panel still re-adjusts the layout at desktop widths.

---

## 8. Decisions

1. **The dropdown has exactly two values**: `Original line colors` (default) and
   `Current line colors` (§2.2). A third value was drafted and withdrawn: it
   denoted the same state as the second, because the live textarea is always the
   `groupColors` value (§1.1).
2. **The artwork snapshot is captured unconditionally, and no fallback
   substitutes one anchor for another** (§1.3). This fixes a shipped bug.
3. **`Current line colors` is retained as the second value's name**, per the
   human's decision on 2026-10-13. Its meaning — the colors the link currently
   carries — is documented in §2.2 so it is not misread as an editable field.
4. **The label `Base colors:` and the default (`Original line colors`) are
   unchanged** from archived §8.2 decision 11.
5. **The control is not persisted** to the URL (§4.4).

No open questions remain in this plan.

---

## 9. Risks

| Risk                                                                 | Mitigation                                                                                                                                       |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Current line colors` is a drifting mode and could read as a bug     | It is opt-in, not the default, and the footer states the difference in both directions (§5.6). The default never drifts                          |
| A fallback creeps back in, or someone reintroduces a null snapshot   | §1.3 rule 2 and §5.1 type `artworkLineStrokes` as non-nullable, so the missing-anchor case has to be handled explicitly rather than papered over |
| Anchor selection stays untested, and drifts again                    | §5.1 extracts it into a pure function and §6 requires a test per mode                                                                            |
| The archived plan still describes three anchors and one readout span | §5.2 of the archived plan is corrected separately; archived §4.5 remains stale and is out of scope here                                          |

## 10. Out of scope

- No change to `randomizeOklch()` or any other colour module.
- No URL keys.
- No per-group randomization, no "copy palette", no undo.
- No UI localization; the labels are English, like the rest of the app.
- Archived §4.5 (the live value readout) is left as written, though the shipped
  UI now uses number inputs. Correcting it is a separate, cosmetic edit.
