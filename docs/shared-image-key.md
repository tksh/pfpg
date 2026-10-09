# Shared image key (pfpg-shared-v1)

The shared image of an artwork URL is stored in Cloudinary under an asset name
derived from the drawing it shows. This document is the implemented
specification of that name: what goes into it, what deliberately does not, and
when it has to be bumped.

## Where it lives

- `src/js/page-specific/index/shared-image/canonical-image-input.ts` — the pure
  projection, serialization and hash. No DOM, no `location`, no network.
- `src/js/page-specific/index/shared-image/shared-image-key.ts` —
  `getSharedImageKeyHash()` / `getSharedImageKeyHashForCurrentUrl()`: reads the
  URL, decodes it with the codec, hashes it.
- `src/js/page-specific/index/shared-image/generate-and-upload.ts` — uploads the
  rendered image plus the raw params sidecar to Cloudinary.
- `src/js/page-specific/index/shared-image/constants.ts` — the Cloudinary config
  (cloud name, API key, upload preset, sign endpoint).
- `src/js/common-utils/read-url-params.ts` — `excludeStateKeys()`, the single
  definition of "which query keys are the app's own settings". The SVG
  generation and the key therefore cannot disagree about that.
- `src/js/page-specific/index/svg-to-png.ts` — debounced OGP upload with a
  same-image guard (see "Upload flow").
- `server/ogp-probe.ts` — the Deno Deploy app reuses `getSharedImageKeyHash()`
  directly, so browser and server compute identical keys for identical URLs.
- `tests/shared_image_key_test.ts` — the key's behavior, network-free.
- `tests/svg_and_shared_image_key_golden_test.ts` — version-stable golden keys
  for the showcase artworks.

## What the key identifies

The **rendered drawing**, not the URL text and not the encoded file. Two URLs
that decode to the same geometry, effective colors and rasterization settings
get the same key, whichever codec encoding produced them and whichever file
format the bytes are then stored in. `public_id` is `<key>-<format>` (`…-png`,
`…-webp`) so both encodings of one drawing can coexist.

It is not a trust boundary and not a durable content address: MurmurHash3 x64
128 provides no collision resistance. Use a different scheme if keys ever need
to prove integrity or stay valid across renderer changes.

## Canonical input

`JSON.stringify(["pfpg-shared-v1", dto])`, hashed with MurmurHash3 x64 128 and
rendered as 32 lowercase hex digits. The DTO is a plain tuple/array tree of
finite numbers, strings and booleans — no `Map`, `undefined` or `null` — so the
serialization order is the declaration order.

| Part       | Contents                                                                                                                                           |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `canvas`   | `[width, height]` of the artwork's viewBox                                                                                                         |
| `settings` | `shapeToTrim`, `widthNarrowness`, `topHeavyRatio`, `cropSideMargins`, `shapeRendering`, `heightPixelSize`, in `CANONICAL_SETTING_KEYS` order       |
| `groups`   | per line group, in URL (draw) order: effective `[r, g, b, opacity, strokeOpacity]` (0-255), stroke width per line, and `[x1, y1, x2, y2]` per line |

Group and line order is preserved: reordering changes the drawing. Width runs
are expanded to one width per line, so a different run encoding of the same
lines canonicalizes identically. `groupColors` is resolved to the _effective_
color of each group (overrides applied positionally via
`@tksh/group-colors-param-codec`'s `expandGroupColor` plus the codec's
`decodeGroupColors`; groups the state does not mention keep their decoded
color), never stored as the raw URL string.

`CANONICAL_SETTING_KEYS` is the subset of `VISUAL_CONFIG_DEFAULTS` that changes
the pixels, kept in that map's relative order. The test asserts this order, and
asserts that the remaining visual keys are exactly the pixel-neutral ones (see
below), so adding a visual key fails the suite until it is classified.

Values are read the way the app reads them:

- `shapeToTrim`: missing value falls back to the default; `squircle`,
  `squircleSlimmed`, `square` and `circle` are kept as-is, while anything
  unrecognized falls through to the squircle clip path and is therefore
  canonicalized to `squircle`.
- `widthNarrowness`, `topHeavyRatio`: `Number()`; `heightPixelSize`:
  `parseInt()`, so the app's lenient spellings (e.g. `"300px"` → `300`) hash the
  same as the value the app actually renders.
- `cropSideMargins`: the same case-insensitive `"true"`/`"false"` rule as the
  state manager; anything else counts as off.
- `shapeRendering`: kept verbatim (must be a string).

### Deliberately excluded

- Encoding choices: encoding method flag, compression flag, d-value payload,
  relative coordinates, derived line indices.
- `title`, `desc`, `metadata` (SVG tag content) and `bits` (decode-only).
- `groupColors` as a raw string — only its _effective_ per-group colors enter
  the key (a state override spelling the same color keeps the key).
- `opacitySteps` (the opacity selector's step size, not a rendered value).
- `pathMode` and `colorFormat`: they change the markup, not the pixels.
- All other UI state, including `themeColor` (the shared image has no
  background) and `imageFormat` (the file format is not part of the drawing;
  both `png` and `webp` of one drawing share the key and differ only in the
  `public_id` suffix).

## State-key filtering

`getSharedImageKeyHash()` splits the URL in two: the codec decodes
`excludeStateKeys(urlParams)` (state keys are defined by `SETTINGS_DEFAULTS`),
while `buildCanonicalImageInput()` receives the full params and reads the
pixel-affecting settings out of them itself. Decoding with unfiltered params
would fail or misbehave; hashing only the filtered ones would lose the settings.
Both halves must see the same keys, which is why the filter lives in one shared
helper.

## When a key becomes wrong

Bump `SHARED_IMAGE_KEY_VERSION` whenever the canonical input changes, or
whenever a change to SVG generation or rasterization changes the rendered
pixels. Old keys then stop being produced instead of silently pointing at an
asset that no longer matches its content. A renderer or geometry change is such
a bump even when the DTO is untouched.

## Values that cannot be used

A setting the app cannot use is an error, never a silent fallback: a fallback
would hand an image the key of a different drawing. This covers non-finite
numbers, unusable `groupColors` spellings and undecodable queries. In the page
this surfaces as a failed upload while the preview still renders — the drawing
is shown, it just is not published. The known lenient cases are part of the
spec, not accidents: `heightPixelSize: "300px"` parses to `300`,
`cropSideMargins: "TRUE"` is on, an unknown `shapeToTrim` becomes `squircle`.

## Upload flow

`uploadRenderedImage(image)` in `generate-and-upload.ts`:

1. Computes the key for the current page URL and forms
   `publicId = <key>-<extension>`.
2. Requests an upload signature from the same-origin
   `POST /api/sign-cloudinary-upload` (`{ publicId, tags }`), then uploads the
   rendered bytes as-is — no resizing, centering or background compositing — to
   the `image` endpoint with the signed preset.
3. Uploads the reproducing query string (`location.search`) as `params.txt`
   under the same `publicId` to the `raw` endpoint, so the history page can map
   a thumbnail back to its URL. A sidecar failure never fails the image URL.
4. Tags both assets `pfpg,history,<yyyy>,<yyyy-mm>` and returns the `secure_url`
   with the version segment stripped, so the URL is stable.

The browser render pipeline (`svg-to-png.ts`) debounces the upload
(`UPLOAD_DEBOUNCE_MS`) and skips re-uploading the `publicId` it just uploaded,
logging the skip.

## Server-side reuse

`server/ogp-probe.ts` imports `getSharedImageKeyHash()` unchanged, so the Deno
Deploy endpoints always agree with the browser on the key:

- `GET /ogp/image-meta` returns `{ key, publicId, imageUrl }` without uploading
  anything — the image URL is deterministic from the `publicId` (`<key>-png`).
- `POST /ogp/render` decodes the same params, renders and uploads. Its SVG
  assembly mirrors the browser pipeline (state keys filtered, `<g>` color
  overrides applied, `removeOpacity` honored) so server-rendered pixels match
  the preview.
