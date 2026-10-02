# Shared image key (pfpg-ogp-v1)

The shared image of an artwork URL is stored in Cloudinary under an asset name
derived from the drawing it shows. This document is the implemented
specification of that name: what goes into it, what deliberately does not, and
when it has to be bumped. It is the result of the work planned in
`stln-memo/pfpg/2026-09-30/hashing-for-ogp--*.md`.

## Where it lives

- `src/js/page-specific/index/dynamic-ogp/canonical-image-input.ts` — the pure
  projection and the hash. No DOM, no `location`, no network.
- `src/js/page-specific/index/dynamic-ogp/params-for-uploading.ts` — reads the
  current URL, decodes it with the codec, hashes it.
- `src/js/common-utils/read-url-params.ts` — `excludeStateKeys()`, the single
  definition of "which query keys are the app's own settings". The SVG
  generation and the key therefore cannot disagree about that.
- `tests/ogp_key_test.ts` — the key's behavior, network-free.

## What the key identifies

The **rendered RGBA content**, not the URL text and not the encoded file. Two
URLs that decode to the same drawing get the same key, whichever encoding the
codec produced for them and whichever file format the bytes are then stored in.
`public_id` is `<key>-<format>` (`…-png`, `…-webp`) so both encodings of one
drawing can coexist.

It is not a trust boundary and not a durable content address: MurmurHash3 x64
128 provides no collision resistance. Use a different scheme if keys ever need
to prove integrity or stay valid across renderer changes.

## Canonical input

`JSON.stringify(["pfpg-ogp-v1", dto])`, hashed with MurmurHash3 x64 128 and
rendered as 32 lowercase hex digits. The DTO is a plain tuple/array tree of
finite numbers, strings and booleans — no `Map`, `undefined` or `null` — so the
serialization order is the declaration order.

| Part       | Contents                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`   | `[width, height]` of the artwork's viewBox                                                                                                         |
| `settings` | `shapeToTrim`, `widthNarrowness`, `topHeavyRatio`, `cropSideMargins`, `shapeRendering`, `heightPixelSize`, in `VISUAL_CONFIG_DEFAULTS` order       |
| `groups`   | per line group, in URL (draw) order: effective `[r, g, b, opacity, strokeOpacity]` (0-255), stroke width per line, and `[x1, y1, x2, y2]` per line |

Group and line order is preserved: reordering changes the drawing. Width runs
are expanded to one width per line, so a different run encoding of the same
lines canonicalizes identically. `groupColors` is resolved to the _effective_
color of each group (overrides applied positionally, untouched groups keeping
their decoded color), never stored as the raw URL string.

### Deliberately excluded

- Encoding choices: encoding method flag, compression flag, d-value payload,
  relative coordinates, derived line indices.
- `title`, `desc`, `metadata` (SVG tag content) and `bits` (decode-only).
- `opacitySteps` (the opacity selector's step size, not a rendered value).
- `pathMode` and `colorFormat`: they change the markup, not the pixels. Verified
  for both generated variants at 256 and 512 px — byte-identical RGBA output, in
  `relativeMerged` vs `absoluteSeparated` and `rgb()` vs `#hex`.
- All UI state, including `themeColor` (the shared image no longer has a
  background) and `imageFormat` (the file format is not part of the drawing).

## When a key becomes wrong

Bump `OGP_KEY_VERSION` whenever the canonical input changes, or whenever a
change to SVG generation or rasterization changes the rendered pixels. Old keys
then stop being produced instead of silently pointing at an asset that no longer
matches its content. A renderer or geometry change is such a bump even when the
DTO is untouched.

Adding a key to `VISUAL_CONFIG_DEFAULTS` forces a decision: the test asserts
which visual keys are excluded from the key, so a new one fails the suite until
it is classified.

## Values that cannot be used

A setting the app cannot use is an error, never a silent fallback: a fallback
would hand an image the key of a different drawing. This covers non-finite
numbers, unusable `groupColors` spellings and undecodable queries. In the page
this surfaces as a failed upload while the preview still renders — the drawing
is shown, it just is not published.

## Still to verify by hand

The unit suite covers the key; these need a browser and the real Cloudinary
account, and are not covered by `deno task test`:

- Cloudinary accepts both `-png` and `-webp` asset names and returns the
  expected URLs.
- What an unsigned upload preset does on a second upload of the same `public_id`
  (Cloudinary documents that unsigned uploads do not overwrite an existing
  asset; treat a conflict as a rejected upload rather than assuming it replaces
  the asset, and confirm it on the real account).
- First render timing in the browser. The index bundle peaked at ~3.6 MB while
  the encoder's Wasm was inlined into it as base64; the encoder now serves its
  Wasm as a file from the site's own origin (`src/assets/jsquash/`, copied to
  `dist/jsquash/` by the `copy:encoder-wasm` task), which brought the bundle
  back to ~1.5 MB. First render and encode timings still want a look in the
  deployment.
