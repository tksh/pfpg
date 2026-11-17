import { assert, assertEquals } from "@std/assert";
import {
  SETTINGS_DEFAULTS,
  SVG_OPTIMIZE_DEFAULTS,
  VISUAL_CONFIG_DEFAULTS,
} from "constants";
import {
  RENDER_SETTING_DEFAULTS,
  SVG_OPTIMIZE_SETTING_DEFAULTS,
  VISUAL_SETTING_DEFAULTS,
} from "libpfpg/settings";

// The library owns the render-setting schema; the app derives its maps from it.
// These tests fail if a key is added to one side only, which would let the
// browser and the OGP server disagree about the same URL.

Deno.test("app and library agree on the SVG optimization keys and defaults", () => {
  assertEquals(
    [...SVG_OPTIMIZE_DEFAULTS.entries()],
    [...SVG_OPTIMIZE_SETTING_DEFAULTS.entries()],
  );
});

Deno.test("app and library agree on the visual keys and defaults", () => {
  assertEquals(
    [...VISUAL_CONFIG_DEFAULTS.entries()],
    [...VISUAL_SETTING_DEFAULTS.entries()],
  );
});

Deno.test("the library's combined keys lead the app's settings in order", () => {
  const renderKeys = [...RENDER_SETTING_DEFAULTS.keys()];
  const appKeys = [...SETTINGS_DEFAULTS.keys()];

  // The library's keys are a prefix: the app appends its own UI-only keys.
  assertEquals(appKeys.slice(0, renderKeys.length), renderKeys);
  assert(
    appKeys.length > renderKeys.length,
    "the app is expected to add UI-only keys after the render keys",
  );

  // The hard-coded slice boundaries in url-state-manager.ts depend on the
  // SVG-optimize / visual split, so the sub-map sizes must not shift.
  assertEquals(SVG_OPTIMIZE_DEFAULTS.size, 3);
  assertEquals(VISUAL_CONFIG_DEFAULTS.size, 10);
});
