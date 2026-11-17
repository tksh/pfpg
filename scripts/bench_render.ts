// Timing harness for the SVG render path.
//
// Wall-clock assertions are flaky on shared runners, so this is a standalone
// task (`deno task bench`) rather than a unit test. It reports the median of
// several runs and compares the full render against the codec decode in the
// same process, which is the ratio that actually matters: the browser reuses a
// cached decode, so a healthy render stays a small multiple of one decode.

import { decodeUrlParams } from "@tksh/stln-codec";
import { renderParamsToSvg } from "../src/js/libpfpg/render.ts";

interface Fixture {
  label: string;
  search: string;
}

function readFixture(name: string): Fixture {
  const search = Deno.readTextFileSync(
    new URL(`../tests/fixtures/${name}.search.txt`, import.meta.url),
  ).trim().slice(1);
  return { label: name, search };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 0
    ? ((sorted[middle - 1]! + sorted[middle]!) / 2)
    : sorted[middle]!;
  return value;
}

async function time(
  label: string,
  run: () => Promise<unknown>,
  rounds: number,
): Promise<number> {
  await run(); // warm up the JIT before measuring
  const samples: number[] = [];
  for (let i = 0; i < rounds; i++) {
    const start = performance.now();
    await run();
    samples.push(performance.now() - start);
  }
  const result = median(samples);
  console.log(`  ${label.padEnd(28)} ${result.toFixed(2)} ms`);
  return result;
}

async function main(): Promise<void> {
  const fixtures: Fixture[] = [
    readFixture("showcase-202412_001"),
    readFixture("showcase-202401_001"),
  ];
  const rounds = 10;

  console.log(`libpfpg render benchmark (${rounds} rounds, median)`);

  for (const fixture of fixtures) {
    const params = new URLSearchParams(fixture.search);
    const artworkParams = new URLSearchParams(
      [...params.entries()].filter(([key]) =>
        ![
          "removeOpacity",
          "removeLineBreaks",
          "removeSpaces",
          "groupColors",
          "pathMode",
          "opacitySteps",
          "colorFormat",
          "shapeToTrim",
          "widthNarrowness",
          "topHeavyRatio",
          "cropSideMargins",
          "shapeRendering",
          "heightPixelSize",
        ].includes(key)
      ),
    );

    console.log(`\n${fixture.label}`);
    const decodeMs = await time(
      "decodeUrlParams",
      () => decodeUrlParams(artworkParams),
      rounds,
    );
    const renderMs = await time(
      "renderParamsToSvg",
      () => renderParamsToSvg(params),
      rounds,
    );

    const ratio = renderMs / decodeMs;
    console.log(
      `  render / decode ratio      ${ratio.toFixed(2)}x ` +
        `(render ${renderMs.toFixed(2)} ms, decode ${decodeMs.toFixed(2)} ms)`,
    );
  }
}

if (import.meta.main) {
  await main();
}
