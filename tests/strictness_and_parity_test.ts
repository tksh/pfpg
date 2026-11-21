import { assertEquals, assertRejects, assertThrows } from "@std/assert";
import { initSvg2rgba } from "svg2ui8a";
import { excludeStateKeys } from "common-utils/read-url-params";
import { decodeArtwork } from "libpfpg/decode";
import {
  parseStartupUrl,
  validateArtworkConstraints,
  validateParamsSchema,
} from "state/param-validator";
import { getSharedImageKeyHash } from "shared-image/shared-image-key";
import {
  InvalidOgpParamsError,
  renderPipeline,
  resolveImageMeta,
} from "../server/ogp-render.ts";

// The four paths that can consume a shared URL: the browser's startup parse,
// the shared-image key, /ogp/render and /ogp/image-meta. A value rejected on
// one must be rejected on all of them, with the same offending key named.
const fixture = new URLSearchParams(
  (await Deno.readTextFile(
    "tests/fixtures/showcase-202412_001.search.txt",
  )).trim().slice(1),
);
const decoded = await decodeArtwork(excludeStateKeys(fixture), {
  cache: false,
});

interface InvalidCase {
  name: string;
  key: string;
  value: string;
  message: string;
}

const INVALID_CASES: readonly InvalidCase[] = [
  {
    name: "widthNarrowness outside the UI set",
    key: "widthNarrowness",
    value: "12",
    message: "widthNarrowness",
  },
  {
    name: "topHeavyRatio outside the UI set",
    key: "topHeavyRatio",
    value: "4",
    message: "topHeavyRatio",
  },
  {
    name: "heightPixelSize with a unit",
    key: "heightPixelSize",
    value: "96px",
    message: "heightPixelSize",
  },
  {
    name: "heightPixelSize above the cap",
    key: "heightPixelSize",
    value: "4097",
    message: "heightPixelSize",
  },
  {
    name: "uppercase boolean",
    key: "cropSideMargins",
    value: "TRUE",
    message: "cropSideMargins",
  },
  {
    name: "unsupported opacitySteps",
    key: "opacitySteps",
    value: "0.3",
    message: "opacitySteps",
  },
  {
    name: "invalid themeColor",
    key: "themeColor",
    value: "almost-black",
    message: "themeColor",
  },
  {
    name: "uppercase UI boolean",
    key: "checkerboardBg",
    value: "TRUE",
    message: "checkerboardBg",
  },
  {
    name: "invalid imageFormat",
    key: "imageFormat",
    value: "jpg",
    message: "imageFormat",
  },
  { name: "uppercase locale", key: "lang", value: "JA", message: "lang" },
  { name: "unknown locale", key: "lang", value: "xx", message: "lang" },
  {
    name: "more groupColors than groups",
    key: "groupColors",
    value: new Array(decoded.linesData.size + 1).fill("F0F").join("_"),
    message: "Excess groupColors",
  },
];

for (const invalid of INVALID_CASES) {
  Deno.test(`all four paths reject ${invalid.name}`, async () => {
    const params = new URLSearchParams(fixture);
    params.set(invalid.key, invalid.value);

    // Browser startup: Stage 1 runs before any URL/DOM work; Stage 2 follows
    // the decode. Neither may produce a value the renderer could use.
    assertThrows(
      () => {
        const validated = validateParamsSchema(params);
        validateArtworkConstraints(decoded, validated);
      },
      Error,
      invalid.message,
    );

    await assertRejects(
      () => getSharedImageKeyHash(params, decoded),
      Error,
      invalid.message,
    );
    await assertRejects(
      () => renderPipeline(params),
      InvalidOgpParamsError,
      invalid.message,
    );
    await assertRejects(
      () => resolveImageMeta(params, "testcloud"),
      InvalidOgpParamsError,
      invalid.message,
    );
  });
}

Deno.test("an invalid URL produces no normalized search to write back", () => {
  const invalid = new URLSearchParams(fixture);
  invalid.set("heightPixelSize", "96px");
  assertThrows(
    () => parseStartupUrl(`?${invalid.toString()}`),
    RangeError,
    "heightPixelSize",
  );

  const valid = parseStartupUrl(`?${fixture.toString()}`);
  assertEquals(valid.normalizedSearch, fixture.toString());
});

Deno.test("all four paths accept a valid shared URL", async () => {
  await initSvg2rgba({
    wasmUrl:
      new URL("../src/assets/svg2ui8a/svg2rgba_bg.wasm", import.meta.url).href,
  });
  const params = new URLSearchParams(fixture);
  params.set("lang", "ja");
  params.set("themeColor", "dark");
  params.set("heightPixelSize", "256");

  const validated = validateParamsSchema(params);
  validateArtworkConstraints(decoded, validated);
  const key = await getSharedImageKeyHash(params, decoded, validated);
  const rendered = await renderPipeline(params);
  const meta = await resolveImageMeta(params, "testcloud");

  assertEquals(key, rendered.key);
  assertEquals(meta.key, rendered.key);
});
