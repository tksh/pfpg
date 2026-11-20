import { assert, assertThrows } from "@std/assert";
import { decodeUrlParams } from "@tksh/stln-codec";
import { excludeStateKeys } from "common-utils/read-url-params";
import {
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "libpfpg/settings";
import { validateArtworkConstraints } from "../src/js/page-specific/index/state/param-validator.ts";

const fixture = new URLSearchParams(
  (await Deno.readTextFile(
    "tests/fixtures/showcase-202412_001.search.txt",
  )).trim().slice(1),
);

function settingsFor(params: URLSearchParams) {
  return {
    svg: resolveSvgRenderSettings(params),
    raster: resolveRasterSettings(params),
  };
}

Deno.test("groupColors may not exceed the artwork's group count", async () => {
  const decoded = await decodeUrlParams(excludeStateKeys(fixture));
  const groupCount = decoded.linesData.size;
  assert(groupCount > 0, "the fixture must have groups");

  const exact = new URLSearchParams(fixture);
  exact.set("groupColors", new Array(groupCount).fill("F0F").join("_"));
  validateArtworkConstraints(decoded, settingsFor(exact));

  const excess = new URLSearchParams(fixture);
  excess.set("groupColors", new Array(groupCount + 1).fill("F0F").join("_"));
  assertThrows(
    () => validateArtworkConstraints(decoded, settingsFor(excess)),
    TypeError,
    "Excess groupColors",
  );
});

Deno.test("the rendered maximum side may not exceed 4096px", async () => {
  const decoded = await decodeUrlParams(excludeStateKeys(fixture));
  const defaults = settingsFor(new URLSearchParams());

  const wide = {
    ...decoded,
    sizeData: { ...decoded.sizeData, width: 10000, height: 100 },
  };
  assertThrows(
    () => validateArtworkConstraints(wide, defaults),
    RangeError,
    "4096px",
  );

  // The width is derived from the aspect ratio, so a wide artwork still fits
  // when the requested height is small enough.
  const small = { ...defaults, raster: { heightPixelSize: 40 } };
  validateArtworkConstraints(wide, small);

  // The cap is on the longest side, so a tall artwork at 4096px high still
  // passes: its width scales with the aspect ratio instead.
  const tall = {
    ...decoded,
    sizeData: { ...decoded.sizeData, width: 100, height: 10000 },
  };
  validateArtworkConstraints(
    tall,
    { svg: defaults.svg, raster: { heightPixelSize: 4096 } },
  );
});
