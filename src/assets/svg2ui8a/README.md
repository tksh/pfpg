# Vendored rasterizer assets

These files are copied verbatim out of the published package by
`deno task vendor:svg2ui8a`; do not edit them by hand. `@tksh/svg2ui8a` loads
its Wasm with a URL, which `deno bundle` does not turn into an emitted asset, so
the page fetches it from here (the build copies this directory to
`dist/svg2ui8a/`).

| File               | From                             | Size   | sha256           |
| ------------------ | -------------------------------- | ------ | ---------------- |
| `svg2rgba_bg.wasm` | `@tksh/svg2ui8a@0.6.0` `assets/` | 975 KB | `efe5a798…a4bb6` |

The binary contains the `resvg`, `usvg`, `tiny-skia` and `roxmltree` code; their
licenses are listed in the Credits section of `index.html`, and the package
itself is published at <https://jsr.io/@tksh/svg2ui8a>.
