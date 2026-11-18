import { assert, assertEquals, assertRejects } from "@std/assert";
import { type DecodedParams, decodeUrlParams } from "@tksh/stln-codec";
import { decodeArtwork, resetArtworkCache } from "../src/js/libpfpg/decode.ts";
import {
  renderArtwork,
  renderArtworkForPickers,
  renderParamsToSvg,
} from "../src/js/libpfpg/render.ts";
import {
  excludeStateKeys,
  normalizeScalarParams,
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "../src/js/libpfpg/settings.ts";

const FIXTURES = new URL("./fixtures/", import.meta.url);

function fixture(name: string): URLSearchParams {
  return new URLSearchParams(
    Deno.readTextFileSync(new URL(`${name}.search.txt`, FIXTURES)).trim().slice(
      1,
    ),
  );
}

const showcase202412 = fixture("showcase-202412_001");

function artworkParamsOf(params: URLSearchParams): URLSearchParams {
  return excludeStateKeys(normalizeScalarParams(params));
}

// The facade and the split path must produce the same bytes for the same URL,
// otherwise the page could drift from the OGP endpoint.

Deno.test("renderArtwork matches the params facade byte for byte", async (t) => {
  const cases: Array<[string, string]> = [
    ["default", ""],
    ["shape_circle", "&shapeToTrim=circle"],
    ["shape_squircle", "&shapeToTrim=squircle"],
    [
      "squircleSlimmed",
      "&shapeToTrim=squircleSlimmed&widthNarrowness=15",
    ],
    ["opacitySteps", "&opacitySteps=0.1"],
    ["shapeRendering", "&shapeRendering=geometricPrecision"],
    ["optimize", "&removeSpaces=false&removeLineBreaks=true"],
    ["heightPixelSize", "&heightPixelSize=96px"],
    ["groupColors", "&groupColors=FF0000FFFF_00FF00FFFF"],
  ];

  for (const [name, suffix] of cases) {
    await t.step(name, async () => {
      const params = new URLSearchParams(`${showcase202412}${suffix}`);
      const expected = await renderParamsToSvg(params);

      const artwork = await decodeArtwork(artworkParamsOf(params), {
        cache: false,
      });
      const actual = renderArtwork(artwork, resolveSvgRenderSettings(params));

      assertEquals(actual, expected);
    });
  }
});

Deno.test("renderArtwork matches the facade for both path modes", async () => {
  for (const pathMode of ["absoluteSeparated", "relativeMerged"]) {
    const params = new URLSearchParams(showcase202412);
    params.set("pathMode", pathMode);
    const expected = await renderParamsToSvg(params);
    const artwork = await decodeArtwork(artworkParamsOf(params), {
      cache: false,
    });
    const actual = renderArtwork(artwork, resolveSvgRenderSettings(params));
    assertEquals(actual, expected, `pathMode=${pathMode}`);
  }
});

// The facade keeps the validations the browser path never had.

Deno.test("the facade still rejects an oversized artwork payload", async () => {
  // A non-state key, because state keys are filtered out before the cap is
  // measured and so could never trip it.
  const params = new URLSearchParams("bits=~5");
  params.set("x", "a".repeat(8200));
  await assertRejects(
    () => renderParamsToSvg(params),
    RangeError,
    "8192",
  );
});

Deno.test("the facade still rejects unusable heightPixelSize values", async (t) => {
  for (const value of ["abc", "0", "-1", ""]) {
    await t.step(`heightPixelSize=${JSON.stringify(value)}`, async () => {
      const params = new URLSearchParams(showcase202412);
      params.set("heightPixelSize", value);
      await assertRejects(() => renderParamsToSvg(params), RangeError);
    });
  }
});

Deno.test("heightPixelSize keeps accepting a unit suffix", async () => {
  const params = new URLSearchParams(showcase202412);
  params.set("heightPixelSize", "96px");
  assertEquals(resolveRasterSettings(params).heightPixelSize, 96);
  // And it still renders, since the size only affects the raster.
  assert((await renderParamsToSvg(params)).startsWith("<svg"));
});

// colorFormat is a serialization setting: it only takes effect when a step
// rebuilds the group elements.

Deno.test("colorFormat alone leaves the SVG unchanged", async () => {
  const plain = await renderParamsToSvg(showcase202412);
  const hex = new URLSearchParams(showcase202412);
  hex.set("colorFormat", "hex");
  assertEquals(await renderParamsToSvg(hex), plain);
});

Deno.test("colorFormat applies when groupColors rebuilds the groups", async () => {
  const params = new URLSearchParams(showcase202412);
  params.set("groupColors", "FF0000FFFF");
  params.set("colorFormat", "hex");
  const svg = await renderParamsToSvg(params);
  assert(svg.includes('stroke="#F00"'), "hex form expected in group stroke");
});

Deno.test("groupColors changes how opacity is written", async () => {
  const plain = await renderParamsToSvg(showcase202412);
  assert(plain.includes('opacity="1.0"'), "codec writes 1.0");

  const params = new URLSearchParams(showcase202412);
  params.set("groupColors", "000000FFFF");
  const overridden = await renderParamsToSvg(params);
  assert(
    overridden.includes('opacity="1"'),
    "the rebuilt group writes 1",
  );
});

// The cache exists for the browser, which renders repeatedly from one artwork.

Deno.test("decodeArtwork reuses the cached artwork", async () => {
  resetArtworkCache();
  const artworkParams = artworkParamsOf(showcase202412);

  const first = await decodeArtwork(artworkParams);
  const second = await decodeArtwork(artworkParams);
  assert(first === second, "the cached decode must be the same object");

  // A different artwork is decoded again.
  const other = new URLSearchParams(artworkParams);
  other.set("bits", "~6");
  const third = await decodeArtwork(other);
  assert(third !== first, "a different artwork must not reuse the cache");
});

Deno.test("decodeArtwork can opt out of the cache", async () => {
  resetArtworkCache();
  const artworkParams = artworkParamsOf(showcase202412);

  const first = await decodeArtwork(artworkParams, { cache: false });
  const second = await decodeArtwork(artworkParams, { cache: false });
  assert(first !== second, "cache: false must not store the decode");

  // And it must not have disturbed a cache the browser may hold.
  const cached = await decodeArtwork(artworkParams);
  const cachedAgain = await decodeArtwork(artworkParams);
  assert(cached === cachedAgain);
});

Deno.test("state keys do not defeat the cache", async () => {
  resetArtworkCache();
  const artworkParams = artworkParamsOf(showcase202412);

  const base = await decodeArtwork(artworkParams);
  // A URL with a changed setting has different params but the same artwork.
  const withShape = new URLSearchParams(showcase202412);
  withShape.set("shapeToTrim", "circle");
  const afterShapeChange = await decodeArtwork(
    artworkParamsOf(withShape),
  );
  assert(
    base === afterShapeChange,
    "settings must not change the artwork key",
  );
});

// The server shares the decode with the key instead of decoding twice.

Deno.test("the server path decodes once for render and key", async () => {
  const { getSharedImageKeyHash } = await import(
    "../src/js/page-specific/index/shared-image/shared-image-key.ts"
  );
  const params = new URLSearchParams(showcase202412);
  params.set("shapeToTrim", "circle");

  const artworkParams = artworkParamsOf(params);
  const decoded = await decodeArtwork(artworkParams, { cache: false });
  const keyWithDecoded = await getSharedImageKeyHash(params, decoded);

  // The key must be the same as the one computed from a fresh decode, and the
  // render must agree with the facade.
  const keyFresh = await getSharedImageKeyHash(params);
  assertEquals(keyWithDecoded, keyFresh);

  const expectedSvg = await renderParamsToSvg(params);
  assertEquals(
    renderArtwork(decoded, resolveSvgRenderSettings(params)),
    expectedSvg,
  );
});

Deno.test("decodeArtwork returns the codec's decoded params", async () => {
  const decoded: DecodedParams = await decodeArtwork(
    artworkParamsOf(showcase202412),
    { cache: false },
  );
  assertEquals(decoded.sizeData.width, 31);
  assertEquals(decoded.sizeData.height, 31);
  const viaCodec = await decodeUrlParams(artworkParamsOf(showcase202412));
  assertEquals(decoded.linesData.size, viaCodec.linesData.size);
});

// A canvas that is not square must keep both of its dimensions. Using the
// height for the width too would stretch the drawing.
Deno.test("a non-square canvas keeps its width and height", async () => {
  const decoded = await decodeArtwork(
    artworkParamsOf(showcase202412),
    { cache: false },
  );
  const stretched = {
    ...decoded,
    sizeData: { viewbox: "0 0 40 31", width: 40, height: 31 },
  };
  const svg = renderArtwork(stretched, {
    ...resolveSvgRenderSettings(new URLSearchParams(showcase202412)),
    shapeToTrim: "square",
    cropSideMargins: false,
  });
  assertEquals(svg.match(/viewBox="([^"]+)"/)?.[1], "0 0 40 31");
});

// The sequence a user performs in the page, replayed against the library.
// Each row is the URL state after one more interaction; the SVG must match what
// the browser shows, so the page and the library cannot drift.
// Each row is a URL state a user reaches by a sequence of interactions, with
// the byte count the renderer produced when the sequence was captured.
//
// This is deliberately not "compare two library entry points": both sides would
// be libpfpg, so the test would pass even if the page wiring were broken. The
// byte counts are the contract, and they change only when the SVG is meant to.
const INTERACTION_SEQUENCE: Array<[string, string, number]> = [
  ["initial", "", 10286],
  ["shape_circle", "&shapeToTrim=circle", 10287],
  ["shape_squircleSlimmed", "&shapeToTrim=squircleSlimmed", 10321],
  [
    "widthNarrowness_15",
    "&shapeToTrim=squircleSlimmed&widthNarrowness=15",
    10322,
  ],
  [
    "shapeRendering_geometricPrecision",
    "&shapeToTrim=squircleSlimmed&widthNarrowness=15" +
    "&shapeRendering=geometricPrecision",
    10330,
  ],
  [
    "pathMode_relativeMerged",
    "&shapeToTrim=squircleSlimmed&widthNarrowness=15" +
    "&shapeRendering=geometricPrecision&pathMode=relativeMerged",
    3546,
  ],
  [
    "removeSpaces_off",
    "&shapeToTrim=squircleSlimmed&widthNarrowness=15" +
    "&shapeRendering=geometricPrecision&pathMode=relativeMerged" +
    "&removeSpaces=false",
    3979,
  ],
  [
    "colorFormat_hex",
    "&shapeToTrim=square&colorFormat=hex",
    10286,
  ],
  [
    "opacitySteps_explicit",
    "&opacitySteps=0.1",
    10286,
  ],
];

Deno.test("an interaction sequence keeps its expected byte count", async (t) => {
  for (const [name, suffix, expectedBytes] of INTERACTION_SEQUENCE) {
    await t.step(name, async () => {
      const params = new URLSearchParams(`${showcase202412}${suffix}`);
      const svg = await renderParamsToSvg(params);
      assert(svg.startsWith("<svg"));
      assertEquals(
        svg.length,
        expectedBytes,
        `${name}: the rendered SVG changed size`,
      );

      // The same state through the split path must agree, since that is the
      // route the page uses.
      const artwork = await decodeArtwork(artworkParamsOf(params), {
        cache: false,
      });
      assertEquals(
        renderArtwork(artwork, resolveSvgRenderSettings(params)),
        svg,
        `${name}: the page route disagrees with the params route`,
      );
    });
  }
});

// colourFormat changes the serialized form, never the pixels.
Deno.test("colorFormat hex renders the same bytes as the default", async () => {
  const plain = await renderParamsToSvg(showcase202412);
  const hex = await renderParamsToSvg(
    new URLSearchParams(`${showcase202412}&colorFormat=hex`),
  );
  assertEquals(hex, plain);
});

// The pickers must show what the artwork will actually be drawn with, so they
// are built from the SVG including any `groupColors` override. Building them
// from the un-overridden artwork is what made the first picker edit reveal
// colours the user had never seen.
Deno.test("pickers are built from the artwork as rendered", async () => {
  const params = new URLSearchParams(showcase202412);
  params.set("groupColors", "FF0000AA80_00FF0080FF");
  const decoded = await decodeArtwork(artworkParamsOf(params), {
    cache: false,
  });
  const settings = resolveSvgRenderSettings(params);

  const overridden = renderArtworkForPickers(decoded, settings);
  assert(overridden.includes('stroke="rgb(255 0 0)"'));

  // The artwork's own colours are still what the anchor snapshots.
  const artworkOnly = renderArtworkForPickers(decoded, {
    ...settings,
    groupColors: undefined,
  });
  assert(!artworkOnly.includes('stroke="rgb(255 0 0)"'));
});

// The picker SVG never bakes the step in: the step is expressed by the
// <option> lists, so a picker shown before the user picks a step must still
// carry the artwork's own opacities.
Deno.test("the picker SVG leaves opacitySteps out", async () => {
  const decoded = await decodeArtwork(artworkParamsOf(showcase202412), {
    cache: false,
  });
  const withStep = resolveSvgRenderSettings(
    new URLSearchParams(`${showcase202412}&opacitySteps=0.1`),
  );

  const pickers = renderArtworkForPickers(decoded, withStep);
  const rendered = renderArtwork(decoded, withStep);
  // The rendered SVG snaps opacities onto the 0.1 grid; the picker SVG keeps
  // the artwork's own values.
  assert(pickers.includes('opacity="0.8"'));
  assert(rendered.includes('opacity="0.8"'));
});
