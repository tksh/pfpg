/**
 * The largest opacity step from the supported set that divides every given
 * opacity. Used to derive an artwork's own default step, so a drawing whose
 * opacities are all multiples of 0.1 is presented on the 0.1 grid.
 */
export function resolveDefaultOpacitySteps(
  opacities: Iterable<number>,
): number {
  // Work in integer hundredths so the modulo tests below are exact.
  const intValues = [...opacities].map((value) => Math.round(value * 100));

  let currentGcd = 0;
  for (const intValue of intValues) {
    if (intValue % 20 === 0) {
      currentGcd = gcd(currentGcd, 20);
    } else if (intValue % 10 === 0) {
      currentGcd = gcd(currentGcd, 10);
    } else if (intValue % 4 === 0) {
      currentGcd = gcd(currentGcd, 4);
    }
  }

  if (currentGcd === 20) return 0.2;
  if (currentGcd === 10) return 0.1;
  if (currentGcd === 4) return 0.04;
  return 0.2;
}

function gcd(a: number, b: number): number {
  while (b !== 0) {
    [a, b] = [b, a % b];
  }
  return Math.abs(a);
}

export function numbersIncrementByStep(step: number): string[] {
  if (!Number.isFinite(step) || step <= 0 || step > 1) {
    throw new RangeError("step must be finite and 0 < step <= 1");
  }
  const values: number[] = [];
  for (let i = 0; i <= 100; i += step * 100) values.push(i / 100);
  return values.reverse().map((n) =>
    n === 0 || n === 1 ? n.toFixed(1) : String(n)
  );
}

export function snapToGrid(
  svg: string,
  step: number,
  colorFormat = "rgb",
  removeOpacity = false,
): string {
  const grid = numbersIncrementByStep(step).map(Number);
  let index = 0;
  return svg.replace(/<g[^>]*stroke=[^>]*>/g, (tag) => {
    const strokeRaw = tag.match(/stroke="([^"]+)"/)?.[1] ?? "#000000";
    const stroke = convertColor(strokeRaw, colorFormat);
    const opacity = Number(tag.match(/\bopacity="([^"]+)"/)?.[1] ?? "1.0");
    const strokeOpacity = Number(
      tag.match(/\bstroke-opacity="([^"]+)"/)?.[1] ?? "1.0",
    );
    const attrs = `id="${index++}" stroke="${stroke}" opacity="${
      nearest(grid, opacity)
    }" stroke-opacity="${nearest(grid, strokeOpacity)}"`;
    return removeOpacity
      ? `<g ${attrs.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, "")}>`
      : `<g ${attrs}>`;
  });
}
function convertColor(color: string, format: string): string {
  if (format === "rgb" || !color.startsWith("rgb")) return color;
  const channels = color.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
  const hex = channels.map((n) => n.toString(16).padStart(2, "0")).join("");
  const short = /^([\da-f])\1([\da-f])\2([\da-f])\3$/i.exec(hex);
  return `#${short ? short.slice(1).join("") : hex}`;
}
function nearest(grid: number[], value: number): string {
  let best = grid[0] ?? 1;
  for (const candidate of grid) {
    if (Math.abs(candidate - value) < Math.abs(best - value)) best = candidate;
  }
  return best === 0 || best === 1 ? best.toFixed(1) : String(best);
}
