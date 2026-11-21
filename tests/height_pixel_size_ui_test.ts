import { assert, assertEquals } from "@std/assert";
import { initHeightPixelSizeInputElements } from "tab-render/height-pixel-size";

const START_HREF = "https://example.test/?bits=~7&title=~202401_001";

interface FakeInput {
  id: string;
  value: string;
  min: string;
  max: string;
  step: string;
  validityReports: number;
  checkValidity(): boolean;
  reportValidity(): boolean;
  addEventListener(
    type: string,
    listener: (event: { target: FakeInput }) => void,
  ): void;
  fire(type: string): void;
}

function makeInput(id: string, min: string, max: string): FakeInput {
  const listeners: Array<(event: { target: FakeInput }) => void> = [];
  return {
    id,
    value: "256",
    min,
    max,
    step: "1",
    validityReports: 0,
    checkValidity() {
      const n = Number(this.value);
      if (this.value.trim() === "" || !Number.isFinite(n)) return false;
      return Number.isInteger(n) &&
        n >= Number(this.min) && n <= Number(this.max);
    },
    reportValidity() {
      this.validityReports++;
      return this.checkValidity();
    },
    addEventListener(_type, listener) {
      listeners.push(listener);
    },
    fire(_type) {
      for (const listener of listeners) listener({ target: this });
    },
  };
}

Deno.test("the height number input declares the URL parser's domain", async () => {
  const html = await Deno.readTextFile(
    new URL("../src/index.html", import.meta.url),
  );
  const input = html.match(/<input[^>]*id="png-size-number"[^>]*>/);
  assert(input !== null, "the height number input must exist");
  assert(input[0].includes('min="1"'), "the lower bound must be 1");
  assert(input[0].includes('max="4096"'), "the upper bound must be 4096");
});

Deno.test("an over-large height is reported and never reaches the URL", () => {
  const number = makeInput("png-size-number", "1", "4096");
  const range = makeInput("png-size-range", "2", "512");
  const decrement = makeInput("png-size-dec", "0", "0");
  const increment = makeInput("png-size-inc", "0", "0");
  const bySelector = new Map<string, FakeInput>([
    ["#png-size-number", number],
    ["#png-size-range", range],
    ["#png-size-dec", decrement],
    ["#png-size-inc", increment],
  ]);

  const original = {
    document: globalThis.document,
    location: globalThis.location,
    history: globalThis.history,
  };
  const location = {
    href: START_HREF,
    get search(): string {
      return new URL(this.href).search;
    },
  };
  let rewrites = 0;
  try {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: {
        querySelector: (selector: string) => bySelector.get(selector) ?? null,
        getElementById: (id: string) => bySelector.get(`#${id}`) ?? null,
      },
    });
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: location,
    });
    Object.defineProperty(globalThis, "history", {
      configurable: true,
      value: {
        replaceState: () => {
          rewrites++;
        },
      },
    });

    initHeightPixelSizeInputElements();
    number.value = "4960";
    number.fire("change");

    assertEquals(number.checkValidity(), false);
    assertEquals(number.validityReports, 1);
    // A refused edit must not leak into the slider, the URL or the rasterizer.
    assertEquals(range.value, "256");
    assertEquals(rewrites, 0);
    assertEquals(
      new URL(location.href).searchParams.get("heightPixelSize"),
      null,
    );
  } finally {
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: original.document,
    });
    Object.defineProperty(globalThis, "location", {
      configurable: true,
      value: original.location,
    });
    Object.defineProperty(globalThis, "history", {
      configurable: true,
      value: original.history,
    });
  }
});
