import { assert, assertEquals } from "@std/assert";
import { syncSvgOptimizationUi } from "modal/optimize-svg";

// The SVG itself is rendered from the URL, so the modal's controls are the only
// thing that can disagree with it. The markup ships with every option unchecked,
// which is why opening `?removeOpacity=true` used to show an unchecked box next
// to a sample claiming the option was off.
//
// The listener reads `document`, `location` and `history`, so everything is
// stubbed locally, the same way `reset_settings_test.ts` does it.

interface FakeClassList {
  values: Set<string>;
  toggle(name: string, force?: boolean): void;
  contains(name: string): boolean;
}

interface FakeElement {
  checked: boolean;
  classList: FakeClassList;
}

function makeClassList(): FakeClassList {
  const values = new Set<string>();
  return {
    values,
    toggle(name, force) {
      const next = force ?? !values.has(name);
      if (next) values.add(name);
      else values.delete(name);
    },
    contains(name) {
      return values.has(name);
    },
  };
}

function makeCheckbox(): FakeElement {
  return { checked: false, classList: makeClassList() };
}

function makeSample(initial: string[] = []): FakeElement {
  const classList = makeClassList();
  for (const name of initial) classList.values.add(name);
  return { checked: false, classList };
}

function withDom(
  elements: Map<string, FakeElement>,
  href: string,
  run: () => void,
): void {
  const original = {
    document: globalThis.document,
    location: globalThis.location,
    history: globalThis.history,
  };

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      getElementById(id: string) {
        return elements.get(id) ?? null;
      },
      querySelector(selector: string) {
        const id = selector.replace(/^#/, "");
        return elements.get(id) ?? null;
      },
    },
  });
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: { search: href.slice(href.indexOf("?")) },
  });
  Object.defineProperty(globalThis, "history", {
    configurable: true,
    value: { replaceState() {} },
  });

  try {
    run();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) {
        Reflect.deleteProperty(globalThis, key);
      } else {
        Object.defineProperty(globalThis, key, { configurable: true, value });
      }
    }
  }
}

function setup(removeOpacity: boolean): Map<string, FakeElement> {
  const elements = new Map<string, FakeElement>();
  for (const id of ["remove-opacity", "remove-line-breaks", "remove-spaces"]) {
    elements.set(id, makeCheckbox());
    elements.set(`before-${id}`, makeSample(["option-applied"]));
    elements.set(`after-${id}`, makeSample());
  }
  elements.get("remove-opacity")!.checked = removeOpacity;
  return elements;
}

Deno.test("the modal reflects removeOpacity from the URL", () => {
  const elements = setup(true);
  withDom(elements, "?removeOpacity=true", () => {
    syncSvgOptimizationUi();
  });

  assertEquals(elements.get("remove-opacity")!.checked, true);
  // before- is the "option off" sample, so it must lose the highlight.
  assert(
    !elements.get("before-remove-opacity")!.classList.contains(
      "option-applied",
    ),
  );
  assert(
    elements.get("after-remove-opacity")!.classList.contains("option-applied"),
  );
});

Deno.test("the modal leaves unchecked options alone", () => {
  const elements = setup(false);
  withDom(elements, "?removeSpaces=true", () => {
    syncSvgOptimizationUi();
  });

  assert(!elements.get("remove-opacity")!.classList.contains("option-applied"));
  // removeSpaces is on, so its "after" sample is highlighted.
  assert(elements.get("remove-spaces")!.checked === true);
  assert(
    elements.get("after-remove-spaces")!.classList.contains("option-applied"),
  );
});
