import { assertEquals } from "@std/assert";
import { decodeUrlParams } from "@tksh/stln-codec";
import { normalizeScalarParams } from "common-utils/read-url-params";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import {
  getState,
  getStateUrlsAsRawWithDefaultFill,
} from "state/url-state-manager";

const FIXTURES = new URL("./fixtures/", import.meta.url);
const search = Deno.readTextFileSync(
  new URL("showcase-202412_001.search.txt", FIXTURES),
).trim().slice(1);

Deno.test("scalar params keep their last occurrence at its original position", () => {
  const params = normalizeScalarParams(
    new URLSearchParams(
      "bits=first&groupColors=a&opacitySteps=0.1&x=1&bits=last&opacitySteps=0.2&groupColors=b&x=2",
    ),
  );
  assertEquals([...params.entries()], [
    ["x", "1"],
    ["bits", "last"],
    ["opacitySteps", "0.2"],
    ["groupColors", "b"],
    ["x", "2"],
  ]);
});

Deno.test("state reads and shared-image keys use the last scalar value", async () => {
  const originalLocation = Object.getOwnPropertyDescriptor(
    globalThis,
    "location",
  );
  Object.defineProperty(globalThis, "location", {
    configurable: true,
    value: {
      search:
        `?${search}&opacitySteps=0.1&opacitySteps=0.2&shapeToTrim=circle&shapeToTrim=square`,
    },
  });
  try {
    assertEquals(getState("opacitySteps"), "0.2");
    assertEquals(getState("groupColors"), undefined);
    assertEquals(getStateUrlsAsRawWithDefaultFill()["shapeToTrim"], "square");

    const repeated = new URLSearchParams(search);
    repeated.append("opacitySteps", "0.1");
    repeated.append("opacitySteps", "0.2");
    assertEquals(
      await getSharedImageKeyHash(repeated),
      await getSharedImageKeyHash(
        new URLSearchParams(`${search}&opacitySteps=0.2`),
      ),
    );

    const duplicateGroupColors = new URLSearchParams(search);
    duplicateGroupColors.append("groupColors", "F00");
    duplicateGroupColors.append("groupColors", "F0F");
    assertEquals(
      await getSharedImageKeyHash(duplicateGroupColors),
      await getSharedImageKeyHash(
        new URLSearchParams(`${search}&groupColors=F0F`),
      ),
    );

    const duplicateBits = new URLSearchParams(search);
    const lastBits = duplicateBits.get("bits");
    if (lastBits === null) throw new Error("fixture must include bits");
    duplicateBits.append("bits", "invalid");
    duplicateBits.append("bits", lastBits);
    assertEquals(
      await getSharedImageKeyHash(duplicateBits),
      await getSharedImageKeyHash(
        new URLSearchParams(`${search}&bits=${lastBits}`),
      ),
    );
  } finally {
    if (originalLocation === undefined) {
      Reflect.deleteProperty(globalThis, "location");
    } else {
      Object.defineProperty(globalThis, "location", originalLocation);
    }
  }
});

Deno.test("repeated line-group params remain separate groups", async () => {
  const params = new URLSearchParams(search);
  const basics = new Set(["bits", "version", "title", "desc", "metadata"]);
  const group = [...params.entries()].find(([key]) => !basics.has(key));
  if (group === undefined) throw new Error("fixture must have a line group");
  const before = await decodeUrlParams(params);
  params.append(group[0], group[1]);
  const normalized = normalizeScalarParams(params);
  const after = await decodeUrlParams(normalized);
  assertEquals(after.linesData.size, before.linesData.size + 1);
});
