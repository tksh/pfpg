# pfpg

![logo of pfpg](src/favicon.ico)

Profile picture generator for
[Straightlines](https://github.com/tksh/Straightlines) artwork.

<https://pfpg.netlify.app> · <https://pfpg.pages.dev>

## Pages

- `index.html` — the main app: loads artwork data from URL parameters,
  customizes it through settings tabs, and exports PNG/SVG.
- `data-manipulator.html` — an authoring tool (deliberately not linked from
  `index.html`): encodes artwork JSON files (basic data, lines data) into URL
  parameters via [@tksh/stln-codec](https://jsr.io/@tksh/stln-codec), and
  decodes URL parameters back to SVG for verification. Available on either
  deployment above at the `/data-manipulator.html` path.

## Development

```sh
# Clone
git clone git@github.com:tksh/pfpg.git
cd pfpg/

# Install dependencies
deno install

# Build with `deno bundle`
deno task build  # Build index.html and data-manipulator.html
```

## OGP server

`server/ogp-probe.ts` runs as a separate Deno Deploy service. It reads the
vendored rasterizer binary from `src/assets/svg2ui8a/` and initializes
`svg2ui8a` from those bytes before `Deno.serve()` starts listening. No jsr.io
Wasm request is made at runtime, and a missing local file stops startup rather
than failing the first render.

The browser still loads the same binary from this origin through `wasmUrl`;
`deno task build` copies `src/assets/svg2ui8a/` to `dist/svg2ui8a/`. Run
`deno task vendor:svg2ui8a` to refresh the file and its provenance after a
package version bump.

## Deploy on Netlify

`git push` to run `scripts/build.sh` on Netlify, which forces installation of
the latest Deno.

## Deploy on Cloudflare Pages

The repository is also connected to Cloudflare Pages, which serves the same
`./dist` output at `https://pfpg.pages.dev`. The project name and output
directory come from `wrangler.toml`; the remaining build settings live in the
Cloudflare dashboard.

## Dependencies

| Library                                                                         | License                  | Purpose                                               |
| ------------------------------------------------------------------------------- | ------------------------ | ----------------------------------------------------- |
| [@tksh/stln-codec](https://jsr.io/@tksh/stln-codec)                             | MPL-2.0                  | Straightlines URL codec + SVG generator               |
| [@tksh/group-colors-param-codec](https://jsr.io/@tksh/group-colors-param-codec) | MPL-2.0                  | Shortens/expands `groupColors` URL params             |
| [@tksh/svg2ui8a](https://jsr.io/@tksh/svg2ui8a)                                 | MIT                      | Renders SVG into raw RGBA pixels                      |
| [@jsquash/webp](https://www.npmjs.com/package/@jsquash/webp)                    | Apache-2.0, BSD-3-Clause | Encodes the pixels as lossless WebP (libwebp codec)   |
| [@jsquash/oxipng](https://www.npmjs.com/package/@jsquash/oxipng)                | Apache-2.0, MIT          | Optimizes the pixels into a PNG (oxipng codec)        |
| [@jsquash/jxl](https://www.npmjs.com/package/@jsquash/jxl)                      | Apache-2.0, BSD-3-Clause | Encodes the pixels as lossless JPEG XL (libjxl codec) |
| [@jsquash/avif](https://www.npmjs.com/package/@jsquash/avif)                    | Apache-2.0, BSD-2-Clause | Encodes the pixels as lossless AVIF (libavif codec)   |
| [@jsquash/qoi](https://www.npmjs.com/package/@jsquash/qoi)                      | Apache-2.0, MIT          | Encodes the pixels as QOI (QOI codec)                 |
| [colorjs.io](https://www.npmjs.com/package/colorjs.io)                          | MIT                      | sRGB/OKLCH conversion and CSS gamut mapping           |
| [Alwan](https://www.npmjs.com/package/alwan)                                    | MIT                      | Color picker UI                                       |
| [@tksh/url-compressor](https://jsr.io/@tksh/url-compressor)                     | MIT                      | URL-safe string compression (via stln-codec)          |
| [@std/collections](https://jsr.io/@std/collections)                             | MIT                      | Deno standard library array/object utilities          |
| [murmurhash](https://jsr.io/@timepp/murmurhash)                                 | MIT                      | MurmurHash3 typescript implementation                 |

## Vendored license texts

`src/licenses/` holds the third-party license texts that ship with the site,
copied verbatim. The build copies them to `dist/licenses/`, where `index.html`
lists them, so visitors of the deployed site can read them.

| File                                         | From                                             |
| -------------------------------------------- | ------------------------------------------------ |
| `svg2ui8a-MIT.txt`                           | `@tksh/svg2ui8a` `LICENSE`                       |
| `resvg-LICENSE-MIT.txt`                      | `linebender/resvg` `v0.47.0` `LICENSE-MIT`       |
| `roxmltree-LICENSE-MIT.txt`                  | `RazrFalcon/roxmltree` `v0.21.1` `LICENSE-MIT`   |
| `tiny-skia-LICENSE-BSD-3-Clause.txt`         | `linebender/tiny-skia` `v0.12.0` `LICENSE`       |
| `svgtypes-LICENSE-MIT.txt`                   | `linebender/svgtypes` `v0.16.1` `LICENSE-MIT`    |
| `jsquash-webp-Apache-2.0.txt`                | `@jsquash/webp@1.5.0` `LICENSE`                  |
| `jsquash-webp-codec-libwebp-BSD-3-Clause.md` | `@jsquash/webp@1.5.0` `codec/LICENSE.codec.md`   |
| `jsquash-oxipng-Apache-2.0.txt`              | `@jsquash/oxipng@2.3.0` `LICENSE`                |
| `jsquash-oxipng-codec-oxipng-MIT.md`         | `@jsquash/oxipng@2.3.0` `codec/LICENSE.codec.md` |
| `jsquash-jxl-Apache-2.0.txt`                 | `@jsquash/jxl@1.3.0` `LICENSE`                   |
| `jsquash-jxl-codec-libjxl-BSD-3-Clause.md`   | `libjxl` `LICENSE` (at the pinned commit)        |
| `jsquash-avif-Apache-2.0.txt`                | `@jsquash/avif@2.1.1` `LICENSE`                  |
| `jsquash-avif-codec-libavif-BSD-2-Clause.md` | `libavif` `LICENSE.md` (v1.0.1)                  |
| `jsquash-avif-codec-libaom-BSD-2-Clause.md`  | `libaom` `LICENSE` (v3.7.0)                      |
| `jsquash-qoi-Apache-2.0.txt`                 | `@jsquash/qoi@1.1.0` `LICENSE`                   |
| `jsquash-qoi-codec-qoi-MIT.md`               | `@jsquash/qoi@1.1.0` `codec/LICENSE.codec.md`    |
| `colorjs-MIT.txt`                            | `colorjs.io@0.7.1` `LICENSE`                     |

The `@jsquash/*` package texts, the QOI codec's text and the WebAssembly
binaries are refreshed by `deno task vendor:jsquash`. The three codec texts the
task cannot fetch are copied by hand: `@jsquash/jxl` and `@jsquash/avif` ship no
`codec/LICENSE.codec.md`, so the licenses of the code compiled into their Wasm
are checked in directly, and `src/assets/jsquash/README.md` records which
upstream they come from. The five rasterizer-side texts are copied by hand:
`resvg` and its dependencies are Rust crates that ship inside `svg2ui8a`'s Wasm,
so they are not in the package cache that task reads from. `resvg` and `usvg`
carry an identical MIT notice, so one file covers both and the licenses page
says so. `resvg`, `usvg`, `svgtypes` and `roxmltree` are dual-licensed upstream;
this distribution applies the MIT option to each.

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
