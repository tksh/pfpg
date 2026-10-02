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

| Library                                                                         | License      | Purpose                                      |
| ------------------------------------------------------------------------------- | ------------ | -------------------------------------------- |
| [@tksh/stln-codec](https://jsr.io/@tksh/stln-codec)                             | MPL-2.0      | Straightlines URL codec + SVG generator      |
| [@tksh/group-colors-param-codec](https://jsr.io/@tksh/group-colors-param-codec) | MPL-2.0      | Shortens/expands `groupColors` URL params    |
| [@tksh/svg2ui8a](https://jsr.io/@tksh/svg2ui8a)                                 | MIT          | Renders SVG into raw RGBA pixels             |
| [@jsquash/webp](https://www.npmjs.com/package/@jsquash/webp)                    | Apache-2.0   | Encodes the pixels as lossless WebP          |
| [@jsquash/oxipng](https://www.npmjs.com/package/@jsquash/oxipng)                | Apache-2.0   | Optimizes the pixels into a PNG              |
| [libwebp](https://github.com/webmproject/libwebp)                               | BSD-3-Clause | WebP codec inside the encoder Wasm           |
| [oxipng](https://github.com/shssoichiro/oxipng)                                 | MIT          | PNG optimizer inside the encoder Wasm        |
| [Alwan](https://www.npmjs.com/package/alwan)                                    | MIT          | Color picker UI                              |
| [@tksh/url-compressor](https://jsr.io/@tksh/url-compressor)                     | MIT          | URL-safe string compression (via stln-codec) |
| [@std/collections](https://jsr.io/@std/collections)                             | MIT          | Deno standard library array/object utilities |
| [murmurhash](https://jsr.io/@timepp/murmurhash)                                 | MIT          | MurmurHash3 typescript implementation        |

## License

[Mozilla Public License Version 2.0](https://www.mozilla.org/en-US/MPL/2.0/)

© 2023-present, SAITO Takashi (tksh)
