# libpfpg structural declaration

`src/js/libpfpg/` is the DOM-free seed of the future `@tksh/libpfpg` package. It
provides the public `renderParamsToSvg()` entry point and separates its pure
work into settings, opacity snapping, squircle geometry, SVG attributes, and
text optimization modules.

The renderer uses internal relative imports among these modules. Its external
imports are `@tksh/stln-codec`, `@tksh/group-colors-param-codec`, and standard
library APIs; it does not import application UI modules. The purity contract
forbids `document`, `location`, `fetch`, and `import.meta.hot`. The directory
currently satisfies that contract. Package publication is deferred until after
the favorites implementation, as decided in 04 §0 item 2 (Q4).
