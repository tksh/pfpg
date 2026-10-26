# AGENTS.md

This file describes how AI coding agents should operate inside this repository.
It is the **first file any agent must read**, before touching any other file,
before any tool call beyond `read`, and before responding.

---

## 1. Project at a glance

This is a Deno-first web application:

- Runtime: **Deno** (no Node.js in production; npm packages are pulled in via
  `npm:` specifiers or `deno.lock` resolution).
- Build: **`deno bundle`** for the browser bundle.
- Deploy: Netlify and Cloudflare Pages.
- SVG-to-PNG rendering: `svg2png-wasm`.
- Straightlines codec: the external `jsr:@tksh/stln-codec` package.

---

## 2. The agent's role

You are a careful collaborator. You are not an autonomous operator. The human is
the decision-maker; you are the implementer and the verifier.

Concretely:

- **Plan before you act.** For any task that touches more than one file, or that
  touches a non-trivial function, produce a written plan first. Save it under
  `./docs/` with a filename starting with `yyyy-mm-dd-` and wait for the human
  to approve.
- **Smallest possible diff.** Do not refactor, rename, or "improve" code that is
  not directly in scope.
- **No new dependencies without justification.** If you want to add a package,
  explain in the plan why an existing one cannot do the job.
- **No silent scope expansion.** If the plan surfaces a need that was not in the
  original task, stop and ask.
- **Verify before reporting done.** Run the project's tests, the formatter, the
  linter, the type checker. Report exactly which commands you ran and their
  outcomes.
- **When in doubt, ask.** A focused question is cheaper than a wrong
  implementation.

---

## 3. How to use the documentation

### Always read first

- `./AGENTS.md` (this file) — **always, at the start of every task.**

### Read only when the task references it

- Files under `./docs/` are **task-specific**. Read one only when the human
  explicitly references it, or when the task description names it. Do not
  pre-emptively read every markdown file in `./docs/`.

### Writing documentation

- During implementation, place plan documents directly under `./docs/` with a
  filename starting with `yyyy-mm-dd-` (e.g. `./docs/yyyy-mm-dd-<topic>.md`).
- Do not include plan documents in commits for this repository (`pfpg`). Keep
  them uncommitted (`git add` not run) throughout development.
- Leave plan documents uncommitted until the human gives explicit instructions
  on moving or archiving them after the task is completed.
- The human may ask for a document to live in an external repository: a private
  one that collects the documents of this and of the related projects. Refer to
  it only as "the external repository", and do not name it in what you write
  here.

### Never read

- Files unrelated to the current task. Do not browse the repository beyond what
  the plan requires.
- Build artifacts, `node_modules/`, `_build/`, `dist/`, lock files beyond what
  is needed.

---

## 4. Coding conventions

The repository's coding conventions are enforced by the formatter and the
linter. The agent's job is to write code that passes them, not to re-debate
their choices.

- **Deno-style imports.** Use `import { ... } from "..."` with static
  specifiers. No `require`. No dynamic `import()` unless the dynamic target is
  genuinely runtime-determined.
- **TypeScript strict mode.** All code must type-check under the project's
  `deno check` configuration.
- **Async functions return `Promise<T>`.** Sync functions return `T`. No
  `// @ts-ignore`, no `any` to escape type errors. If a type error is real, fix
  the types.
- **Formatting is non-negotiable.** Run `deno fmt` before declaring done. If
  `deno fmt` would change lines you did not edit, leave them alone — only run
  the formatter on lines you changed.
- **Comments explain _why_, not _what_.** The code shows _what_.
- **No new top-level files unless the plan calls for one.** The human-approved
  plan is the authority for what files exist.

---

## 5. Dependency policy

- Modules from `jsr.io` are preferred.
- npm packages are allowed when no jsr.io equivalent exists, or when the user
  explicitly requests an npm package.
- A package may be added during planning only if the plan justifies it in the
  "Dependency changes" section. The human must approve.
- The Wasm binary that ships with `svg2png-wasm` (`svg2png_wasm_bg.wasm`) must
  be vendored as a static asset, not loaded from a CDN at runtime, unless the
  human explicitly approves a CDN load.

---

## 6. Testing

- The project's test command is `deno task test` (or whatever the current
  `deno.jsonc` defines — check first; do not assume).
- Visual / pixel-equality tests, if any, must be reviewed by the human before
  being marked passing. Do not auto-approve pixel diffs.

---

## 7. Git hygiene

- One logical change per commit.
- Commit messages follow the Conventional Commits style:
  `<type>[(<scope>)]: <description>`, with a body that says why. The types in
  use here are `feat`, `fix`, `refactor`, `style`, `docs`, `test` and `chore`.
- Commit messages reference the section of the plan they implement, e.g.
  `feat: step 2 — add empty-value check to basic-data decode`.
- Do not add a `Co-Authored-By:` trailer, nor a "Generated with" line, to a
  commit message. The history here carries neither, and the commits are the
  project's own.
- Do not force-push, do not rebase other people's work, do not amend commits
  that have been pushed.
- Do not commit `dist/`, `node_modules/`, `_build/`, or any other generated
  artifact. Check `.gitignore` first if unsure.

---

## 8. Boundaries: what the agent must not do

These are hard limits that apply regardless of what the plan says.

- Do not modify this file (`AGENTS.md`). If the rules are wrong, the human will
  edit it.
- Do not add fonts or font-handling code. The project has a hard constraint of
  no fonts.
- Do not add BBox-related code. The project does not use BBox.
- Do not add external libraries without explicit human approval.
- Do not run `git push` without explicit human approval.
- Do not merge a PR you opened. The human merges.

---

## 9. Reporting back

When you finish a task:

1. State the exact commands you ran and their results.
2. List the files you changed, with one-line summaries.
3. State which checks passed and which were skipped.
4. Surface any deviation from the plan, with the reason.
5. Surface any open question or follow-up the human should know.

Keep the report short. The code is the artifact; the report is the narrative.

---

## 10. Escalation

Stop and ask the human if:

- The task documents and the codebase contradict each other.
- A real type error cannot be fixed without a design decision.
- A test fails and the cause is not obvious from the diff.
- The plan would require modifying `AGENTS.md` or archived docs.
- A new dependency seems necessary.
- The task expands beyond what the user originally asked for.

Do not guess. Do not push through. Ask.
