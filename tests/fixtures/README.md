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

## DOM-postprocessing output goldens

The existing `showcase-*.svg` files and
`svg_and_shared_image_key_golden_test.ts` cover the codec decode output. They
remain unchanged. The DOM-postprocessing output goldens are captured from the
browser's `#svg-string` textarea after optimization, using the variants listed
in Phase 0.3 of the favorites implementation checklist. Each SVG is an L1
byte-exact golden; its PNG preview is reviewed by a human before freezing.

L2 acceptance compares decoded RGBA pixels, not hashes. L2 does not replace L1:
the byte comparison also catches textual changes from opacity removal, line
break removal, or space removal. A candidate may be pinned L2-only only when
byte output is genuinely nondeterministic, with the reason recorded alongside
the fixture.

Capture procedure: run `deno task build` and then
`deno task serve dist --port 8000`, open the fixture URL and variant in the
browser, and copy the complete `#svg-string` value as the candidate SVG. Render
a small PNG preview with `svg2rgba` for human review. On approval, freeze
candidates with
`deno run --allow-read --allow-write
scripts/freeze_goldens.ts <candidate-directory> --human-reviewed`.
Record the browser name and version, capture date, and exact command used here.
The freeze script uses create-new writes and refuses existing targets, so it
cannot silently replace a frozen golden.

## Review candidates (not frozen)

On 2026-11-14, the ten Phase 0.3 variants for `showcase-202412_001` were
captured from `#svg-string` in Google Chrome 151.0.7922.173. A same-origin
iframe wrapper read the textarea's `.value` after page initialization. The
candidate PNG previews were rendered with `svg2rgba` at 128 px and are awaiting
human review; none of the candidate SVGs has been added as a frozen golden.

Capture commands:

```sh
deno task build
deno task serve dist --port 8000
google-chrome --headless --no-sandbox --disable-gpu --user-data-dir=/tmp/pfpg-chrome-profile-capture --virtual-time-budget=30000 --dump-dom http://127.0.0.1:8000/__capture.html
```

The variants are default, groupColors override, shapeToTrim square/circle/
squircle, squircleSlimmed with `cropSideMargins=false|true`, explicit
`opacitySteps`, explicit `shapeRendering`, and explicit `heightPixelSize`. Human
approval of the PNG previews is required before passing the candidate directory
to the freeze script.
