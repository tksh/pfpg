import {
  assert,
  assertEquals,
  assertMatch,
  assertRejects,
  assertThrows,
} from "@std/assert";
import { expandGroupColor } from "@tksh/group-colors-param-codec";
import {
  type AggregatedLinesData,
  type BasicData,
  bestMixEncode,
  compressToEncodedURIComponent,
  decodeUrlParams,
  encodeBasicData,
  encodeBigint64Dvals,
  encodeBruteforce53Diffs,
  encodeFour16Dvals,
  encodeGroupColors,
  encodeSwap63Dvals,
  encodeWidthsAndCounts,
  type EncodingMethodName,
  type LineGroup,
  mergeUrlParams,
} from "@tksh/stln-codec";
import { BASIC_DATA_KEYS, FLAGS_MAP, VISUAL_CONFIG_DEFAULTS } from "constants";
import { excludeStateKeys } from "common-utils/read-url-params";
import {
  buildCanonicalImageInput,
  CANONICAL_SETTING_KEYS,
  effectiveOpacityUint8,
  hashCanonicalImageInput,
  serializeCanonicalImageInput,
  SHARED_IMAGE_KEY_VERSION,
} from "shared-image/canonical-image-input";

const FIXTURES = new URL("./fixtures/", import.meta.url);
const UINT_N = 5;

function readFixture(name: string): string {
  return Deno.readTextFileSync(new URL(name, FIXTURES)).trim();
}

function readJson<T>(name: string): T {
  return JSON.parse(readFixture(name)) as T;
}

// The showcase query carries artwork data and the app's settings
function artworkSearch(
  overrides: Record<string, string> = {},
): URLSearchParams {
  const params = new URLSearchParams(
    readFixture("showcase-202412_001.search.txt").slice(1),
  );
  for (const [key, value] of Object.entries(overrides)) {
    if (value === "") params.delete(key);
    else params.set(key, value);
  }
  return params;
}

// Decode and project, the same two steps the page performs
async function keyFor(
  params: URLSearchParams,
): Promise<
  { input: ReturnType<typeof buildCanonicalImageInput>; key: string }
> {
  const decoded = await decodeUrlParams(excludeStateKeys(params));
  const input = buildCanonicalImageInput(params, decoded);
  return { input, key: hashCanonicalImageInput(input) };
}

function flagOf(group: "1st" | "2nd", method: string): string {
  const map = FLAGS_MAP.get(group);
  const flag = map?.get(method);
  if (flag === undefined) throw new Error(`flagOf: unknown ${group} ${method}`);
  return flag;
}

// Re-encode the fixture artwork with a specific codec method and compression,
// so the same drawing arrives through a different URL encoding.
async function encodedSearch(
  method: EncodingMethodName,
  compression: "uncompressed" | "deflateRaw",
): Promise<URLSearchParams> {
  const lines = readJson<LineGroup[]>("lines-data.sample-uint5.json");
  const agg = readJson<AggregatedLinesData[]>("agg-data.sample-uint5.json");
  const basic = readJson<BasicData>("basic-data.sample-uint5.json");

  const widthsAndCounts = encodeWidthsAndCounts(agg);
  const groupColors = encodeGroupColors(lines);

  const dvals = method === "bruteforce53"
    ? encodeBruteforce53Diffs(agg, UINT_N, 52)
    : method === "bigint64"
    ? encodeBigint64Dvals(lines, UINT_N)
    : method === "swap63"
    ? encodeSwap63Dvals(lines)
    : encodeFour16Dvals(lines, UINT_N);

  const pairs: string[] = [];
  for (const [gId, dval] of dvals) {
    const widths = widthsAndCounts.get(gId);
    const colors = groupColors.get(gId);
    if (widths === undefined || colors === undefined) {
      throw new Error(`encodedSearch: missing widths/colors for group ${gId}`);
    }
    const payload = `${flagOf("2nd", method)}${widths}-${dval}`;
    const flagged = compression === "uncompressed"
      ? `${flagOf("1st", "uncompressed")}${payload}`
      : `${flagOf("1st", "deflateRaw")}${await compressToEncodedURIComponent(
        payload,
        "deflate-raw",
      )}`;
    pairs.push(`${colors}=${flagged}`);
  }

  return new URLSearchParams(
    mergeUrlParams(encodeBasicData(basic), pairs.join("&")),
  );
}

Deno.test("canonical settings follow the visual config order", () => {
  const visualKeys = [...VISUAL_CONFIG_DEFAULTS.keys()];
  const positions = CANONICAL_SETTING_KEYS.map((key) => {
    const position = visualKeys.indexOf(key);
    assert(position >= 0, `${key} must be a VISUAL_CONFIG_DEFAULTS key`);
    return position;
  });
  const sorted = [...positions].sort((a, b) => a - b);
  assertEquals(positions, sorted, "settings must keep the map's order");

  // The excluded visual keys must be ones that cannot change the pixels
  const excluded = visualKeys.filter((key) =>
    !(CANONICAL_SETTING_KEYS as readonly string[]).includes(key)
  );
  assertEquals(excluded, [
    "groupColors",
    "pathMode",
    "opacitySteps",
    "colorFormat",
  ]);
});

Deno.test("showcase artwork decodes to a stable 32-char key", async () => {
  const params = artworkSearch();
  const first = await keyFor(params);
  const second = await keyFor(params);

  assertMatch(first.key, /^[0-9a-f]{32}$/);
  assertEquals(first.key, second.key);
  assertEquals(
    serializeCanonicalImageInput(first.input),
    serializeCanonicalImageInput(second.input),
  );
  assert(
    serializeCanonicalImageInput(first.input).startsWith(
      `["${SHARED_IMAGE_KEY_VERSION}",`,
    ),
    "the version must be part of the hashed text",
  );
  assertEquals(first.input.canvas.length, 2);
  assert(first.input.groups.length > 0, "artwork must have line groups");
  // One line entry per expanded width
  for (const group of first.input.groups) {
    assertEquals(group.lines.length, group.widths.length);
  }
});

Deno.test("codec encodings of the same drawing share one key", async () => {
  // four16 is not usable with these fixtures: its encoder requires UInt7 or
  // UInt8 artwork, and the sample data is UInt5
  const methods: EncodingMethodName[] = [
    "bruteforce53",
    "bigint64",
    "swap63",
  ];
  const lines = readJson<LineGroup[]>("lines-data.sample-uint5.json");
  const agg = readJson<AggregatedLinesData[]>("agg-data.sample-uint5.json");

  const { input: referenceInput, key: reference } = await keyFor(
    new URLSearchParams(
      mergeUrlParams(
        encodeBasicData(readJson<BasicData>("basic-data.sample-uint5.json")),
        (await bestMixEncode({
          lines,
          agg,
          uintN: UINT_N,
          widthsAndCounts: encodeWidthsAndCounts(agg),
          groupColors: encodeGroupColors(lines),
        })).params,
      ),
    ),
  );

  for (const method of methods) {
    for (const compression of ["uncompressed", "deflateRaw"] as const) {
      const { input, key } = await keyFor(
        await encodedSearch(method, compression),
      );
      assertEquals(
        key,
        reference,
        `${method}/${compression} must share the key`,
      );
      assertEquals(
        serializeCanonicalImageInput(input),
        serializeCanonicalImageInput(referenceInput),
      );
    }
  }
});

Deno.test("omitted settings match explicitly written defaults", async () => {
  const omitted = await keyFor(artworkSearch());

  const explicit = artworkSearch({
    shapeToTrim: String(VISUAL_CONFIG_DEFAULTS.get("shapeToTrim")),
    widthNarrowness: String(VISUAL_CONFIG_DEFAULTS.get("widthNarrowness")),
    topHeavyRatio: String(VISUAL_CONFIG_DEFAULTS.get("topHeavyRatio")),
    cropSideMargins: String(VISUAL_CONFIG_DEFAULTS.get("cropSideMargins")),
    shapeRendering: String(VISUAL_CONFIG_DEFAULTS.get("shapeRendering")),
    heightPixelSize: String(VISUAL_CONFIG_DEFAULTS.get("heightPixelSize")),
  });
  const written = await keyFor(explicit);

  assertEquals(written.key, omitted.key);
  // The URL text differs even though the key does not
  assert(
    explicit.toString() !== artworkSearch().toString(),
    "the explicit query must actually carry the settings",
  );
});

Deno.test("settings that change the pixels change the key", async () => {
  const reference = await keyFor(artworkSearch());

  const overrides: Array<Record<string, string>> = [
    { shapeToTrim: "circle" },
    { widthNarrowness: "12" },
    { topHeavyRatio: "-1" },
    { cropSideMargins: "false" },
    { shapeRendering: "geometricPrecision" },
    { heightPixelSize: "512" },
  ];
  for (const override of overrides) {
    const { key } = await keyFor(artworkSearch(override));
    assert(key !== reference.key, `${JSON.stringify(override)} must differ`);
  }
});

Deno.test("settings that cannot change the pixels keep the key", async () => {
  const reference = await keyFor(artworkSearch());

  const overrides: Array<Record<string, string>> = [
    { pathMode: "relativeMerged" },
    { colorFormat: "hex" },
    { opacitySteps: "0.1" },
    { themeColor: "dark" },
    { viewScaling: "actual" },
    // The pixels are identical in both encodings, so the key is too
    { imageFormat: "webp" },
  ];
  for (const override of overrides) {
    const { key } = await keyFor(artworkSearch(override));
    assertEquals(key, reference.key, `${JSON.stringify(override)} must match`);
  }
});

Deno.test("opacitySteps is only reflected through the effective pixels", async () => {
  const reference = await keyFor(artworkSearch());

  // Unsupported values are "not specified": the drawn pixels are unchanged,
  // so the key stays identical.
  for (
    const step of ["0", "-0.1", "0.3", "0.5", "0.07", "1", "true", "abc", ""]
  ) {
    assertEquals(
      (await keyFor(artworkSearch({ opacitySteps: step }))).key,
      reference.key,
      `opacitySteps=${step} must not change the key`,
    );
  }

  // The fixture artwork sits exactly on the 0.04 / 0.1 / 0.2 grids, so the
  // allowed steps snap nothing and the key is unchanged.
  for (const step of ["0.04", "0.1", "0.2"]) {
    assertEquals(
      (await keyFor(artworkSearch({ opacitySteps: step }))).key,
      reference.key,
      `opacitySteps=${step} must not change these pixels`,
    );
  }

  // Off-grid artwork: the same drawing, but snap pulls it onto the grid.
  // 10-digit groupColors slot "FF00000080" → stroke color red, strokeOpacity 0.5.
  const override = { groupColors: "FF00000080" };
  const plain = await keyFor(artworkSearch(override));
  assertEquals(
    (await keyFor(artworkSearch({ ...override, opacitySteps: "0.1" }))).key,
    plain.key,
    "0.1 includes 0.5 exactly — same drawing, same key",
  );
  for (const step of ["0.04", "0.2"]) {
    assert(
      (await keyFor(artworkSearch({ ...override, opacitySteps: step }))).key !==
        plain.key,
      `step ${step} pulls 0.5 onto the grid — different pixels, different key`,
    );
  }
});

Deno.test("effectiveOpacityUint8: snap rules match the UI", () => {
  // No opacitySteps → verbatim.
  assertEquals(effectiveOpacityUint8(128, undefined), 128);
  // 0.1 grid includes 0.5 exactly.
  assertEquals(effectiveOpacityUint8(128, 0.1), 128);
  // 0.2 grid: 0.5 is equidistant to 0.4 and 0.6; the earlier/larger wins.
  assertEquals(effectiveOpacityUint8(128, 0.2), 153); // 0.6
  // 0.04 grid: 0.5 is not on the grid; tie between 0.48 and 0.52.
  assertEquals(effectiveOpacityUint8(128, 0.04), 133); // 0.52
  // Values already on a grid stay put.
  assertEquals(effectiveOpacityUint8(102, 0.04), 102); // 0.4
  assertEquals(effectiveOpacityUint8(153, 0.1), 153); // 0.6
  assertEquals(effectiveOpacityUint8(204, 0.2), 204); // 0.8
  // Endpoints.
  assertEquals(effectiveOpacityUint8(0, 0.1), 0);
  assertEquals(effectiveOpacityUint8(255, 0.1), 255);
});

Deno.test("group color overrides canonicalize to the effective colors", async () => {
  const params = artworkSearch();
  const artworkParams = excludeStateKeys(params);
  const decoded = await decodeUrlParams(artworkParams);
  const firstGroup = decoded.linesData.get(0);
  if (firstGroup === undefined) throw new Error("fixture must have group 0");
  const original = firstGroup.groupColors;

  // The artwork's own shortened key, and the same color written out in full
  const basicKeys = new Set<string>(BASIC_DATA_KEYS);
  const firstGroupKey = [...artworkParams.keys()].find((key) =>
    !basicKeys.has(key)
  );
  if (firstGroupKey === undefined) throw new Error("fixture must have groups");
  const withoutOverride = await keyFor(params);
  assertEquals(
    withoutOverride.input.groups[0]?.style,
    [
      original.gStrokeRgbArr[0],
      original.gStrokeRgbArr[1],
      original.gStrokeRgbArr[2],
      original.gOpacityUint8,
      original.gStrokeOpacityUint8,
    ],
  );

  for (
    const spelling of [firstGroupKey, expandGroupColor(firstGroupKey)]
  ) {
    const withOverride = await keyFor(artworkSearch({ groupColors: spelling }));
    assertEquals(
      withOverride.key,
      withoutOverride.key,
      `override '${spelling}' must not change the effective color`,
    );
  }

  // Overriding with a different color must change the key
  const recolored = await keyFor(artworkSearch({ groupColors: "F0F" }));
  assert(recolored.key !== withoutOverride.key);
});

Deno.test("partial group color overrides leave other groups alone", async () => {
  const params = artworkSearch();
  const decoded = await decodeUrlParams(excludeStateKeys(params));
  const groupCount = decoded.linesData.size;
  assert(groupCount > 1, "fixture must have several groups");

  // One override for a 6-group artwork: the untouched groups keep their colors
  const partial = await keyFor(artworkSearch({ groupColors: "F0F" }));
  const plain = await keyFor(params);
  assert(partial.key !== plain.key);
  assertEquals(partial.input.groups.length, groupCount);
  assertEquals(partial.input.groups[1]?.style, plain.input.groups[1]?.style);

  // An override for every group is a different drawing again
  const all = await keyFor(
    artworkSearch({ groupColors: new Array(groupCount).fill("F0F").join("_") }),
  );
  assert(all.key !== partial.key);
});

Deno.test("unusable values throw instead of reusing another key", async () => {
  const decoded = await decodeUrlParams(excludeStateKeys(artworkSearch()));
  const build = (overrides: Record<string, string>) =>
    buildCanonicalImageInput(artworkSearch(overrides), decoded);

  assertThrows(
    () => build({ widthNarrowness: "abc" }),
    Error,
    "widthNarrowness",
  );
  assertThrows(() => build({ topHeavyRatio: "NaN" }), Error, "topHeavyRatio");
  assertThrows(
    () => build({ heightPixelSize: "tall" }),
    Error,
    "heightPixelSize",
  );
  assertThrows(() => build({ groupColors: "nothex" }), Error);
  assertThrows(() => build({ groupColors: "FF" }), Error, "expected 1, 3, 5");

  // The app parses the height the same lenient way, so the key follows it
  assertEquals(build({ heightPixelSize: "300px" }).settings[5], 300);
  // ...and an unknown shape falls through to the squircle clip path
  assertEquals(build({ shapeToTrim: "nope" }).settings[0], "squircle");
  assertEquals(build({ cropSideMargins: "yes" }).settings[3], false);
  assertEquals(build({ cropSideMargins: "TRUE" }).settings[3], true);
});

Deno.test("a broken query produces no key at all", async () => {
  const broken = new URLSearchParams("bits=~5&0=~0broken");
  await assertRejects(() => decodeUrlParams(broken));
});
