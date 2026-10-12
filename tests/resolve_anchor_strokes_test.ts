import { assert, assertEquals, assertThrows } from "@std/assert";
import { resolveAnchorStrokes } from "color-formatter/resolve-anchor-strokes";

// The headline cases here are the ones with no test coverage before this file:
// nothing previously asserted *which* colors a randomization anchors to, and the
// palette drifted for exactly that reason.

const ARTWORK = ["rgb(170 170 170)", "rgb(0 0 0)", "rgb(255 255 255)"];
const CURRENT = ["rgb(219 144 175)", "rgb(0 0 0)", "rgb(255 255 255)"];

Deno.test("resolveAnchorStrokes: original ignores the current colors", () => {
  assertEquals(
    resolveAnchorStrokes("original", ARTWORK, CURRENT),
    ARTWORK,
  );
});

Deno.test("resolveAnchorStrokes: current ignores the artwork colors", () => {
  assertEquals(
    resolveAnchorStrokes("current", ARTWORK, CURRENT),
    CURRENT,
  );
});

Deno.test("resolveAnchorStrokes: either mode works when both sets agree", () => {
  // The common case: no groupColors override, so the two sets are identical and
  // the choice cannot be observed. Both must still return that set.
  assertEquals(resolveAnchorStrokes("original", ARTWORK, ARTWORK), ARTWORK);
  assertEquals(resolveAnchorStrokes("current", ARTWORK, ARTWORK), ARTWORK);
});

Deno.test("resolveAnchorStrokes: a group-count mismatch is rejected", () => {
  // Randomizing the groups that happen to match would leave the artwork half
  // rewritten, so this has to throw rather than return a partial result.
  assertThrows(
    () => resolveAnchorStrokes("original", ARTWORK.slice(0, 2), CURRENT),
    Error,
    "original anchor has 2 colors for 3 groups",
  );

  // A snapshot that is too long is just as wrong as one that is too short.
  assertThrows(
    () =>
      resolveAnchorStrokes(
        "original",
        [...ARTWORK, "rgb(1 2 3)"],
        CURRENT,
      ),
    Error,
    "original anchor has 4 colors for 3 groups",
  );

  // The check guards the artwork snapshot specifically. It cannot fire for
  // 'current', whose anchors are the very array it is compared against, so
  // there is nothing to assert there.
  assertEquals(
    resolveAnchorStrokes("current", ARTWORK, CURRENT.slice(0, 1)),
    CURRENT.slice(0, 1),
  );
});

Deno.test("resolveAnchorStrokes: the result is not aliased to a snapshot", () => {
  // If a caller mutated the returned array, the snapshot itself would change
  // and a later click would anchor on an already-randomized palette.
  const anchors = resolveAnchorStrokes("original", ARTWORK, CURRENT);
  anchors[0] = "rgb(1 1 1)";

  assertEquals(
    resolveAnchorStrokes("original", ARTWORK, CURRENT)[0],
    "rgb(170 170 170)",
    "mutating the result must not corrupt the artwork snapshot",
  );
});

Deno.test("resolveAnchorStrokes: repeated resolution is stable", () => {
  // The whole point of 'original': calling it twice with the same snapshot must
  // give the same anchors, so repeated clicks cannot walk the palette.
  const first = resolveAnchorStrokes("original", ARTWORK, CURRENT);
  const second = resolveAnchorStrokes("original", ARTWORK, [...first]);

  assertEquals(second, ARTWORK);
  assertEquals(second, first);
});

Deno.test("resolveAnchorStrokes: a single group is handled", () => {
  assertEquals(
    resolveAnchorStrokes("original", ["#4E8D09"], ["#000000"]),
    ["#4E8D09"],
  );
  assertThrows(
    () => resolveAnchorStrokes("original", [], ["#000000"]),
    Error,
    "original anchor has 0 colors for 1 groups",
  );
});

Deno.test("resolveAnchorStrokes: the artwork set is returned for 'original'", () => {
  // A plain content check, so a refactor that inverts the mode cannot pass on
  // the mismatch cases alone.
  const anchors = resolveAnchorStrokes("original", ARTWORK, CURRENT);
  assertEquals(anchors[0], "rgb(170 170 170)");
  assert(
    !anchors.includes("rgb(219 144 175)"),
    "the current palette must not leak into an 'original' anchor",
  );
});
