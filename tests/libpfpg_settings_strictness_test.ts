import { assertEquals, assertThrows } from "@std/assert";
import {
  resolveRasterSettings,
  resolveSvgRenderSettings,
} from "libpfpg/settings";

function svgWith(key: string, value: string): () => unknown {
  const params = new URLSearchParams([[key, value]]);
  return () => resolveSvgRenderSettings(params);
}

Deno.test("boolean settings accept only exact true and false", () => {
  assertEquals(
    resolveSvgRenderSettings(new URLSearchParams("removeSpaces=true"))
      .optimize.removeSpaces,
    true,
  );
  assertEquals(
    resolveSvgRenderSettings(new URLSearchParams("removeSpaces=false"))
      .optimize.removeSpaces,
    false,
  );
  for (const value of ["TRUE", "False", "1", "yes", ""]) {
    assertThrows(svgWith("removeSpaces", value), TypeError, "removeSpaces");
  }
});

Deno.test("widthNarrowness and topHeavyRatio are closed UI enums", () => {
  const defaults = resolveSvgRenderSettings(new URLSearchParams());
  assertEquals(defaults.widthNarrowness, 10);
  assertEquals(defaults.topHeavyRatio, 1);

  for (const value of [0, 1, 10, 15, 20, 25, 30]) {
    assertEquals(
      resolveSvgRenderSettings(
        new URLSearchParams([["widthNarrowness", String(value)]]),
      ).widthNarrowness,
      value,
    );
  }
  for (const value of ["12", "31", "-1", "1.5", "", "abc"]) {
    assertThrows(
      svgWith("widthNarrowness", value),
      RangeError,
      "widthNarrowness",
    );
  }
  for (const value of ["4", "-4", "1.5", "", "abc"]) {
    assertThrows(svgWith("topHeavyRatio", value), RangeError, "topHeavyRatio");
  }
  assertEquals(
    resolveSvgRenderSettings(new URLSearchParams("topHeavyRatio=-3"))
      .topHeavyRatio,
    -3,
  );
});

Deno.test("heightPixelSize accepts a decimal integer in 1..4096", () => {
  const heightOf = (value: string) =>
    resolveRasterSettings(new URLSearchParams([["heightPixelSize", value]]))
      .heightPixelSize;
  assertEquals(
    resolveRasterSettings(new URLSearchParams()).heightPixelSize,
    256,
  );
  assertEquals(heightOf("1"), 1);
  assertEquals(heightOf("4096"), 4096);
  for (
    const value of [
      "0",
      "-1",
      "4097",
      "96px",
      "0x10",
      "1e3",
      "1.5",
      " 96",
      "+96",
      "",
      "abc",
    ]
  ) {
    assertThrows(() => heightOf(value), RangeError, "heightPixelSize");
  }
});
