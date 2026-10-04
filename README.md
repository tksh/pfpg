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

## Deploy on Netlify

`git push` to run `build.sh` on Netlify, which forces installation of the latest
Deno.

## Deploy on Cloudflare Pages

The repository is also connected to Cloudflare Pages, which serves the same
`./dist` output at `https://pfpg.pages.dev`. The project name and output
directory come from `wrangler.toml`; the remaining build settings live in the
Cloudflare dashboard.

## Dependencies

| Library                                                                         | License                  | Purpose                                             |
| ------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------- |
| [@tksh/stln-codec](https://jsr.io/@tksh/stln-codec)                             | MPL-2.0                  | Straightlines URL codec + SVG generator             |
| [@tksh/group-colors-param-codec](https://jsr.io/@tksh/group-colors-param-codec) | MPL-2.0                  | Shortens/expands `groupColors` URL params           |
| [@tksh/svg2ui8a](https://jsr.io/@tksh/svg2ui8a)                                 | MIT                      | Renders SVG into raw RGBA pixels                    |
| [@jsquash/webp](https://www.npmjs.com/package/@jsquash/webp)                    | Apache-2.0, BSD-3-Clause | Encodes the pixels as lossless WebP (libwebp codec) |
| [@jsquash/oxipng](https://www.npmjs.com/package/@jsquash/oxipng)                | Apache-2.0, MIT          | Optimizes the pixels into a PNG (oxipng codec)      |
| [Alwan](https://www.npmjs.com/package/alwan)                                    | MIT                      | Color picker UI                                     |
| [@tksh/url-compressor](https://jsr.io/@tksh/url-compressor)                     | MIT                      | URL-safe string compression (via stln-codec)        |
| [@std/collections](https://jsr.io/@std/collections)                             | MIT                      | Deno standard library array/object utilities        |
| [murmurhash](https://jsr.io/@timepp/murmurhash)                                 | MIT                      | MurmurHash3 typescript implementation               |

## Vendored license texts

`src/licenses/` holds the third-party license texts that ship with the site,
copied verbatim. The build copies them to `dist/licenses/`, where `index.html`
lists them, so visitors of the deployed site can read them.

| File                                         | From                                             |
| -------------------------------------------- | ------------------------------------------------ |
| `svg2ui8a-MIT.txt`                           | `@tksh/svg2ui8a` `LICENSE`                       |
| `resvg-LICENSE-MIT.txt`                      | `linebender/resvg` `v0.47.0` `LICENSE-MIT`       |
| `resvg-LICENSE-APACHE.txt`                   | `linebender/resvg` `v0.47.0` `LICENSE-APACHE`    |
| `jsquash-webp-Apache-2.0.txt`                | `@jsquash/webp@1.5.0` `LICENSE`                  |
| `jsquash-webp-codec-libwebp-BSD-3-Clause.md` | `@jsquash/webp@1.5.0` `codec/LICENSE.codec.md`   |
| `jsquash-oxipng-Apache-2.0.txt`              | `@jsquash/oxipng@2.3.0` `LICENSE`                |
| `jsquash-oxipng-codec-oxipng-MIT.md`         | `@jsquash/oxipng@2.3.0` `codec/LICENSE.codec.md` |

The `@jsquash/*` texts and the WebAssembly binaries are refreshed by
`deno task vendor:jsquash`. The three rasterizer texts are copied by hand:
`resvg` is a Rust crate that ships inside `svg2ui8a`'s Wasm, so it is not in the
package cache that task reads from. Both of resvg's license texts are included
because it is dual-licensed and either may be chosen.

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
