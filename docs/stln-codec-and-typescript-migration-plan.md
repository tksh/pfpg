# Codec separation + TypeScript migration plan (APPROVED)

Status: **approved by human on 2026-09-09; implementation in progress**.
Decisions recorded in §9. Per `AGENTS.md` §2, this document remains the
authority for what files exist and what may change.

Goal: extract the Straightlines codec (URL-param encode / decode + SVG
generation) from this `pfpg` repo into a standalone library (provisional name
`stln-codec`), and migrate **both** repos from JavaScript to TypeScript. `pfpg`
keeps only UI (tabs, modals, buttons, OGP, rasterization, settings state); the
library owns the data format.

Non-goals / hard boundaries (from `AGENTS.md` §8, unchanged):

- No fonts, no BBox code, no native `resvg` fallback, no PNG-decoder or PNG
  re-compressor packages, no `git push` without approval, human merges.

Spec reference: Straightlines ruleset (`https://github.com/tksh/Straightlines`):
grouped straight lines only, unsigned-int coordinates, `absoluteSeparated` vs
`relativeMerged` path modes, group `id="0"` = canvas background.

## 1. Current state (verified in repo)

- Runtime/build: Deno-first, `deno bundle` per page (`deno.jsonc` tasks
  `build:index`, `build:data-manipulator`, `build:404`, `postprocessing`). No
  `test` / `lint` / `fmt` / `check` tasks defined yet.
- Sources: 121 `src/js/**/*.js` files, zero TypeScript. Bare-specifier import
  map in `deno.jsonc` (`decode/decode`, `encode/best-mix-enc`,
  `enc-and-dec/...`, `common-utils/...`, `color-formatter/...`, etc.).
- Entry points:
  - `src/index.html` → `src/js/page-specific/index/main.js` →
    `decodeUrlToSvg(isRelative, isOnDataManipulatorPage())` (`decode/decode.js`)
    then `applyImageCustomization(...)` + `svg2png-wasm` rasterization.
  - `src/data-manipulator.html` →
    `src/js/page-specific/data-manipulator/main.js`: encode buttons
    (`encodeBasicData`, `bruteforce53Enc`, `bigint64Enc`, `swap63Enc`,
    `four16Enc`, `bestMixEnc`), `mergeBasicDataAndLinesData`
    (`page-specific/data-manipulator/io/download-url-params.js`), and
    verification decode `decodeUrlToSvg(true/false, true)`.
- Codec core today (candidate to extract):
  - `src/js/encode-and-decode/decode/`: `decode.js` (`decodeUrlToSvg`,
    `decodeDvals`), `generate-svg.js` (`generateSvg`), `size-data-dec.js`,
    `rel-to-abs.js`, `get-uint-n.js`, `try-decompress.js`.
  - `src/js/encode-and-decode/enc-and-dec/`: `basic-data/` (enc + dec),
    `base-n/` (`base-52/53/64url` enc + dec, `get-chars.js`),
    `lines-data/group-colors/` (enc + dec), `lines-data/widths-and-counts/`
    (enc + dec), `lines-data/d-values/{bruteforce53,bigint64,swap63,four16}/`
    (enc + dec
    - helpers, ~30 files).
  - `src/js/encode-and-decode/encode/`: `best-mix-enc.js`, `try-compress.js`,
    `json-to-map-obj.js`, `get-attrs-excepts-dvals.js`, `simplify-map.js`,
    `store-shortest.js`, `join-with-ampersand.js`,
    `transform-encoded-result.js`, `state/result-info.js`.
  - Direct codec deps outside `encode-and-decode/`: `constants.js` (partly),
    `common-utils/compression-stream.js`, `color-formatter/*` (hex
    normalize/shorten/expand, rgb helpers), `common-utils/is-non-empty.js`,
    `common-utils/format-as-float.js`, `common-utils/get-uint-n.js`, external
    `@tksh/url-compressor`, `@std/collections/*`, Web
    `CompressionStream`/`DecompressionStream`.
- UI-only (stays in `pfpg`): everything under
  `src/js/page-specific/index/{init,state,modal,tab-*,button,dynamic-ogp}`,
  `page-specific/data-manipulator/io/*`,
  `common-utils/{output-to-textarea,read-textarea,read-url-params,select-output-textarea,show-processing-time}.js`,
  `encode/{show-result,show-best-mix-result}.js`, `svg2png-wasm`, `alwan`,
  `@timepp/murmurhash`.

### Coupling that must be cut (library must not import these)

| Codec file today                                                                                                                                     | UI/DOM coupling                                                                                | Resolution in library                                                                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `decode/decode.js`                                                                                                                                   | `window.location.search`, `document.getElementById`, `performance.now`, writes to textarea/DOM | Accept `string \| URLSearchParams` argument; return `{ svg, data, metrics? }`; caller does DOM I/O               |
| `common-utils/read-url-params.js` (`decodeUrlParams`, `getUrlParamsExceptsStates`)                                                                   | `window`, filters via UI `SETTINGS_DEFAULTS`                                                   | Move pure `decodeAsThreeData(params)` to lib; keep `getUrlParamsExceptsStates()` (state-key filtering) in `pfpg` |
| `enc-and-dec/basic-data/basic-data-enc.js`                                                                                                           | Reads textarea, reads checkbox DOM, writes textarea/DOM                                        | Pure `encodeBasicData(data, opts)` + `parseBasicData(json)`; checkbox logic stays in page                        |
| `*-enc.js` (`bruteforce53/bigint64/swap63/four16`), `encodeWidthsAndCounts`, `encodeGroupColors`, `json-to-map-obj.js`, `get-attrs-excepts-dvals.js` | Read hardcoded textarea IDs                                                                    | Take typed data arguments (`BasicData`, `LinesData[]`, `AggregatedLinesData[]`) and return `Map`/string          |
| `encode/best-mix-enc.js`                                                                                                                             | Reads `apply-*` checkboxes, writes textareas/DOM                                               | Pure `bestMixEncode(inputs, methods)`; page passes selected method names                                         |
| `encode/try-compress.js`, `state/result-info.js`                                                                                                     | Global mutable `resultInfo` + `console.log` per group                                          | Return structured result object; no module-global mutable state (or explicit opt-in diagnostics object)          |
| `page-specific/data-manipulator/io/download-url-params.js` (`mergeBasicDataAndLinesData`)                                                            | Reads textareas, writes textarea + size `<pre>`, `Blob`/`URL.createObjectURL` download         | Pure `mergeUrlParams(basic: string, lines: string): string`; download/size UI stays in page                      |
| `common-utils/show-processing-time.js`, `output-to-textarea.js`, `select-output-textarea.js`                                                         | DOM/timing display                                                                             | Stay in `pfpg`; lib optionally returns elapsed-ms or accepts an injected clock                                   |

### Latent bug to fix before extraction

`decode/try-decompress.js` calls `decompressFromEncodedURIComponent(...)` (which
is `async`) but callers (`basic-data-dec.js`, `read-url-params.js`, `decode.js`)
treat it as synchronous. The `uncompressed` (`~`) and `URLCompressor` (`0`)
branches work sync; the `deflate-raw` (`1`) branch returns a `Promise`. The
library API **must be async on decode** (`Promise<...>`), and this needs a
regression test. Do not preserve the sync signature.

## 2. Target state

New repo `stln-codec` (see §3 for naming): Deno-first TypeScript library,
published to JSR (primary) and npm (compat), zero DOM dependencies. Ships
types + pure functions + round-trip tests + golden fixtures.

`pfpg` after migration: TypeScript UI app. Codec imports come from the library
(e.g. `jsr:@tksh/stln-codec` or `npm:stln-codec`), replacing ~50 `deno.jsonc`
import-map entries under `encode/*`, `decode/*`, `enc-and-dec/*`. DOM adapters
(`read-url-params` filtering, textarea I/O, checkbox wiring, timing display)
remain in `pfpg` as thin wrappers.

Proposed library surface (TypeScript sketch, names bikesheddable):

```ts
// Data model (mirrors Straightlines spec + current JSON shapes)
export interface BasicData { bits: string; version?: string; title?: string; desc?: string; metadata?: string }
export interface Rgb { r: number; g: number; b: number }
export interface LineGroup { g_id: number; g_stroke: Rgb; g_opacity: number; g_stroke_opacity: number; id: number[]; stroke_width: number[]; d: { absolute: Dvals; relative: Dvals } }
export interface Dvals { x1: number[]; y1: number[]; x2: number[]; y2: number[] }
export type PathMode = "absoluteSeparated" | "relativeMerged";
export interface DecodedParams { basicData: BasicData; linesData: Map<number, DecodedGroup>; sizeData: SizeData }

// Encode (pure; async where CompressionStream is tried)
export function encodeBasicData(data: BasicData, opts?: { include?: (keyof BasicData)[] }): string;
export function parseBasicData(json: unknown): BasicData;
export function encodeLinesDataBruteforce53(basic: BasicData, agg: AggregatedLinesData[], lines: LineGroup[]): Promise<Map<number, string>>;
export function encodeLinesDataBigint64(...): Promise<...>; // same shape
export function encodeLinesDataSwap63(...): Promise<...>;
export function encodeLinesDataFour16(...): Promise<...>;
export function bestMixEncode(inputs: CodecInputs, methods?: EncodingMethodName[]): Promise<{ params: string; byGroup: Map<number, BestPick> }>;
export function mergeUrlParams(basicParams: string, linesParams: string): string;

// Decode + SVG (async — see §1 bug)
export async function decodeUrlParams(search: string | URLSearchParams): Promise<DecodedParams>;
export function generateSvg(decoded: DecodedParams, opts: { pathMode: PathMode }): string;
export async function decodeUrlToSvg(search: string | URLSearchParams, opts: { pathMode: PathMode }): Promise<{ svg: string; data: DecodedParams }>;
```

Notes:

- No `window`/`document`/`performance` imports. Optional `metrics` (lengths,
  ratio, elapsed ms) returned as data, never written to DOM.
- Compression flags (`FLAGS_MAP` 1st/2nd chars) and `BASIC_DATA_KEYS`,
  `TAB_SPACE`, `VIEWBOX_START_*` move to the library; `SETTINGS_DEFAULTS` (UI
  state keys) stays in `pfpg`.
- `color-formatter` hex/rgb helpers used by `group-colors` move (or are
  re-implemented minimally) in the library; UI-only color usage (`tab-lines/*`,
  Alwan wiring) stays.
- Logging: keep `console.debug`-level logs out of the hot path or gate behind
  `opts.verbose`; library tests assert on return values, not console output.

## 3. Naming proposal

Requirement: short, JSR/npm-safe, obviously tied to Straightlines, says "codec".
Candidate comparison:

| Name                             | Pros                                                                                                                   | Cons                                                                             |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `stln-codec` (proposed by human) | Short; `stln` = natural Straightlines abbrev; `-codec` states encode+decode+SVG; JSR `jsr:@tksh/stln-codec` reads well | `stln` is coined; needs one-line README expansion                                |
| `straightlines-codec`            | Fully explicit, best discoverability                                                                                   | Long import specifier; redundant with scope                                      |
| `stln`                           | Shortest                                                                                                               | Too generic; says nothing about codec; collides conceptually with spec repo name |
| `straightlines-url-codec`        | Precise about URL-param role                                                                                           | Long; understates SVG generation role                                            |

Recommendation: keep **`stln-codec`** (package `stln-codec`, JSR scope
`@tksh/stln-codec`), tagline "Straightlines (`stln`) URL codec + SVG generator".
**DECIDED (2026-09-09): approved as `stln-codec` / `jsr:@tksh/stln-codec`.**

## 4. What moves vs stays (proposed boundary)

Moves to `stln-codec` (pure, typed):

- All of `enc-and-dec/` **minus** DOM readers (see rewrites in §1 table).
- `decode/` **minus** DOM I/O (`decode.js` core, `generate-svg.js`,
  `size-data-dec.js`, `rel-to-abs.js`, `get-uint-n.js`, `try-decompress.js` made
  async).
- `encode/` pure parts: `try-compress.js`, `simplify-map.js`,
  `store-shortest.js`, `join-with-ampersand.js`, `transform-encoded-result.js`,
  `json-to-map-obj.js` (as `parseLinesData(json)` / `parseAggregated(json)`
  validators), `get-attrs-excepts-dvals.js` (as pure helpers taking encoded
  maps).
- `common-utils/compression-stream.js`, `is-non-empty.js`, `format-as-float.js`,
  `get-uint-n.js`; needed `color-formatter/*`; codec-relevant `constants.js`
  subset.
- External deps of the library: `@tksh/url-compressor`, `@std/collections/*`
  (only what codecs use), Web Compression APIs. No `alwan`, no `svg2png-wasm`,
  no `murmurhash`.

Stays in `pfpg` (UI adapters, unchanged behavior):

- `page-specific/**`, `common-utils/read-url-params.js` (state filtering),
  `output-to-textarea`, `read-textarea`, `select-output-textarea`,
  `show-processing-time`, `encode/show-result*`, `state/result-info` display
  wiring, `constants.js` settings maps, CSS/HTML/showcase.

`deno.jsonc` after: delete ~50 codec import-map lines, add one (e.g.
`"@tksh/stln-codec": "jsr:@tksh/stln-codec@^0.1.0"`); page modules call adapters
that translate textarea/checkbox/URL state → library types.

## 5. TypeScript migration strategy (both repos)

1. Baseline first (in `pfpg`, before extraction): add
   `check`/`lint`/`fmt`/`test` tasks to `deno.jsonc`; enable strict
   (`compilerOptions.strict: true`, `noUncheckedIndexedAccess: true` — DECIDED
   2026-09-09); run `deno fmt --check`, `deno lint`, `deno check` on current JS
   to size the work. No behavior change. Format only touched lines in `pfpg`,
   never untouched lines.
2. Characterization tests first: add golden fixtures (sample basic/lines JSON
   from `data-manipulator.html` placeholders + showcase query strings from
   `index.html`) and round-trip tests `JSON → encode → merge → decode → SVG`
   comparing against current JS output byte-for-byte. These tests become the
   library's conformance suite.
3. Extract to `stln-codec` **directly as TypeScript** (no intermediate JS copy):
   port pure functions with explicit exported interfaces; replace
   JSDoc-by-convention with real types; make decode async; remove DOM reads;
   `Map` iteration order = group order (preserve current behavior).
4. Convert `pfpg` incrementally, thinnest-adapter-first: `common-utils` →
   `page-specific/*` → HTML entry scripts; keep `deno bundle` working after each
   step; run `deno task build` + manual smoke (index + data-manipulator
   round-trip) per step.
5. Switch `pfpg` to the published library (or `file:`/`git:` pin during
   development), delete migrated codec files, prune the import map. One logical
   change per commit per `AGENTS.md` §7.

`any` / `// @ts-ignore` are not allowed (per `AGENTS.md` §4); real type errors
escalate to the human as design decisions.

## 6. Phased execution plan

- [x] **Phase 0 — Baseline + fixtures (pfpg only).** Add `deno.jsonc` tasks
      (`test`, `check`, `lint`, `fmt`); capture golden inputs/outputs (basic
      JSON, lines JSON, aggregated JSON, finished query strings, decoded rel/abs
      SVGs for `bits ~5` and `~7` samples). Human approves fixture set.
- [x] **Phase 1 — Library scaffold (`stln-codec` repo).** `deno.json`, license
      **MPL-2.0 (DECIDED 2026-09-09)**, `src/mod.ts` re-exports, `src/types.ts`,
      strict config, CI (`deno test`, `deno lint`, `deno fmt --check`,
      `deno check`, `deno publish
  --dry-run`).
- [x] **Phase 2 — Port pure codec (bottom-up).** `base-n` → `group-colors` +
      `widths-and-counts` → `d-values/*` → `basic-data` →
      `size-data`/`rel-to-abs` → `generate-svg` → `try-compress`/`best-mix` →
      `decodeUrlParams` facade. Each with unit tests; decode tests cover all
      1st-flag branches (`~`/`0`/`1`) incl. the newly-async `deflate-raw` path.
- [x] **Phase 3 — Conformance.** Library round-trip tests reproduce Phase 0
      goldens byte-for-byte (modulo intended async fix). Human reviews any diff.
- [x] **Phase 4 — pfpg adapters (TS).** Thin wrappers per page
      (`parseBasicDataFromTextarea`, `getCheckedMethods`, `mergeAndDisplay`,
      `filteredSearchParams`); `deno.jsonc` gains `@tksh/stln-codec`, drops
      codec entries as files are deleted.
- [x] **Phase 5 — pfpg UI to TS.** Remaining `page-specific/*` and
      `common-utils/*` to `.ts`; `deno task build` + smoke both pages.
- [ ] **Phase 6 — Publish + pin.** Publish `stln-codec` 0.1.0 (JSR; npm if
      needed), pin in `pfpg` (`deno.lock` update), update README dependency
      table, archive old JS codec files (delete; git history retains them).

Each phase ends with: commands run + results, files changed, checks
passed/skipped, deviations, open questions (per `AGENTS.md` §9). Stop and ask on
any item in `AGENTS.md` §10 (esp. new deps, guide/codebase conflicts,
non-obvious test failures).

## 7. Testing & verification

- Library: `deno test` — unit (base-n vectors, group-colors, widths-counts, each
  d-value codec incl. `BigInt` paths, flags/compression selection), round-trip
  (`encode → decode` identity on dvals; `decode → generateSvg` for both path
  modes), goldens from Phase 0, error cases (unknown flag, bad bits, empty
  params). No pixel tests (not applicable to codec).
- pfpg: `deno task build` for all three pages, `deno lint`, `deno fmt`,
  `deno check`, manual smoke: index loads random showcase artwork and renders
  PNG; data-manipulator encodes both samples, merges, decodes both path modes,
  outputs match library goldens.
- No new runtime deps planned. If a PNG-size helper or compressor beyond current
  `url-compressor` + `CompressionStream` seems needed, it goes in the plan's
  Dependency section for approval first (none today).

## 8. Open questions for the human

All resolved on 2026-09-09:

1. Library name/scope: **approved `stln-codec` / `jsr:@tksh/stln-codec`.**
2. Library license: **MPL-2.0.**
3. Sync-or-async decode: **approved — decode becomes `async` to fix the
   `deflate-raw` branch (§1).**
4. Scope: **approved — library covers encode + decode + `generateSvg` only;
   rasterization stays in `pfpg`.**
5. TS strictness: **`noUncheckedIndexedAccess` and strict mode enabled.** In
   `pfpg`, format only touched lines, never untouched lines.
6. Fixtures: **approved — two showcase artworks + `data-manipulator.html`
   placeholder JSONs as test goldens.**

## 9. Decision log

| Date       | Decision                                                                                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-09-09 | Human approved §§1–7 as the authority for this migration; §8 items resolved as above; authorized commit of this plan and start of implementation (Phase 0 first). |
