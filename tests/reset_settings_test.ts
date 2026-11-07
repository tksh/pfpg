import { assertEquals } from "@std/assert";
import { initResetSettings } from "modal/reset-settings";

// Reset must not drop `lang`. The language is app configuration, not artwork
// state, so a reader who resets the drawing should stay in the language they
// chose. The key set comes from `getStateUrlsOf*()` in `state/url-state-
// manager.ts`, which slices `SETTINGS_DEFAULTS` by index: adding a key to
// `UI_CONFIG_DEFAULTS` (or anywhere before it) would silently put `lang` — or
// shift the boundary onto some other key — inside a reset group, and only a
// test that drives the real listener catches that. Everything is stubbed
// locally because the listener reads `document`, `location` and `history`
// from the global object.

const START_HREF =
  "https://example.test/?bits=~7&lang=ja&themeColor=black&shapeToTrim=circle&removeSpaces=true";

interface FakeElement {
  checked: boolean;
  addEventListener(type: string, listener: () => void): void;
  click(): void;
}

function makeElement(): FakeElement {
  const listeners: Array<() => void> = [];
  return {
    checked: false,
    addEventListener(_type, listener) {
      listeners.push(listener);
    },
    click() {
      for (const listener of listeners) listener();
    },
  };
}

Deno.test("Reset clears state params but keeps ?lang", () => {
  const elements = new Map<string, FakeElement>([
    ["reset-settings", makeElement()],
    ["image-custom", makeElement()],
    ["ui-config", makeElement()],
    ["svg-optimize", makeElement()],
  ]);
  let reloads = 0;
  const location = {
    href: START_HREF,
    get search(): string {
      return new URL(this.href).search;
    },
    reload() {
      reloads++;
    },
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementById: (id: string) => elements.get(id) ?? null,
    },
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: location,
  });
  Object.defineProperty(globalThis, "history", {
    configurable: true,
    value: {
      replaceState: (_data: unknown, _unused: string, url: URL | string) => {
        location.href = String(url);
      },
    },
  });

  initResetSettings();

  // Tick all three boxes: the widest reset the UI can ask for.
  for (const id of ["image-custom", "ui-config", "svg-optimize"]) {
    const element = elements.get(id);
    if (element === undefined) throw new Error(`missing #${id}`);
    element.checked = true;
  }
  const resetButton = elements.get("reset-settings");
  if (resetButton === undefined) throw new Error("missing #reset-settings");
  resetButton.click();

  const params = new URL(location.href).searchParams;
  for (const cleared of ["themeColor", "shapeToTrim", "removeSpaces"]) {
    assertEquals(params.get(cleared), null, `${cleared} should be cleared`);
  }
  // Artwork data is not a setting: Reset leaves the drawing alone.
  assertEquals(params.get("bits"), "~7");
  assertEquals(params.get("lang"), "ja");
  assertEquals(reloads, 1);
});
