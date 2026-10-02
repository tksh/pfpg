# Vendored image encoder assets

These files are copied verbatim out of the pinned packages by
`deno task vendor:jsquash`; do not edit them by hand. The two encoders load
their Wasm with `new URL("<name>.wasm", import.meta.url)`, which `deno bundle`
does not turn into an emitted asset, so the page fetches them from here (the
build copies this directory to `dist/jsquash/`).

| File | From | Size | License |
| --- | --- | --- | --- |
| `webp_enc.wasm` | `@jsquash/webp@1.5.0` `codec/enc/` | 281 KB | BSD-3-Clause (libwebp) |
| `webp_enc_simd.wasm` | `@jsquash/webp@1.5.0` `codec/enc/` | 346 KB | BSD-3-Clause (libwebp) |
| `squoosh_oxipng_bg.wasm` | `@jsquash/oxipng@2.3.0` `codec/pkg/` | 164 KB | MIT (oxipng) |

The multi-threaded `squoosh_oxipng_bg.wasm` variant is deliberately not
vendored: it only engages inside a Worker and additionally requires
`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers,
which would apply to the whole page and block the Google Fonts and Cloudinary
subresources `index.html` loads.

The license texts of the packages and of the codecs live in `src/licenses/`
and are copied to `dist/licenses/` by the `copy:licenses` task.
