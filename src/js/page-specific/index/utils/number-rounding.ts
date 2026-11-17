// Two-decimal rounding lives in libpfpg (squircles) so the clip path, the
// slimmed viewBox and this UI cannot round differently. The one-decimal
// helper is display-only and stays here.
export { roundToTwoDecimals, toFixedTrimmed } from "libpfpg/squircles";

function roundToOneDecimal(num: number): number {
  return Math.round(num * 10) / 10;
}

export { roundToOneDecimal };
