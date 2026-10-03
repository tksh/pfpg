# Vendored image encoder assets

These files are copied verbatim out of the pinned packages by
`deno task vendor:jsquash`; do not edit them by hand. The two encoders load
their Wasm with `new URL("<name>.wasm", import.meta.url)`, which `deno bundle`
does not turn into an emitted asset, so the page fetches them from here (the
build copies this directory to `dist/jsquash/`).

| File                     | From                                 | Size   | License                |
| ------------------------ | ------------------------------------ | ------ | ---------------------- |
| `webp_enc.wasm`          | `@jsquash/webp@1.5.0` `codec/enc/`   | 281 KB | BSD-3-Clause (libwebp) |
| `webp_enc_simd.wasm`     | `@jsquash/webp@1.5.0` `codec/enc/`   | 346 KB | BSD-3-Clause (libwebp) |
| `squoosh_oxipng_bg.wasm` | `@jsquash/oxipng@2.3.0` `codec/pkg/` | 164 KB | MIT (oxipng)           |

The multi-threaded `squoosh_oxipng_bg.wasm` variant is deliberately not
vendored: it only engages inside a Worker and additionally requires
`Cross-Origin-Opener-Policy` and `Cross-Origin-Embedder-Policy` headers, which
would apply to the whole page and block the Google Fonts and Cloudinary
subresources `index.html` loads.

The license texts of the packages and of the codecs live in `src/licenses/` and
are copied to `dist/licenses/` by the `copy:licenses` task.

## The JavaScript glue is bundled, not served

Only the Wasm is a file. The matching JavaScript glue is imported statically by
`state/image-encoder.ts`, deliberately bypassing the packages' `optimise()` and
`encode()` wrappers.

The wrappers reach the same glue with a dynamic `import()`, and `deno bundle`
emits every dynamic import as a separate chunk under `_.._/` — a path derived
from the absolute location of the source file on the build machine, so it also
contains the build user's home directory. Static hosts do not all publish that
path: the first render 404'd on Netlify while working on Cloudflare Pages, from
an otherwise identical build. With static imports there is no dynamic import to
split, so no `_.._` directory is produced and nothing can depend on the host
publishing one.

Two consequences to keep in mind when upgrading the pinned versions:

- The glue module paths and their exported names are package internals. A
  version bump that moves them fails `deno task check`, because those imports
  are type-checked like any other.
- Both WebP glue variants are bundled so the SIMD choice can still be made at
  runtime, at a cost of roughly 80 KB of extra JavaScript.
