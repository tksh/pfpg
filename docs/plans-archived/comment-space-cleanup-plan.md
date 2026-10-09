# Comment-space cleanup plan

## Goal

Normalize `//` comments that have 2+ spaces between `//` and the first non-space
character (e.g. `//      some thing` → `// some thing`), leftover from vertical
alignment. Preview first, delete only after approval.

## Scope

- Entire repo, excluding `.git/`, `node_modules/`, `dist/`, `_build/`.
- Text files only (UTF-8 decodable). Binary files skipped.
- Only the leading gap after each `//` is collapsed to one space. Inner
  alignment spaces (e.g. inside `['Attribute name',   default]`) are left alone.
- Separator lines (`////...`), single-space comments (`// x`), and URLs
  (`https://`) are untouched by the regex.

## Dependency changes

None. Temporary preview script uses Python stdlib only.

## Steps

1. (done next) Write `/tmp/opencode/preview_comment_spaces.py` with `--preview`
   (default) and `--fix` modes.
2. Run preview across repo root, show file:line results.
3. Human reviews preview, approves/adjusts scope.
4. Only after approval: run with `--fix`, then verify: `deno fmt --check`,
   `deno lint`, `deno check`, `deno task test` (exact test command confirmed
   from `deno.jsonc` first).
5. Move this plan to `./docs/archive/` once complete.

## Risks

- `//` inside string literals (e.g. `"a //  b"`) would false-positive on a naive
  regex. Preview output must be reviewed for these.
- No repo files are modified during preview. Fix mode is gated on explicit human
  approval.
