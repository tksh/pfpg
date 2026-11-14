import { assertEquals, assertRejects } from "@std/assert";
import { renderParamsToSvg } from "../src/js/libpfpg/render.ts";
import { initSvg2rgba, svg2rgba } from "svg2ui8a";

const fixtureParams = new URLSearchParams(
  (await Deno.readTextFile("tests/fixtures/showcase-202412_001.search.txt"))
    .trim().slice(1),
);
const fixture202401Params = new URLSearchParams(
  (await Deno.readTextFile("tests/fixtures/showcase-202401_001.search.txt"))
    .trim().slice(1),
);
Deno.test("libpfpg renderer matches approved showcase goldens", async (t) => {
  const cases: Array<[string, string]> = [
    ["default", ""],
    [
      "groupColors_override",
      "",
    ],
    ["shape_square", "&shapeToTrim=square"],
    ["shape_circle", "&shapeToTrim=circle"],
    ["shape_squircle", "&shapeToTrim=squircle"],
    [
      "shape_squircleSlimmed_cropFalse",
      "&shapeToTrim=squircleSlimmed&cropSideMargins=false",
    ],
    [
      "shape_squircleSlimmed_cropTrue",
      "&shapeToTrim=squircleSlimmed&cropSideMargins=true",
    ],
    ["opacitySteps_explicit", "&opacitySteps=0.1"],
    ["shapeRendering_explicit", "&shapeRendering=geometricPrecision"],
    ["heightPixelSize_explicit", "&heightPixelSize=300"],
  ];
  for (const [name, suffix] of cases) {
    await t.step(name, async () => {
      const expected = await Deno.readTextFile(
        `tests/fixtures/showcase-202412_001-${name}.svg`,
      ).catch(() =>
        Deno.readTextFile("tests/fixtures/showcase-202412_001-default.svg")
      );
      const groupColors = name === "groupColors_override"
        ? encodeGroupColors(expected)
        : "";
      const actual = await renderParamsToSvg(
        `${fixtureParams.toString()}${suffix}${
          groupColors ? `&groupColors=${groupColors}` : ""
        }`,
      );
      assertEquals(actual, expected);
    });
  }
});

Deno.test("libpfpg renderer matches 202401 default and custom goldens", async (t) => {
  const cases: Array<[string, string]> = [["default", ""], [
    "shape_circle",
    "&shapeToTrim=circle",
  ]];
  for (const [name, suffix] of cases) {
    await t.step(name, async () => {
      const actual = await renderParamsToSvg(`${fixture202401Params}${suffix}`);
      const expected = await Deno.readTextFile(
        `tests/fixtures/showcase-202401_001-${name}.svg`,
      );
      assertEquals(actual, expected);
    });
  }
});

Deno.test("renderer rejects invalid inputs before returning SVG", async () => {
  await assertRejects(
    () => renderParamsToSvg(`${fixtureParams}&shapeRendering=bad`),
    TypeError,
  );
  await assertRejects(() => renderParamsToSvg("metadata=~nadir"));
  await assertRejects(() => renderParamsToSvg("title=~202412_001"));
  assertEquals(
    (await renderParamsToSvg(
      `${fixtureParams}&shapeRendering=bad&shapeRendering=crispEdges`,
    )).includes('shape-rendering="crispEdges"'),
    true,
  );
  await renderParamsToSvg(`${fixtureParams}&removeSpaces=${"x".repeat(9000)}`);
  await assertRejects(
    () => renderParamsToSvg(`${fixtureParams}&groupColors=illegal!`),
    TypeError,
  );
  await assertRejects(
    () => renderParamsToSvg(`bits=~5&x=${"a".repeat(8200)}`),
    RangeError,
  );
  for (const step of ["0.04", "0.1", "0.2"]) {
    const trailing = step === "0.04" ? "0.040" : step === "0.2" ? "0.20" : step;
    assertEquals(
      await renderParamsToSvg(`${fixtureParams}&opacitySteps=${step}`),
      await renderParamsToSvg(`${fixtureParams}&opacitySteps=${trailing}`),
    );
  }
  for (const step of ["0", "abc", "0.3", "true", "1"]) {
    assertEquals(
      await renderParamsToSvg(`${fixtureParams}&opacitySteps=${step}`),
      await renderParamsToSvg(fixtureParams),
    );
  }
});

function encodeGroupColors(svg: string): string {
  return [
    ...svg.matchAll(
      /<g id="\d+" stroke="(#[\da-f]+|rgb\([^)]+\))" opacity="([\d.]+)" stroke-opacity="([\d.]+)"/g,
    ),
  ]
    .slice(0, 1)
    .map(([, stroke, opacity, strokeOpacity]) => {
      const hex = stroke!.startsWith("#")
        ? stroke!.slice(1).padEnd(6, stroke!.slice(-1))
        : (stroke!.match(/\d+/g) ?? []).slice(0, 3).map((n) =>
          Number(n).toString(16).padStart(2, "0")
        ).join("");
      const byte = (value: string) =>
        Math.round(Number(value) * 255).toString(16).padStart(2, "0");
      return `${hex}${byte(opacity!)}${byte(strokeOpacity!)}`;
    }).join("_");
}

Deno.test("libpfpg renderer preserves pixels for approved showcase goldens", async (t) => {
  await initSvg2rgba({
    wasmUrl:
      new URL("../src/assets/svg2ui8a/svg2rgba_bg.wasm", import.meta.url).href,
  });
  for (
    const name of [
      "default",
      "groupColors_override",
      "shape_square",
      "shape_circle",
      "shape_squircle",
      "shape_squircleSlimmed_cropFalse",
      "shape_squircleSlimmed_cropTrue",
      "opacitySteps_explicit",
      "shapeRendering_explicit",
      "heightPixelSize_explicit",
    ]
  ) {
    await t.step(name, async () => {
      const expected = await Deno.readTextFile(
        `tests/fixtures/showcase-202412_001-${name}.svg`,
      );
      const suffix = name === "groupColors_override"
        ? `&groupColors=${encodeGroupColors(expected)}`
        : name === "opacitySteps_explicit"
        ? "&opacitySteps=0.1"
        : name === "shapeRendering_explicit"
        ? "&shapeRendering=geometricPrecision"
        : name === "shape_circle"
        ? "&shapeToTrim=circle"
        : name === "shape_squircle"
        ? "&shapeToTrim=squircle"
        : name === "shape_square"
        ? "&shapeToTrim=square"
        : name === "shape_squircleSlimmed_cropFalse"
        ? "&shapeToTrim=squircleSlimmed&cropSideMargins=false"
        : name === "shape_squircleSlimmed_cropTrue"
        ? "&shapeToTrim=squircleSlimmed&cropSideMargins=true"
        : "";
      const actual = await renderParamsToSvg(`${fixtureParams}${suffix}`);
      const [a, b] = await Promise.all([
        svg2rgba(actual, { height: 128 }),
        svg2rgba(expected, { height: 128 }),
      ]);
      assertEquals(a.width, b.width);
      assertEquals(a.height, b.height);
      let differingBytes = 0;
      for (let i = 0; i < a.pixels.length; i++) {
        if (a.pixels[i] !== b.pixels[i]) differingBytes++;
      }
      assertEquals(differingBytes, 0);
    });
  }
  for (
    const [name, suffix] of [["default", ""], [
      "shape_circle",
      "&shapeToTrim=circle",
    ]]
  ) {
    await t.step(`202401_${name}`, async () => {
      const expected = await Deno.readTextFile(
        `tests/fixtures/showcase-202401_001-${name}.svg`,
      );
      const actual = await renderParamsToSvg(`${fixture202401Params}${suffix}`);
      const [a, b] = await Promise.all([
        svg2rgba(actual, { height: 128 }),
        svg2rgba(expected, { height: 128 }),
      ]);
      assertEquals(a.width, b.width);
      assertEquals(a.height, b.height);
      let differingBytes = 0;
      for (let i = 0; i < a.pixels.length; i++) {
        if (a.pixels[i] !== b.pixels[i]) differingBytes++;
      }
      assertEquals(differingBytes, 0);
    });
  }
});
