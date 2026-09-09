# Phase 0 golden INPUT fixtures (plan §6 Phase 0, §8.6 — approved 2026-09-09)

Provenance (inputs only, byte-exact copies):

- `basic-data.sample-uint5.json`: `#textarea-basic-data-uploaded` placeholder in
  `src/data-manipulator.html`.
- `lines-data.sample-uint5.json`: `#textarea-lines-data-uploaded` placeholder in
  `src/data-manipulator.html`.
- `agg-data.sample-uint5.json`: `#textarea-agg-data-for-comp-uploaded`
  placeholder in `src/data-manipulator.html`.
- `showcase-*.search.txt`: artwork `<a href="?bits=...">` query strings from
  `src/index.html` Showcase section.

Expected OUTPUT goldens (finished query strings, decoded rel/abs SVGs) are NOT
hand-written here; they are captured by running the codec during library
conformance (plan Phase 3) and reviewed by the human before being frozen.
