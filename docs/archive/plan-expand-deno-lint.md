# Plan — Expand `deno task lint` to Entire Project

## 1. Objective
Change `deno task lint` from `"lint": "deno lint tests/goldens_test.ts"` to lint the entire project, run it, and fix reported issues.

## 2. Current state (verified)
- File: `deno.jsonc:35` → `"lint": "deno lint tests/goldens_test.ts"`.
- `deno.jsonc:27-32` comment states the scoping rationale:
  - `src/js/**/*.js` has 199 lint / 146 fmt findings.
  - `scripts/*.ts` has 2 strict-check errors and fmt deviations.
  - `tests/fixtures/*` are byte-exact copies that must never be reformatted.
- `fmt.exclude` currently only excludes `tests/fixtures/*.json`.

## 3. Proposed change
- `deno.jsonc`: change to `"lint": "deno lint"`.
- No other config change in Step 1. No new files. No new dependencies.
- This is a 1-line diff in scope; fixes that follow are the multi-file part.

## 4. Execution steps (post-approval only)
1. Edit `deno.jsonc` lint task.
2. Run `deno task lint` (full project) and capture complete output to a file for triage.
3. Triage findings by area:
   - a. `tests/goldens_test.ts` (currently clean — expect no change).
   - b. `src/**/*.ts` (new TS code — fix all).
   - c. `scripts/*.ts` (known strict/fmt issues — fix if lint-related, else escalate).
   - d. `src/js/**/*.js` legacy (199 known findings — needs decision, see §6).
4. Fix lint issues with smallest possible diff:
   - Prefer rule-compliant code fixes over `// deno-lint-ignore`.
   - Use `deno-lint-ignore` only with `why` explanation if a legacy pattern cannot be safely changed.
   - No renames/refactors outside flagged lines.
   - Respect hard limits: no fonts, no BBox, no new external libraries, no `git push`.
5. Verify:
   - `deno task lint` passes.
   - `deno task test`.
   - `deno fmt --check` on touched files only (do not reformat untouched legacy lines per `deno.jsonc` comment / plan §8.5).
   - `deno task check` if touched TS files overlap its scope.
6. Report per AGENTS.md §9: commands run + outcomes, files changed, checks passed/skipped, deviations, follow-ups.

## 5. Dependency changes
None. No package will be added.

## 6. Decision needed before fixing (scope guard)
Expanding lint will likely re-surface the ~199 legacy `src/js/**/*.js` findings noted in `deno.jsonc`. Fixing all of them in one task violates “smallest possible diff / no silent scope expansion.”

Please choose one:
- (A) Fix all lint findings everywhere, including legacy JS (Recommended if goal is fully clean `deno lint`, but expect large diff).
- (B) Expand `deno task lint` to entire project but add `lint.exclude` for legacy `src/js/**` + fixtures, then fix only non-excluded findings (keeps diff small, leaves legacy tech debt explicit).
- (C) Expand lint with no excludes and fix only `*.ts` + `scripts/*` + `tests/*`, leaving `src/js/**/*.js` failures open as follow-up.

I will not edit code until you approve this plan and choose A/B/C.

## 7. Risks / Escalation triggers
- If full `deno lint` reports hundreds of findings, I will stop after triage and ask before bulk-fixing.
- If a lint fix requires a type/design decision, new dependency, or touching `AGENTS.md` / `docs/archive/`, I will stop and ask.
- Pixel-equality tests, if any, require human review — I will not auto-approve.
