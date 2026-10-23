# Usage footer cleanup + Distribution hint popover

Date: 2026-10-23 Status: drafted (awaiting human approval)

Two unrelated-to-i18n content fixes in `src/index.html`, both of which also
touch the locale files because the strings are `data-i18n`-marked (the parity
test enforces identical key sets in `en.json`/`ja.json`).

## Task 1 — remove the abandoned "sharing feature" footer line

**Where:** `src/index.html` → footer `Usage` → `Modal Dialogs:` list, the middle
`<li>` (`data-i18n="footer.modalDialogs.share"`, line ~891). `modal-toggle.ts`
confirms what the PNG click actually does: it opens `#img-opt-modal`, whose
heading is `imgOpt.heading` = "Image Optimization".

**Change:** repurpose the `<li>` for that real behavior, in the same style as
the `svgInfo` line below it ("Click/tap the source SVG input field to access
optimization settings."):

- HTML: `data-i18n="footer.modalDialogs.imageOpt"` (key renamed — the old name
  describes a dead feature), fallback text
  `Click/tap the rendered PNG image to access image optimization settings.`
- `en.json`: replace `footer.modalDialogs.share` with
  `"footer.modalDialogs.imageOpt": "Click/tap the rendered PNG image to access image optimization settings."`
- `ja.json`: matching translation
  `"描画された PNG 画像をクリック/タップすると、画像最適化の設定を利用できます。"`
  (mirrors the `svgInfo` ja phrasing 〜最適化の設定を利用できます)

No JS change: the click already opens the dialog.

## Task 2 — ⓘ hint for `Color randomization: > Distribution:`

Copy the `Anchor:` row's pattern exactly (declarative popover, **no JS added**):

- `src/index.html` — inside the Distribution `.setting-item` (after the
  `<select>`), add the same info-icon button Anchor uses:
  `id="randomization-distribution-info"`, `class="info-icon"`,
  `popovertarget="randomization-distribution-hint"`,
  `data-i18n-aria="lines.distribution.info"`, fallback aria-label
  `"What does the Distribution option do?"`, material `info` icon span.
- Add the hint `<dialog>` beside `randomization-base-hint`/`path-mode-hint`,
  i.e. **outside** `#color-randomization` (same reason as the existing hints:
  popovers inside a `<details>` are suppressed), `class="hint-dialog"`,
  `popover`, `closedby="any"`, content `data-i18n-html="hint.distribution"`
  (html because of `<i>` around the option names) + same close button.
- Hint text (accurate to `color-formatter/randomize-oklch.ts`: each click
  redraws every line group's per-channel offset within the set ranges):

  - en:
    `Each randomize click redraws every line group's Lightness, Chroma, and Hue offsets within the ranges set above. <i>Uniform</i>: every amount within each range is equally likely, so a color can move anywhere in the range. <i>Triangular</i>: offsets cluster near zero and thin out toward the range edges, so most lines barely change and large shifts are rare.`
  - ja:
    `ランダム化 1 回ごとに、全グループの明度・彩度・色相の変化量が上で設定した幅の中で抽選されます。<i>一様</i>: 幅の中の変化量はすべて同じ確率で出ます。色は幅のどこへでも動けます。<i>三角</i>: 変化量は 0(元の値)付近に集中し、幅の端ほど出にくくなります。多くの線はほとんど変化せず、大きく変わる線はまれです。`

- `en.json` + `ja.json` — add `lines.distribution.info` and `hint.distribution`
  (key set parity kept).

## Commit strategy (one logical change per commit)

1. `fix: describe the image optimization dialog in the Usage footer`
2. `feat: add a hint popover for the Distribution option`

## Verification

`deno task fmt` / `lint` / `check` / `test` (HTML-coverage + parity tests pick
up the new keys automatically) / `build`; OG meta byte-identity unaffected
(footer + tab-panel edits only). Then a visual pass by the human: footer text,
and the new ⓘ on hover/click in `?lang=ja` and English.

## Dependency changes

None.
