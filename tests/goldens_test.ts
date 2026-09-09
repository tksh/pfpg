import { assert, assertEquals, assertMatch } from "@std/assert";

const FIXTURES = new URL("./fixtures/", import.meta.url);

// Mirrors BASIC_DATA_KEYS in src/js/constants.js without importing legacy JS,
// keeping this Phase 0 test fully typed under strict + noUncheckedIndexedAccess.
const BASIC_DATA_KEYS = [
  "bits",
  "version",
  "title",
  "desc",
  "metadata",
] as const;

function readFixture(name: string): string {
  return Deno.readTextFileSync(new URL(name, FIXTURES)).trim();
}

// Phase 0 characterization test (plan §6 Phase 0, §8.6): golden INPUT
// fixtures exist, parse, and have the shapes the codec expects. Expected
// OUTPUT goldens are captured during library conformance (Phase 3).
Deno.test("golden input fixtures parse and carry required keys", () => {
  const basic = JSON.parse(
    readFixture("basic-data.sample-uint5.json"),
  ) as Record<
    string,
    unknown
  >;
  assertEquals(basic["bits"], "~5");
  for (const key of BASIC_DATA_KEYS) {
    assert(key in basic, `basic-data missing key: ${key}`);
  }

  const lines = JSON.parse(
    readFixture("lines-data.sample-uint5.json"),
  ) as Array<
    Record<string, unknown>
  >;
  assert(
    Array.isArray(lines) && lines.length > 0,
    "lines-data must be non-empty array",
  );
  const g0 = lines[0];
  assert(g0 !== undefined, "lines-data must have group 0");
  for (const key of ["g_id", "g_stroke", "id", "stroke_width", "d"] as const) {
    assert(key in g0, `lines-data[0] missing key: ${key}`);
  }

  const agg = JSON.parse(readFixture("agg-data.sample-uint5.json")) as Array<
    Record<string, unknown>
  >;
  assert(
    Array.isArray(agg) && agg.length > 0,
    "agg-data must be non-empty array",
  );
  const agg0 = agg[0];
  assert(agg0 !== undefined, "agg-data must have group 0");
  assertEquals(agg0["g_id"], 0);
});

Deno.test("showcase query strings carry bits and artwork params", () => {
  for (
    const name of [
      "showcase-202401_001.search.txt",
      "showcase-202412_001.search.txt",
    ]
  ) {
    const search = readFixture(name);
    assertMatch(search, /^\?bits=~/);
    const params = new URLSearchParams(search.slice(1));
    assert(params.has("bits"), `${name} must carry bits`);
    assert(params.has("title"), `${name} must carry title`);
  }
});
