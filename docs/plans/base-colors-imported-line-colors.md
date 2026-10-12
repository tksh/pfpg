# Plan — `Base colors:` dropdown, with a `Imported line colors` option

Date: 2026-10-13 Scope: **planning only**. No application code is changed by
this document.

This is the third plan for the line-color randomizer, and it supersedes
`docs/plans-archived/randomize-line-colors-in-oklch.md` §4.6, which specified a
`Base colors:` dropdown that **was never built**. It also reverses that plan's
§8.2 decision 12, which rejected a third anchor. §8 below records why.

---

## 1. Objective

Add a **`Base colors:`** dropdown to the _Lines_ tab's `Color randomization:`
panel, letting the user choose which set of colors the L/C/H ranges are applied
_around_.

Three values, and the new one is the third:

| Value                              | Anchor                                                                         | Drifts? |
| ---------------------------------- | ------------------------------------------------------------------------------ | ------- |
| `Original line colors`             | the artwork's own `<g stroke>` values, **ignoring** any `groupColors` override | No      |
| **`Imported line colors`** _(new)_ | the palette the link carries in `groupColors` — what the page showed on load   | No      |
| `Current line colors`              | whatever is in `#svg-string` at click time                                     | **Yes** |

Default remains `Original line colors`.

### 1.1 What already ships, and what does not

Verified in the repository. This matters because the archived plan reads as if
the dropdown exists. It does not.

**Shipped** (`src/js/page-specific/index/tab-lines/randomize-group-colors.ts`):

- The `Randomize colors` button, the three range controls, and the
  `Distribution:` dropdown (`#randomization-distribution`).
- One snapshot, `originalGroupStrokes` (line 35), filled by
  `rememberOriginalGroupStrokes()` (line 37) from the decoded `groupColors`
  array.
- A fallback at line 104: `originalGroupStrokes ?? matches.map(…)`.

**Not shipped:**

- No `Base colors:` dropdown, no `resolveAnchorStrokes()`, no `BaseMode` type.
- No test anywhere covering which colors are chosen as the anchor.

Note also that archived §4.5 is stale against the shipped UI: the ranges are now
number inputs with `-`/`+` buttons, not sliders with a readout `<span>`. This
plan is written against the shipped code, not the archived text.

### 1.2 A live bug this plan fixes

The snapshot is only ever filled from `groupColors`, and the call site is inside
`if (groupColors) { … }` (`src/js/page-specific/index/state/apply-url-state.ts`
line 99). Neither showcase artwork's URL carries a `groupColors` key, so the
snapshot is `null`, line 104's `??` takes the fallback, and **the anchor is the
current colors — so repeated clicks random-walk the palette**:

```
roll 0 (artwork as decoded): rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 1:                      rgb(170 170 170)  rgb(0 0 0)  rgb(255 255 255)
roll 2:                      rgb(219 144 175)  rgb(0 0 0)  rgb(255 255 255)
roll 3:                      rgb(193 158 177)  rgb(0 0 0)  rgb(255 255 255)
roll 4:                      rgb(212 150 160)  rgb(0 0 0)  rgb(255 255 255)
roll 5:                      rgb(214 152 143)  rgb(0 0 0)  rgb(255 255 255)
```

Two rules fall out, and both are load-bearing:

1. **The artwork snapshot is captured unconditionally.** `svgString` in
   `applyImageCustomization()` is the decoded artwork and is never mutated —
   `let updatedSvg = svgString` and the existing
   `generateGroupColorsHtmlElements(svgString, …)` at line 71 both run against
   it before `applyGroupColors` applies the override. So the artwork colors are
   always available, and the default mode can always be honoured.
2. **A fallback must never be silent.** The line 104 `??` is what let this ship
   unnoticed. A requested anchor that cannot be resolved is an error, not a
   substitution.

---

## 2. Naming

### 2.1 The new value: `Imported line colors`

The app's own verb for loading artwork from a URL is _import_ — the footer's
basic flow opens with "Import artwork data from a URL containing a query
string." So `Imported line colors` names exactly what the value is: the palette
this link was loaded with.

"line colors" keeps the app's established term for these values — the _Lines_
tab, the header's `Color and two opacities for line groups:`, and the footer's
`id: stroke, opacity, stroke-opacity`.

**Rejected: `Shared line colors`.** This was the name used when the option was
considered and declined on 2026-10-13. It reads as "colors shared between
groups" far more readily than "colors shared via a shared link", and the panel
already has several controls sitting next to one another over a row of line
groups. "Imported" is unambiguous and already in the app's vocabulary.

### 2.2 Label: `Base colors:`

Unchanged from the archived plan. A noun plus a colon, matching `Path mode:`,
`Opacity steps:`, `Color format:` and `Distribution:`. Considered and rejected:
`Anchor:` (jargon), `Randomize from:` (a verb phrase, against house style),
`Color source:` (accurate but abstract).

### 2.3 Option order

`Original line colors` → `Imported line colors` → `Current line colors`.

The three form a progression from most abstract to most immediate: what the
artwork defines, then what the link overrode it with, then what is on screen
right now. The first two never drift; the third does.

### 2.4 Why this reverses decision 12

Archived decision 12 rejected this option, on the grounds that decision 10 had
already settled the anchor question and that an option for a distinction which
exists only when a `groupColors` key happens to be present is more confusion
than it is worth.

Both objections are answerable rather than fatal, which is why this plan
proposes it again:

- **The sharing argument was always real.** If a sharer hand-picks a palette and
  shares the link, a recipient who clicks `Randomize colors` arguably deserves
  variations of the palette they were _looking at_, not of the artwork's base
  colors. Archived decision 10 answered "what does _Original_ mean"; it never
  answered "what should a recipient of a shared link get.", and the archived
  plan's own §6 reasoning — that a shared link must behave identically for
  sharer and recipient — is about _not_ persisting settings, not about ignoring
  what the recipient can already see.
- **The "only sometimes exists" objection is a UI problem with a known fix.**
  The option is hidden when unavailable (§4.3). It never has to be presented and
  then fail.

The cost is real and should be stated plainly: **three options is more to read
than two**, and two of the three are equivalent whenever the link carries no
`groupColors` key — which, for a freshly shared link, is the common case. The
user gets nothing in that case beyond the reassurance that the option was there.

---

## 3. Parameters and labels

| # | Label           | Options (in order)                                                    | Default                |
| - | --------------- | --------------------------------------------------------------------- | ---------------------- |
| 1 | `Base colors:`  | `Original line colors`, `Imported line colors`, `Current line colors` | `Original line colors` |
| 2 | `Distribution:` | `Uniform`, `Triangular`                                               | `Uniform`              |

`Distribution:` is unchanged and stays a separate dropdown. The two are a pair:
`Base colors:` chooses what the draw is applied _around_, `Distribution:`
chooses its _shape_.

---

## 4. Behavior

### 4.1 What each value draws from

- **`Original line colors`** — the artwork's own colors. Repeated clicks give a
  family of variations of the one palette the artwork defines. A `groupColors`
  value in the URL is an override and is deliberately ignored.
- **`Imported line colors`** — the palette this link carries. Repeated clicks
  give variations of the palette the page was opened with, discarding any manual
  edit or randomization made _in this session_, but keeping the sharer's choice.
- **`Current line colors`** — draws from the colors on screen, so each click
  builds on the last. Drifts.

### 4.2 When `Imported line colors` is not available

It is unavailable exactly when the URL carries no `groupColors` key, because
then the imported palette _is_ the artwork palette and the option would be a
no-op duplicate of `Original line colors`.

**Hide the option.** Do not show it disabled, and do not fall back. A disabled
control that silently cannot do what it says is worse than an absent one, and a
fallback to `Original` would reintroduce exactly the silent substitution that
caused §1.2.

The decision is made once at init from whether the shared snapshot exists, and
recorded in the `resolveAnchorStrokes()` call site as an unreachable branch
rather than a runtime surprise.

### 4.3 Opacity, geometry, and the URL

Unchanged from the archived plan: opacity and stroke-opacity ride along
untouched, artwork geometry is untouched, `randomizeOklch()` is not modified
(anchor selection is a DOM concern; the OKLCH core has no notion of an anchor),
and no URL key is added.

### 4.4 `Base colors:` is not persisted

Same rule as the sliders and `Distribution:`, and the same reason — a shared
link must not behave differently for its recipient. Persisting it would give the
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
export type BaseMode = "artwork" | "imported" | "current";

export type AnchorSnapshots = {
  artwork: string[] | null;
  imported: string[] | null;
};

export function resolveAnchorStrokes(
  base: BaseMode,
  snapshots: AnchorSnapshots,
  liveStrokes: string[],
): string[];
```

Contract:

- `artwork` returns `snapshots.artwork`; it ignores `imported` and `liveStrokes`
  entirely.
- `imported` returns `snapshots.imported`, and **throws** when it is `null`.
  Never substitutes.
- `current` returns `liveStrokes`, ignoring both snapshots.
- Every returned set is checked against `liveStrokes.length`. A mismatch is an
  error, never a partial randomization.

_Alternative, smaller diff:_ put the function in `randomize-oklch.ts`. Not
recommended — it would put colour-string selection in the OKLCH maths module.

### 5.2 Two snapshots replace one

In `randomize-group-colors.ts`, replace the single `originalGroupStrokes` with:

```ts
let artworkLineStrokes: string[] | null = null;
let importedGroupStrokes: string[] | null = null;
```

and rename `rememberOriginalGroupStrokes` → `rememberImportedGroupStrokes`. Its
behaviour is unchanged; only its meaning is clarified, from "the" anchor to "the
`Imported line colors` anchor".

### 5.3 Capture both, unconditionally

In `apply-url-state.ts`:

- **Before** `if (groupColors) { … }`: capture the artwork colors from the
  `svgString` parameter, using the existing
  `regexMatchesOfGroupColors(svgString)` and `getStroke()` from
  `group-colors-svg/group-colors-svg`. Always available.
- **Inside** `if (groupColors) { … }`: keep the existing call at line 99,
  renamed.

```ts
// Before the override is applied: the artwork's own line colors. Always
// available, and the anchor 'Original line colors' needs.
rememberArtworkLineStrokes(svgString);
```

No new import edge is created, so there is no `apply-group-colors` ↔
`randomize-group-colors` cycle. (The existing capture deliberately lives in the
caller rather than inside `applyGroupColors()` for that reason.)

### 5.4 Wire the dropdown

```html
<div class="setting-container">
  <div class="setting-item">
    <label for="randomization-base">Base colors: </label>
    <select name="randomization-base"
      id="randomization-base" autocomplete="off">
      <option value="artwork" selected>Original line colors</option>
      <option value="imported">Imported line colors</option>
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

In the module, alongside the existing `readDistributionFromSelect()`:

```ts
function readBaseFromSelect(): BaseMode {
  const select = document.getElementById("randomization-base");
  // …
  return select.value === "imported"
    ? "imported"
    : select.value === "current"
    ? "current"
    : "artwork";
}
```

plus one `change` listener in `initRandomizeGroupColors()`, and one
`hideUnavailableBaseOptions()` call at init that removes the `imported` option
when `importedGroupStrokes === null`.

### 5.5 Use it

In `randomizeEveryGroupColor()`, replace lines 101-112 with:

```ts
const liveStrokes = matches.map((match, gId) => {
  const stroke = getStroke(match);
  if (stroke === undefined) {
    throw new Error(/* … */);
  }
  return stroke;
});

const anchors = resolveAnchorStrokes(
  readBaseFromSelect(),
  { artwork: artworkLineStrokes, imported: importedGroupStrokes },
  liveStrokes,
);
```

The existing `getStroke()` throw on an unparseable stroke stays; it is a real
parse failure, not a missing anchor.

### 5.6 Footer

`Usage` → `Additional Information:` gains a bullet stating what each value draws
from, phrased conditionally — an unconditional "repeated clicks give variations
of the same palette" is false once `Current line colors` is chosen, and a footer
that says something untrue is worse than no footer.

---

## 6. Tests

New `tests/resolve_anchor_strokes_test.ts`, DOM-free:

- **`artwork` ignores everything else** — given all three inputs present and
  mutually different, `artwork` returns the artwork snapshot. This is the
  headline assertion.
- **`imported` returns the imported snapshot** — same inputs.
- **`imported` throws when the snapshot is `null`** — the regression guard for
  §1.2. It must _not_ return the artwork snapshot or the live strokes.
- **`current` ignores both snapshots** and returns the live strokes.
- **Group-count mismatch is rejected** for every mode — an artwork snapshot or
  live set of the wrong length is an error, not a partial randomization.
- **`artwork` with a `null` snapshot throws**, even though §5.3 makes it
  unreachable in practice. A guard with no test is a guard that rots.

The existing `tests/randomize_oklch_test.ts` is unaffected: `randomizeOklch()`
does not change.

---

## 7. Verification

Run `deno fmt`, `deno lint`, `deno check`, `deno task test`, and
`deno task
build`. Then, in a browser against the built `dist/`:

- With a URL **without** `groupColors`: the `imported` option is absent; two
  consecutive `Randomize colors` clicks produce variations of the artwork's
  palette. **This is the drift case from §1.2 and it must now be fixed.**
- With a URL **carrying** `groupColors`: all three options are present;
  selecting `Imported line colors` discards a manual color edit made in-session
  and re-randomizes around the imported palette.
- No base-colors key appears in the query string after any of it.
- Opening the new panel still re-adjusts the layout on desktop widths (the
  listener binds by id; nothing about it changes, but it is cheap to re-check).

---

## 8. Decisions

Recorded as a new dated block, matching the convention in the archived plan.

1. **`Imported line colors` is added as the third `Base colors:` value** (§2.1).
   This reverses archived §8.2 decision 12; §2.4 states why the earlier
   objections do not hold.
2. **It is hidden when unavailable**, never disabled and never substituted
   (§4.2).
3. **The artwork snapshot is captured unconditionally, and a fallback is never
   silent** (§1.2). This fixes a shipped bug as a side effect.
4. **The label, the default (`Original line colors`) and the ephemerality of the
   control are unchanged** from archived §8.2 decisions 11.

Open question for the human: if §4.2's "hide when unavailable" is rejected in
favour of always showing the option, the fallback policy has to be decided too,
and this plan does not pick one.

---

## 9. Risks

| Risk                                                                                                                     | Mitigation                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Reversing a decision made three days ago without the earlier reasoning being weighed                                     | §2.4 restates the earlier objections and says plainly that they are answered rather than dismissed                    |
| Three options is more to read than two, and two of them are identical when the link carries no `groupColors`             | The option is hidden in exactly that case (§4.2), so the extra reading cost only exists where it buys something       |
| Anchor selection stays untested, and drifts again                                                                        | §5.1 extracts it into a pure function and §6 requires a test per mode, including the `null`-snapshot throw            |
| A fallback creeps back in                                                                                                | §4.2 and §5.1 both require an error rather than a substitution; the `null`-snapshot test fails if one is reintroduced |
| The `imported` snapshot is captured only when `groupColors` exists, and nothing tells the user why the option is missing | Deliberate: it is an expected state, not an error. §7 exercises both URL shapes                                       |

## 10. Out of scope

- No change to `randomizeOklch()` or any other colour module.
- No URL keys.
- No per-group randomization, no "copy palette", no undo.
- No UI localization; the labels are English, like the rest of the app.
- No attempt to reduce the three options to two. If the human decides the third
  is not worth it, the correct action is to drop this plan, not to ship a
  disabled option.
