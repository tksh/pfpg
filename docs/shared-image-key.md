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

A key is only computed for URLs the app can render: `libpfpg/settings.ts`
validates every render and raster setting first, and the projection rejects a
value outside the same domain. The accepted domains are closed:

- `shapeToTrim`: missing value falls back to the default; only `square`,
  `circle`, `squircle` and `squircleSlimmed` are accepted. An unrecognized value
  is an error, not a fallthrough to the squircle clip path.
- `widthNarrowness`: one of the 15 values `0..10, 15, 20, 25, 30`;
  `topHeavyRatio`: one of `-3, -2, -1, 0, 1, 2, 3`. Both are decimal integers; a
  value the UI cannot express has no rendered counterpart.
- `heightPixelSize`: a decimal integer in `1..4096`. `96px`, `0x10`, `1e3`, `0`
  and numbers above 4096 are rejected.
- `cropSideMargins`: exactly `"true"` or `"false"` (or a boolean default).
  `"TRUE"`, `"1"` and an empty string are rejected, not coerced.
- `shapeRendering`: only `crispEdges` or `geometricPrecision`.

### Deliberately excluded

- Encoding choices: encoding method flag, compression flag, d-value payload,
  relative coordinates, derived line indices.
- `title`, `desc`, `metadata` (SVG tag content) and `bits` (decode-only).
- `groupColors` as a raw string — only its _effective_ per-group colors enter
  the key (a state override spelling the same color keeps the key).
- `opacitySteps` (the parameter itself). Its _effect_ goes into the key — see
  "Opacity steps" below.
- `pathMode` and `colorFormat`: they change the markup, not the pixels.
- All other UI state, including `themeColor` (the shared image has no
  background) and `imageFormat` (the file format is not part of the drawing;
  both `png` and `webp` of one drawing share the key and differ only in the
  `public_id` suffix).

## Opacity steps

`opacitySteps` is the one parameter whose exclusion needs an asterisk. The
parameter is not part of the canonical settings — the renderer may spell the
same effective drawing many ways, and two URLs producing identical pixels must
share a key — but its **effect on the pixels is included**:

- When the URL carries a supported step (`0.04`, `0.1`, `0.2`), every group's
  displayed SVG `opacity` and `stroke-opacity` value (the 2-decimal value
  written into the SVG) — including overrides supplied via `groupColors` — is
  quantized onto the step grid before projection onto the canonical input. The
  snap rule and tie-break are the same as the renderer's: nearest grid value,
  plain `<` comparison (ties go to the earlier/larger grid value). Grid values
  are the three-decimal-grid the UI emits (`"1.0"`, `"0.96"`, …).
- Unsupported or invalid values (anything but `0.04` / `0.1` / `0.2`) are
  treated as "opacitySteps not specified": the artwork keeps the opacities it
  was drawn with, and the key is identical to the same URL without the param.
  The browser does the same thing — it drops the invalid param and keeps the
  artwork-derived default.
- The raw parameter is not re-included under any supported value, so an artwork
  already on the grid (e.g. showcase artworks snapped by construction) keeps its
  current key no matter which allowed step the URL carries.

The rules are implemented by `readOpacitySteps()` and `effectiveOpacityUint8()`
in `canonical-image-input.ts`. `shared-image-key-test.ts` asserts that:

- the fixture artwork (opacity `1.0` / `0.8` / `0.6` / `0.4`, on every grid)
  keeps its key for all three steps and for every unsupported value (`0`,
  `-0.1`, `0.3`, `0.5`, `0.07`, `1`, `true`, `abc`, empty);
- a `groupColors` override encoding an off-grid `0.5` stroke-opacity changes the
  key under `opacitySteps=0.04` and `opacitySteps=0.2` (it snaps to 0.52 / 0.6),
  and keeps the plain key under `opacitySteps=0.1`;
- `effectiveOpacityUint8()` snaps with the nearest-grid rule and the same
  earlier/larger tie-break as the UI.

Phase 2 removed the temporary `opacitySteps` guard: `POST /ogp/render` now uses
`renderParamsToSvg()` and accepts supported opacity steps, snapping them before
rasterization. The endpoint still checks `x-ogp-shared-secret` against
`OGP_SHARED_SECRET`. Invalid artwork params return 400; missing or incorrect
secrets return 403.

Bumping `SHARED_IMAGE_KEY_VERSION` is not required for this change: this project
has no users or shared assets to protect (dev-era decision, 2026-11-06), and
bumping would change the Cloudinary `public_id` of every re-render without any
quality gain. The key format version is therefore left at `pfpg-shared-v1`. When
the renderer projection changes in the future (e.g. honoring other
pixel-affecting settings), bump the version as documented below.

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
numbers, values outside the closed domains above, `heightPixelSize` above 4096,
uppercase booleans, unusable `groupColors` spellings and undecodable queries.
The old lenient spellings are not part of the spec any more: a unit suffix on
`heightPixelSize` is rejected instead of parsed, `cropSideMargins: "TRUE"` is
rejected instead of counting as on, and an unknown `shapeToTrim` is rejected
instead of becoming `squircle`. In the page this surfaces as a failed render; on
the OGP endpoints it is HTTP 400.

## Artwork-dependent validation

Some invalid URLs can only be recognised after decoding: `groupColors` may name
more groups than the artwork has, and the width derived from the viewBox and
`heightPixelSize` may push the rendered image past 4096px on its longest side.
`validateArtworkConstraints()`
(`src/js/page-specific/index/state/param-validator.ts`) runs after decoding and
before drawing or key generation on every path. It throws
`TypeError("Excess groupColors specified for artwork")` and
`RangeError("Rendered image dimensions exceed 4096px")` respectively. Surplus
colors are rejected rather than silently ignored: a drawing that does not use
them must not receive a key that another URL shares.

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

`server/ogp-probe.ts` shares the browser's `renderParamsToSvg()` and
`getSharedImageKeyHash()`:

- `GET /ogp/image-meta` returns `{ key, publicId, imageUrl }` without uploading
  anything; the deterministic URL uses `<key>-png`.
- `POST /ogp/render` renders the full parameter set, rasterizes at
  `heightPixelSize` (256 by default), and uploads the PNG. The temporary
  `opacitySteps` rejection is removed. Uploads retain their raw params sidecar
  and receive `pfpg,history` plus the existing date tags. The removed `auto`
  query parameter is rejected with 400; uploads no longer use a crawler-specific
  tag path.
- `GET /ogp` has been removed. The service keeps `/ogp/image-meta` and
  `/ogp/render`.

The Pages functions compute the browser-upload URL with `/ogp/image-meta`, then
check the Cloudinary URL with `HEAD` for every User-Agent. They include
`og:image` only when the asset already exists. A 404, timeout, other non-success
response, or fetch error omits the complete `og:image` tag while retaining
`og:url`. OGP page requests never call `POST /ogp/render`; images appear after
they have been uploaded through the browser or the protected manual endpoint.

`OGP_METHOD_A` and the crawler User-Agent allowlist have been removed. Edge
deployments no longer need `OGP_METHOD_A` or `OGP_SHARED_SECRET`. The Deno
service still requires `OGP_SHARED_SECRET` for the manual render endpoint.
Previously uploaded `pfpg,ogp-auto` assets are historical and are not changed by
this behavior. They may be removed manually from Cloudinary with their raw
sidecars. `SHARED_IMAGE_KEY_VERSION` remains unchanged: this renderer follows
the existing canonical pixel contract.
