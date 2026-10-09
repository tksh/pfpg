# Plan: Exclude `opacitySteps` from `getHashForOgImageUrl` hash input

## 1. Objective

Change `getHashForOgImageUrl`
(`src/js/page-specific/index/dynamic-ogp/params-for-uploading.ts`) so the
OGP-image filename hash is computed from appearance-relevant visual config
**excluding `opacitySteps`**, without changing the global
`VISUAL_CONFIG_DEFAULTS` (`src/js/constants.ts`).

No implementation yet. Awaiting human approval.

## 2. Background / rationale

- `getHashForOgImageUrl()` exists to collect only artwork appearance
  information, hash it with `murmurHash3_x64_128`, and assign a unique filename
  for a unique OGP image.
- Current `getOgImageData()` builds `config` by iterating
  `VISUAL_CONFIG_DEFAULTS` in canonical order:
  `params.has(key) ? params.get(key) : defaultValue`.
- Among `VISUAL_CONFIG_DEFAULTS` entries, only `opacitySteps` is not an
  attribute representing the value itself:
  - Other entries (`groupColors`, `pathMode`, `colorFormat`, `shapeToTrim`,
    `widthNarrowness`, `topHeavyRatio`, `cropSideMargins`, `shapeRendering`,
    `heightPixelSize`) directly describe rendered values.
  - `opacitySteps` (`0.2 | 0.1 | 0.04`) is UI granularity for the opacity
    selector, derived from lines data (nearest step detected from initial
    decoded SVG; see `apply-url-state.ts`: `getInitialOpacitySteps()`,
    `calculateStepsFromTwoOpacities()`).
- Initial-load instability:
  - Default in `VISUAL_CONFIG_DEFAULTS` is `undefined`.
  - At initial load the concrete step is calculated and `SETTINGS_DEFAULTS` is
    mutated, so the same visual transparency can be represented as `undefined`
    (param absent before detection) versus an explicit numeric string
    afterwards.
  - Because `JSON.stringify([artwork, config])` distinguishes `undefined`
    (serialized as `null` in an array) from `"0.1"` etc., identical appearances
    can produce different hashes, causing duplicate OGP uploads / unstable
    filenames.

Therefore `opacitySteps` is inappropriate as hash-input material.

## 3. Scope

- In scope: `getOgImageData()` / `getHashForOgImageUrl()` in
  `src/js/page-specific/index/dynamic-ogp/params-for-uploading.ts` only.
- Out of scope:
  - Do not modify `VISUAL_CONFIG_DEFAULTS` in `src/js/constants.ts`.
  - Do not change URL state handling, tab-lines UI, or OGP upload flow
    (`generate-and-upload.ts`).
  - No dependency changes.

## 4. Proposed implementation

Only inside the hash path, derive a local `Map` with `opacitySteps` removed:

```ts
const VISUAL_CONFIG_FOR_HASH = new Map(
  [...VISUAL_CONFIG_DEFAULTS].filter(([key]) => key !== "opacitySteps"),
);
```

and iterate that map when building `config`:

```ts
const config: Array<SettingValue | null> = [];
for (const [key, defaultValue] of VISUAL_CONFIG_FOR_HASH) {
  config.push(params.has(key) ? params.get(key) : defaultValue);
}
```

Notes:

- Keeps canonical entry order of the remaining keys, so existing hashes for
  unchanged appearances shift only by the removal of one array position
  (intended, one-time invalidation).
- Does not mutate the imported `VISUAL_CONFIG_DEFAULTS`.
- Alternative considered and rejected: filtering by key inline in the loop
  (`if (key === "opacitySteps") continue;`). The explicit derived `Map` matches
  the user's request and makes the exclusion visible / reusable.
- Comment must explain _why_ (step granularity, `undefined`-vs-value
  instability), not _what_.

Expected diff: ~5 lines in `params-for-uploading.ts` only.

## 5. Dependency changes

None.

## 6. Verification

After approval, run and report:

- `deno task test`
- `deno task check` (`deno check tests/ src/ scripts/`)
- `deno lint` (or scoped to changed file)
- `deno fmt` scoped to changed lines only

Per `AGENTS.md` §6, any visual / pixel-equality test requires human review; do
not auto-approve pixel diffs. Note that excluding one element changes hash
inputs, so previously generated OGP filenames will differ — this is expected and
should be confirmed by the human.

## 7. Approval gate

- [ ] Human approves this plan / doc.
- [ ] Then implement the edit in `params-for-uploading.ts`.
- [ ] Move this doc to `docs/archive/` once implementation is complete.
