# Plan — Expand `deno task check` to Entire Project + Clean Stale Comments

## 1. Objective
- Change `deno task check` from 3 scoped entry files to the entire project, run it, fix issues.
- Remove unnecessary `deno.jsonc` comments that conflict with the current check/lint/fmt state.
- Report whether this conflicts with `AGENTS.md`.

## 2. Current state (verified)
- `deno.jsonc:33-36`:
  - `test`: `deno test --allow-read tests/`
  - `check`: `deno check tests/goldens_test.ts src/js/page-specific/index/main.ts src/js/page-specific/data-manipulator/main.ts`
  - `lint`: `deno lint` (expanded in prior task, now clean on 71 files)
  - `fmt`: `deno fmt && deno task fmt:fixtures`
- `deno.jsonc:27-32` stale scoping comment claims:
  - `src/js/**/*.js` has 199 lint / 146 fmt findings (no longer observed; lint passes on 71 files)
  - `scripts/*.ts` has 2 strict-check errors and fmt deviations (unverified under full check)
  - `tests/fixtures/*` byte-exact, never reformat (still true; guarded by `fmt.exclude` + `fmt:fixtures --check`)
  - Untouched legacy lines never reformatted (plan §8.5 reference)

## 3. Proposed change
1. `check` task: replace 3-file list with project-wide TS entry globs, e.g.:
   `deno check tests/*.ts src/**/*.ts scripts/*.ts`
   (exact glob to confirm during implementation; excludes `dist/`, fixtures JSON, `.html` bundle entries which `deno check` cannot type-check directly).
2. Comment cleanup in `deno.jsonc` only:
   - Delete or rewrite lines 27-32 if full `lint` + full `check` + `fmt --check` pass, since baseline counts no longer describe reality.
   - Keep: fixture byte-exact rationale (still load-bearing for `fmt.exclude` / `fmt:fixtures`), `svg2png-wasm` path workaround comment, copy/postprocessing why-comments.
   - No import-map, compilerOption, or task-logic changes beyond `check`.
3. Fix any new type errors with smallest diff; no `// @ts-ignore`, no `any` (per AGENTS.md §4).

## 4. Execution steps (post-approval only)
1. Edit `check` task.
2. Run `deno task check`; capture all errors, triage by `src/` vs `scripts/` vs `tests/`.
3. Fix type errors (real fixes only; escalate if a design decision is needed).
4. Clean stale comments in `deno.jsonc:27-32`; keep load-bearing why-comments.
5. Verify: `deno task check`, `deno task lint`, `deno task test`, `deno fmt --check` on touched files only.
6. Report per AGENTS.md §9 + explicit AGENTS.md-conflict assessment (§6 below).

## 5. Dependency changes
None.

## 6. AGENTS.md conflict assessment (to confirm in final report)
- No conflict expected:
  - §4 requires strict-mode type-checking of all code — expanding `check` fulfills it.
  - §6 says to check `deno.jsonc` for the test command, not assume — followed.
  - §2 requires plan + approval for multi-file work — this plan satisfies it.
  - §8 hard limits (no AGENTS.md edits, no fonts/BBox, no new libs, no push/merge) — none triggered.
- Only tension: §2 "smallest possible diff" vs project-wide fixes if full `check` surfaces many errors. Guard: stop after triage and ask if error count is large or a fix needs a design decision (§10 escalation).

## 7. Decision needed
Approve scope for `check`:
- (A) Recommended: `tests/*.ts + src/**/*.ts + scripts/*.ts` globs.
- (B) TS under `src/` + `tests/` only (leave `scripts/` scoped).
- Also confirm: delete stale baseline comment block entirely vs rewrite as history note.
