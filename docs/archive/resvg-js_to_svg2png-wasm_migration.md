# Migration Guide: `@resvg/resvg-js` → `svg2png-wasm`

A practical checklist for migrating an existing project that renders SVG to PNG
in the browser / on the server using `@resvg/resvg-js` (or its Wasm variant
`@resvg/resvg-wasm`) to instead use `svg2png-wasm`.

This guide is written for an AI coding agent that will plan and execute the
migration. Read it top to bottom before touching code.

---

## 0. TL;DR for the agent

- `svg2png-wasm` is a thin, **Wasm-only** wrapper around the same Rust `resvg`
  engine that `resvg-js` uses natively. It is **not a different renderer** —
  pixel-for-pixel output is the same as the Wasm build of `resvg-js` and
  essentially the same as the native `resvg-js` build (same `png` crate, default
  zlib compression).
- The migration is **not** a "swap one API for another" task. The two libraries
  have different **execution models** (sync native vs. async Wasm) and very
  different **API surface** (broad vs. minimal). Some `resvg-js` features **do
  not exist** in `svg2png-wasm` and must be replaced with a different strategy.
- This project has a hard constraint: **no font rendering is involved, and none
  will be added later**. Therefore every font-related concern in this guide has
  been removed. Do not add font handling code, font files, or
  `defaultFontFamily` options.
- This project has a hard constraint: **bounding boxes (BBox) are not used**. Do
  not port any BBox-related code paths. They are mentioned here only so you can
  confirm there is nothing to port.

If the project scope changes (fonts or BBox are added later), this guide must be
re-read end-to-end before proceeding.

---

## 1. Side-by-side: what changes

| Aspect                      | `@resvg/resvg-js` (native)                                                            | `svg2png-wasm`                                                              |
| --------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Distribution                | napi-rs native addon (`.node`), plus a separate `@resvg/resvg-wasm` package           | Pure Wasm; ships a `svg2png_wasm_bg.wasm` blob and a JS/TS wrapper          |
| Runtime envs                | Node.js (native), Browser/Deno (via the Wasm subpackage)                              | Node.js, Browser, Deno, Workers, Edge runtimes — any place that runs Wasm   |
| Native deps                 | Yes (per-OS `.node` binary)                                                           | None                                                                        |
| License                     | MPL-2.0 (because of upstream `resvg`)                                                 | MIT for the wrapper, MPL-2.0 for embedded `resvg`                           |
| Sync / async                | Sync `new Resvg(svg, opts).render().asPng()`. `renderAsync` also available.           | **Async only** — every call is `await svg2png(svg, opts)`                   |
| Module style                | CommonJS / ESM hybrid; `<script>` UMD build is via the Wasm subpackage                | ESM-first; UMD build via `<script>` works but is best for plain browsers    |
| Return value                | Node: `Buffer`; Wasm: `Uint8Array`                                                    | Always `Uint8Array` (convert to `Buffer` with `Buffer.from(png)` if needed) |
| SVG input                   | `string`, `Buffer`, or `Uint8Array`                                                   | `string` only                                                               |
| Output size access          | `renderedImage.width`, `renderedImage.height` on the result object                    | **No API** — read the PNG IHDR chunk manually (see §3)                      |
| Fit / scale API             | `fitTo: { mode, value }` with `original` / `width` / `height` / `zoom`                | `width` / `height` / `scale` (flat)                                         |
| Background                  | `background: 'rgba(...)'`                                                             | `backgroundColor: '#fff'` (renamed; accepts CSS3 colors)                    |
| Crop by BBox                | `cropByBBox(bbox)`                                                                    | **Not supported** — but unused in this project                              |
| `getBBox()` / `innerBBox()` | Yes                                                                                   | **Not supported** — but unused in this project                              |
| Raw RGBA pixels             | `renderedImage.pixels`                                                                | **Not supported** (intentional; Wasm boundary optimization)                 |
| External `<image href>`     | `imagesToResolve()` + `resolveImage(href, buffer)`                                    | **Not supported** — must be embedded as `data:` URIs before calling         |
| Font handling               | `fontFiles`, `fontDirs`, `loadSystemFonts`, `defaultFontFamily`, per-generic families | **Not used in this project** — see constraint in §0                         |

---

## 2. Supported SVG features (same on both sides)

Both libraries use upstream `resvg`. The supported SVG feature set is
**identical** between them. What `resvg-js` renders, `svg2png-wasm` will also
render, modulo the items listed below.

`resvg` (and therefore both libraries) does **not** support:

- `<script>`, `<animate>`, SMIL animations
- `<a>` hyperlinks
- Events
- `<foreignObject>` (HTML embedded inside SVG)
- Native text rendering (Skia is used; system text shaping is not)
- Anything that is not UTF-8

If a feature was working with `resvg-js`, it will keep working with
`svg2png-wasm`. The migration is not a chance to add new SVG features — it is a
swap of the rendering pipeline at the JS layer.

---

## 3. PNG output size: how to read it

`svg2png-wasm` does **not** expose the dimensions of the produced PNG. The
returned `Uint8Array` is just the PNG bytes. If the calling code needs the
width/height of the rendered image, it must parse the PNG **IHDR chunk** itself.

A minimal, dependency-free helper:

```ts
// png-size.ts
export function pngSize(buf: Uint8Array): { width: number; height: number } {
  // PNG signature (8) + IHDR length (4) + "IHDR" (4) + width (4) + height (4)
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  return { width: dv.getUint32(16), height: dv.getUint32(20) };
}
```

Rules:

- Always read with `DataView` against the underlying `ArrayBuffer`. Do not slice
  the buffer with offsets without also passing `byteOffset` to `DataView`, or
  width/height will be read from the wrong memory.
- The two big-endian `uint32` values at byte offsets 16 and 20 are the
  **rendered** width and height — they reflect the `scale` / `width` / `height`
  options passed to `svg2png`, not the SVG's intrinsic viewBox.
- Prefer computing the expected size in the caller (most OGP images have a fixed
  target size like 1200×630) and treat the IHDR read as a verification step, not
  a discovery step.

**Do not** add a full PNG decoder (pngjs, sharp, @jsquash/png) just to get the
dimensions. The IHDR-only approach is dependency-free and ~6 lines.

---

## 4. ESM-first imports

The project's build pipeline is based on `deno bundle`, which works best with
**pure ESM modules and static `import` statements**. Follow these rules:

### Recommended import form

```ts
// Good: ESM, static, no side effects at import time
import { createSvg2png, initialize, svg2png } from "svg2png-wasm";
```

### Avoid

```ts
// Bad: dynamic / CJS interop
const { svg2png } = require("svg2png-wasm");
const lib = await import("svg2png-wasm");
```

### Wasm initialization

`svg2png-wasm` requires the Wasm binary to be loaded before any conversion call:

```ts
import { initialize } from "svg2png-wasm";

// One-time, at module top level or app boot
await initialize(await Deno.readFile("./assets/svg2png_wasm_bg.wasm"));
```

Rules:

- Call `initialize` **once** per process / worker. Multiple calls are wasteful
  but harmless.
- The Wasm binary is shipped with the npm package as
  `node_modules/svg2png-wasm/svg2png_wasm_bg.wasm`. For a Deno project, vendor
  it as a static asset and read it from disk.
- `initialize` accepts `Promise<InitInput>`, `RequestInfo`, `URL`, `Response`,
  `BufferSource`, or a `WebAssembly.Module`. The `Deno.readFile` → `Uint8Array`
  path is the simplest.
- For browser usage: load the package via `<script type="module">` from a CDN,
  then `await initialize(await fetch("/svg2png_wasm_bg.wasm"))`.

### Creating a long-lived converter (optional but recommended)

If the app converts many SVGs in a row with the same configuration,
`createSvg2png` avoids re-loading options on every call. It returns a callable
function with a `.dispose()` method:

```ts
import { createSvg2png } from "svg2png-wasm";

const converter = createSvg2png();
// ... later
const png: Uint8Array = await converter(svg, { width: 1200, height: 630 });
// when shutting down
converter.dispose();
```

**Always call `dispose()`** when the converter will not be used again. The
Wasm-side state holds a font DB and other resources that the GC will not release
on its own.

For this project there are no fonts, so `createSvg2png` can be called with no
arguments.

---

## 5. Direct API mapping

| `@resvg/resvg-js`                                              | `svg2png-wasm` equivalent                                                                                                                     |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `new Resvg(svg, opts).render().asPng()`                        | `await svg2png(svg, opts)`                                                                                                                    |
| `new Resvg(svg).render().asPng()` (no opts)                    | `await svg2png(svg)`                                                                                                                          |
| `fitTo: { mode: 'original' }`                                  | omit `width` / `height` / `scale` (default behavior)                                                                                          |
| `fitTo: { mode: 'width', value: 1200 }`                        | `{ width: 1200 }` (height auto-calculated from viewBox)                                                                                       |
| `fitTo: { mode: 'height', value: 800 }`                        | `{ height: 800 }` (width auto-calculated from viewBox)                                                                                        |
| `fitTo: { mode: 'zoom', value: 1.5 }`                          | `{ scale: 1.5 }`                                                                                                                              |
| `background: 'rgba(238, 235, 230, .9)'`                        | `backgroundColor: 'rgba(238, 235, 230, .9)'` (renamed)                                                                                        |
| `renderedImage.asPng()` → `Buffer`                             | `Buffer.from(await svg2png(svg, opts))` (manual conversion)                                                                                   |
| `renderedImage.width` / `renderedImage.height`                 | Use the §3 IHDR helper on the returned `Uint8Array`                                                                                           |
| `resvg.width` / `resvg.height` (SVG intrinsic)                 | Not exposed; read from the SVG's `viewBox` / `width` / `height` attributes                                                                    |
| `resvg.cropByBBox(bbox)`                                       | Not available — but **unused in this project**, do not implement                                                                              |
| `resvg.getBBox()` / `resvg.innerBBox()`                        | Not available — but **unused in this project**, do not implement                                                                              |
| `resvg.imagesToResolve()` + `resvg.resolveImage(href, buffer)` | Not available — pre-process the SVG: fetch every `<image href>`, base64-encode, embed as `data:image/...;base64,...` before calling `svg2png` |
| `renderedImage.pixels` (raw RGBA)                              | Not available — would require a PNG decoder. **Unused in this project.**                                                                      |

---

## 6. Async refactor: what every call site must change

Every render call site changes from **sync** to **async**. Concretely:

1. Any function that previously returned a `Buffer` (or `Uint8Array`)
   synchronously must now return `Promise<Uint8Array>`. Update return types in
   TypeScript.
2. Any function whose body only did `new Resvg(...).render().asPng()` must
   become `async`. Its callers must `await` it.
3. Event handlers (`onClick`, `onSubmit`, etc.) that triggered a render must
   either:
   - be wrapped to call the async function and use the result later, or
   - be made `async` themselves.
4. Any code that depends on render order (e.g. chaining a download after a
   render) must add `await`.

Concrete before/after:

```ts
// Before
import { Resvg } from "@resvg/resvg-js";
function renderIcon(svg: string): Buffer {
  return new Resvg(svg).render().asPng();
}

// After
import { svg2png } from "svg2png-wasm";
async function renderIcon(svg: string): Promise<Buffer> {
  const png = await svg2png(svg);
  return Buffer.from(png);
}
```

Do not introduce `renderAsync` and friends — they are a `resvg-js` concept.
`svg2png` is the only entry point.

---

## 7. SVG pre-processing: external images

If the project uses SVGs that contain `<image href="https://...">` or
`<image href="relative/path">`, the current `resvg-js` code probably fetches
those images and feeds them to `resolveImage`. `svg2png-wasm` has no equivalent.
The SVG must be self-contained.

Implementation strategy for the agent:

1. Walk the SVG string for `<image>` elements (regex on the string is fine for
   this project; do not pull in a full XML parser unless one is already in the
   tree).
2. For each `href` that is not already a `data:` URI:
   - Resolve relative paths against the SVG's known base URL.
   - `fetch` the image, get the bytes.
   - Read the `Content-Type` header (or sniff from the bytes) to determine the
     MIME type.
   - Base64-encode the bytes.
   - Replace the `href` with `data:<mime>;base64,<encoded>`.
3. Pass the rewritten SVG to `svg2png`.

If the project does not currently use external images in any of its SVGs (the
most common case for OGP / icon work), this section is a no-op. Confirm by
grepping the SVG sources for `<image` and `<use href` before writing any
pre-processing code.

---

## 8. Performance expectations

`s svg2png-wasm` is **slower than `resvg-js` (native)** in steady-state, and
**faster on cold start** (no native module load, no system font scan, which is
irrelevant here since no fonts are used).

Typical ratios for a single 1200×630 OGP render:

- `resvg-js` (native): ~5–15 ms
- `svg2png-wasm`: ~10–30 ms

For most OGP / icon / thumbnail use cases this difference is invisible. If a hot
path turns out to be Wasm-bound after migration, the options are:

- Reduce SVG complexity in the hot path
- Pre-render and cache (see §10)
- Move rendering off the request path entirely

**Do not** reach for a native `resvg` binary or a non-Wasm fallback as part of
this migration. The project is committed to Wasm and ESM.

---

## 9. Bundle / packaging notes

- The `svg2png_wasm_bg.wasm` binary is **not** bundled by `deno bundle`. It must
  be deployed as a separate static asset, or read from disk at runtime in the
  case of Deno Deploy.
- If using Vite for the browser bundle, add
  `optimizeDeps: { exclude: ["svg2png-wasm"] }` and
  `assetsInclude: ["**/*.wasm"]` to handle the Wasm file. The exact config
  depends on the bundler in use; do not invent requirements not present in the
  project.
- Do not import from `https://esm.sh/svg2png-wasm` if the project ships its own
  bundled Wasm. Mixing CDN and local Wasm leads to subtle
  `initialize`-vs-`createSvg2png` mismatches.
- The `@resvg/resvg-js` native `.node` files (and any platform-specific
  `@resvg/resvg-js-linux-x64-gnu` style subpackages) can be **uninstalled**
  after migration. They are not pulled in by `svg2png-wasm`.

---

## 10. (Out of scope) Caching

Caching strategies (R2 + Workers, Deno KV, Cloudflare KV) are explicitly **out
of scope** for this migration. If the calling code or its surrounding
infrastructure already implements caching, it will continue to work — the cache
key was probably already the input SVG string or a hash of it, and the cached
value was probably already a `Buffer`/`Uint8Array` of the PNG. The input/output
shapes of the render call are unchanged, so the cache layer needs no changes.

Do not add caching as part of this migration.

---

## 11. Migration plan for the agent

Execute in this order. Each step is independently committable.

### Step 1 — Inventory

- [ ] Find every `import` of `@resvg/resvg-js` and `@resvg/resvg-wasm`.
- [ ] Find every use of `Resvg`, `renderAsync`, `BBox`, `imagesToResolve`,
      `resolveImage`, `getBBox`, `innerBBox`, `cropByBBox`.
- [ ] Find every use of font-related options (`fontFiles`, `fontDirs`,
      `loadSystemFonts`, `defaultFontFamily`, per-generic families, the `font:`
      block). **Expected: zero matches.** If matches exist, stop and re-read
      this guide end-to-end — the constraints in §0 no longer hold.
- [ ] Find every use of BBox-related APIs. **Expected: zero matches.** If
      matches exist, stop and re-read this guide end-to-end.
- [ ] Find every use of raw RGBA pixels (`renderedImage.pixels`,
      `resvg.pixels`). **Expected: zero matches.**
- [ ] Confirm that no SVG in the project contains `<image href=...>` that would
      need pre-processing. If it does, see §7.

If any of the above is non-zero and not covered by this guide, the migration
cannot proceed without additional design work. Stop and escalate.

### Step 2 — Add the new dependency

- [ ] `npm install svg2png-wasm` (or the Deno equivalent in the project's
      manifest).
- [ ] Copy `node_modules/svg2png-wasm/svg2png_wasm_bg.wasm` into the project's
      static assets directory.
- [ ] Confirm the Wasm file is referenced in the build/bundle output.

### Step 3 — One-shot WASM init

- [ ] Add a single module-level `await initialize(...)` (or an explicit `await`
      during app boot). Use the static asset path from Step 2.

### Step 4 — Replace call sites (mechanical)

For each call site identified in Step 1:

- [ ] Replace `import { Resvg } from "@resvg/resvg-js"` with
      `import { svg2png } from "svg2png-wasm"`.
- [ ] Replace `new Resvg(svg, opts).render().asPng()` with
      `await svg2png(svg, mappedOpts)` (see §5 for option mapping).
- [ ] Wrap the call in an `async` function. Mark the function's return type as
      `Promise<Buffer>` (after `Buffer.from(...)` if needed).
- [ ] Rename `background` → `backgroundColor`.
- [ ] Replace `fitTo: { mode, value }` with `width` / `height` / `scale`.
- [ ] If the caller needs PNG dimensions, add the `pngSize` helper from §3 and
      call it on the returned `Uint8Array`.

### Step 5 — Update consumers

- [ ] Audit every caller of the render function. Add `await` where missing.
- [ ] Update TypeScript return types from `Buffer` / `Uint8Array` to
      `Promise<Buffer>` / `Promise<Uint8Array>`.
- [ ] For browser-side flows: if the result is used to create a `Blob` /
      `URL.createObjectURL`, no further changes are needed —
      `new Blob([png], { type: "image/png" })` accepts `Uint8Array` directly. If
      the project uses `Buffer` specifically, wrap with `new Uint8Array(png)` or
      `Buffer.from(png)` as appropriate.

### Step 6 — Validate

- [ ] Run the project's test suite. If a visual regression suite exists, review
      the diffs — they should be **byte-identical** to the `resvg-js` native
      output, modulo the font rendering case (which is not applicable here).
- [ ] If pixel-level equality is required (e.g. for a cache key that hashes PNG
      bytes), confirm that the outputs match. The internal encoder (`png` crate,
      default zlib) is the same on both sides, so the bytes should match
      exactly.
- [ ] Run a smoke test in the actual deployment environment (browser, Deno
      Deploy, etc.) to confirm the Wasm asset is being served and loaded.

### Step 7 — Remove the old dependency

- [ ] `npm uninstall @resvg/resvg-js @resvg/resvg-wasm` and any
      `@resvg/resvg-js-*-*` platform subpackages.
- [ ] Remove any references to the old package in lockfiles, CI configs,
      Dockerfile, etc.
- [ ] Delete any vendored copies of the old Wasm artifact, if any.

---

## 12. Things to NOT do

These are anti-patterns. The agent must avoid them even if they look convenient.

- Do not pull in a PNG decoder library (`pngjs`, `sharp`, `@jsquash/png`) just
  to get image dimensions. Use the IHDR helper from §3.
- Do not add a native `resvg` fallback. The project is committed to Wasm.
- Do not introduce a `createSvg2png` factory purely for the sake of using it.
  With no fonts, the simple `svg2png(svg, opts)` function is sufficient and
  clearer. Reserve `createSvg2png` for hot paths that benefit from amortized
  initialization.
- Do not introduce BBox or font APIs "just in case". They are out of scope.
- Do not add zopfli or other PNG re-compressors. The internal encoder already
  produces minimal output for the use case; the user explicitly excluded this
  from scope.
- Do not write a generic XML parser just to walk `<image href>` elements if a
  regex over the SVG string is enough for the actual SVGs in the project.
  Confirm the inputs are bounded before choosing.

---

## 13. Self-check before declaring done

Tick every box before reporting completion:

- [ ] Every `import` of `@resvg/resvg-js` is gone.
- [ ] Every call site uses `svg2png` (or `createSvg2png` where justified).
- [ ] Every render function is `async` and its return type reflects that.
- [ ] No font-related options appear anywhere in the codebase.
- [ ] No BBox-related code appears anywhere in the codebase.
- [ ] The Wasm binary is present in the deployment artifact.
- [ ] `initialize` is called exactly once at boot.
- [ ] Bundle / `deno bundle` output is clean: no missing exports, no dynamic
      `import()`s added as a workaround.
- [ ] Tests pass; visual diffs are either absent or explained.
- [ ] Native `@resvg/resvg-js` packages have been removed from `package.json`
      and lockfiles.
