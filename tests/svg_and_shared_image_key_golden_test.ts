import { assertEquals } from "@std/assert";
import { decodeUrlToSvg } from "@tksh/stln-codec";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";

// Phase 0 golden: the DOM-free codec decode and the shared-image key must
// produce byte-exact, version-stable outputs for the showcase query strings.
const FIXTURES = new URL("./fixtures/", import.meta.url);

const CASES = [
  {
    name: "showcase-202401_001",
    expectedKey: "a1f1eb2a11d68af082f0641be8fd057f",
  },
  {
    name: "showcase-202412_001",
    expectedKey: "19de98bbd147b6b41da1b228ddea70d9",
  },
] as const;

for (const { name, expectedKey } of CASES) {
  Deno.test(`golden SVG and key for ${name}`, async () => {
    const search = Deno.readTextFileSync(
      new URL(`${name}.search.txt`, FIXTURES),
    ).trim();
    const params = new URLSearchParams(search.slice(1));

    const { svg } = await decodeUrlToSvg(params, {
      pathMode: "absoluteSeparated",
    });
    const expectedSvg = Deno.readTextFileSync(
      new URL(`${name}.svg`, FIXTURES),
    );
    assertEquals(svg, expectedSvg);

    const key = await getSharedImageKeyHash(params);
    assertEquals(key, expectedKey);
  });
}
