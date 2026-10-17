# Vendored image encoder assets

These files are copied verbatim out of the pinned packages by
`deno task vendor:jsquash`; do not edit them by hand. The encoders load their
Wasm with `new URL("<name>.wasm", import.meta.url)`, which `deno bundle` does
not turn into an emitted asset, so the page fetches them from here (the build
copies this directory to `dist/jsquash/`).

| File                     | From                                 | Size    | License                        |
| ------------------------ | ------------------------------------ | ------- | ------------------------------ |
| `webp_enc.wasm`          | `@jsquash/webp@1.5.0` `codec/enc/`   | 281 KB  | BSD-3-Clause (libwebp)         |
| `webp_enc_simd.wasm`     | `@jsquash/webp@1.5.0` `codec/enc/`   | 346 KB  | BSD-3-Clause (libwebp)         |
| `squoosh_oxipng_bg.wasm` | `@jsquash/oxipng@2.3.0` `codec/pkg/` | 164 KB  | MIT (oxipng)                   |
| `jxl_enc.wasm`           | `@jsquash/jxl@1.3.0` `codec/enc/`    | 1332 KB | BSD-3-Clause (libjxl)          |
| `avif_enc.wasm`          | `@jsquash/avif@2.1.1` `codec/enc/`   | 3404 KB | BSD-2-Clause (libavif, libaom) |
| `qoi_enc.wasm`           | `@jsquash/qoi@1.1.0` `codec/enc/`    | 14 KB   | MIT (QOI)                      |

The multi-threaded variants of the oxipng, JPEG XL and AVIF encoders are
deliberately not vendored: they only engage inside a Worker and additionally
require `Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers,
which would apply to the whole page and block the Google Fonts and Cloudinary
subresources `index.html` loads. The QOI package has no multi-threaded build.

The license texts of the packages and of the codecs live in `src/licenses/` and
are copied to `dist/licenses/` by the `copy:licenses` task. `@jsquash/jxl` and
`@jsquash/avif` ship no `codec/LICENSE.codec.md`, so the licenses of the code
compiled into their Wasm are checked in directly:
`jsquash-jxl-codec-libjxl-BSD-3-Clause.md` (libjxl at the commit the package
pins), `jsquash-avif-codec-libavif-BSD-2-Clause.md` (libavif v1.0.1) and
`jsquash-avif-codec-libaom-BSD-2-Clause.md` (libaom v3.7.0). The AVIF encoder
also links libwebp's libsharpyuv, whose BSD-3-Clause license is the libwebp text
already shipped for the WebP encoder.
