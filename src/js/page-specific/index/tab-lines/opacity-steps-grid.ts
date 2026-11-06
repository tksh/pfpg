import { formatAsFloatString } from "common-utils/format-as-float";

export { numbersIncrementByStep };

// Get the strings array of incremental numbers for selector option value
function numbersIncrementByStep(step: number): string[] {
  // Guard: an invalid step (0, negatives, NaN, non-finite) would never
  // terminate the loop below (i += step * 100) or would blank every group
  // (NaN). Coerce first since URL-sourced values arrive as strings.
  const sanitized = Number(step);
  if (!Number.isFinite(sanitized) || sanitized <= 0 || sanitized > 1) {
    throw new RangeError(
      `numbersIncrementByStep: step must be finite and 0 < step <= 1, got: ${
        String(step)
      }`,
    );
  }
  const numbers: number[] = [];
  // 0から100までの整数を (step * 100)の間隔で 配列に格納
  for (let i = 0; i <= 100; i += sanitized * 100) {
    // 整数を100で割って小数に戻す
    numbers.push(i / 100);
  }
  return formatAsFloatString(numbers.reverse()); // `.reverse()`で 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
