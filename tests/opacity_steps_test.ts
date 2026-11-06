import { assert, assertEquals, assertThrows } from "@std/assert";
import { isAllowedOpacityStep, OPACITY_STEP_VALUES } from "constants";
import { numbersIncrementByStep } from "tab-lines/opacity-steps-grid";

// The closed three-value set: {0.04, 0.1, 0.2}. Anything else from a URL is
// treated as "not specified" (browser: param dropped; render path: default
// step is used). Keep `index.html`'s <option> list in lockstep with
// `OPACITY_STEP_VALUES` — drift makes the select hand an unlisted value to
// the generator.

Deno.test("OPACITY_STEP_VALUES matches the #opacity-steps options in index.html", () => {
  const html = Deno.readTextFileSync("src/index.html");
  const match = html.match(
    /<select[^>]*id="opacity-steps"[^>]*>([\s\S]*?)<\/select>/,
  );
  const block = match?.[1];
  assert(block !== undefined, "could not locate the #opacity-steps select");
  const optionValues = Array.from(
    block.matchAll(/<option value="([^"]+)"/g),
  ).map((m) => Number(m[1]));
  assertEquals(optionValues, [...OPACITY_STEP_VALUES]);
});

Deno.test("isAllowedOpacityStep accepts the three UI values, numerically", () => {
  for (
    const raw of [
      "0.04",
      "0.1",
      "0.2",
      "0.20",
      "0.040",
      "0.10",
      0.04,
      0.1,
      0.2,
    ]
  ) {
    assert(isAllowedOpacityStep(raw), `expected accepted: ${String(raw)}`);
  }
});

Deno.test("isAllowedOpacityStep rejects everything else", () => {
  for (
    const raw of [
      "0",
      "-0.1",
      "0.3",
      "0.5",
      "0.07",
      "1",
      "abc",
      "",
      " ",
      true,
      false,
      undefined,
      null,
    ]
  ) {
    assert(!isAllowedOpacityStep(raw), `expected rejected: ${String(raw)}`);
  }
});

Deno.test("numbersIncrementByStep throws RangeError for invalid steps", () => {
  for (
    const step of [0, -0.1, Number.NaN, Number.POSITIVE_INFINITY, 2]
  ) {
    assertThrows(
      () => numbersIncrementByStep(step),
      RangeError,
    );
  }
});

Deno.test("numbersIncrementByStep returns the descending grid for the valid steps", () => {
  assertEquals(numbersIncrementByStep(0.2)[0], "1.0");
  assertEquals(numbersIncrementByStep(0.2).length, 6);
  assertEquals(numbersIncrementByStep(0.1).length, 11);
  assertEquals(numbersIncrementByStep(0.04).length, 26);
  // Same tie-break contract as the UI (descending, ties to the earlier/larger).
  assertEquals(numbersIncrementByStep(0.2), [
    "1.0",
    "0.8",
    "0.6",
    "0.4",
    "0.2",
    "0.0",
  ]);
});
