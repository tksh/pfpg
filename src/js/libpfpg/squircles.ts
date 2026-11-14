import { replaceViewBox, type ViewBox } from "./svg-attrs.ts";

export interface SquircleSlimmedGeometry {
  left: number;
  right: number;
  topControlPoint: number;
  pathData: string;
}
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}
export function toFixedTrimmed(value: number): string {
  return String(Number(value.toFixed(2)));
}
export function squircleClipPath(gridSize: number): string {
  const center = roundToTwoDecimals(gridSize / 2);
  return `<path d="M 0 ${center} Q 0 0 ${center} 0 T ${gridSize} ${center} ${center} ${gridSize} 0 ${center}" />`;
}
export function squircleSlimmedGeometry(
  gridSize: number,
  opts: { widthNarrowness: number; topHeavyRatio: number },
): SquircleSlimmedGeometry {
  if (
    !Number.isFinite(opts.widthNarrowness) ||
    !Number.isFinite(opts.topHeavyRatio)
  ) throw new RangeError("Geometry values must be finite");
  const left = roundToTwoDecimals(
    (gridSize / 100) * (opts.widthNarrowness / 2),
  );
  const right = roundToTwoDecimals(gridSize - left);
  const center = roundToTwoDecimals(gridSize / 2);
  const topControlPoint = roundToTwoDecimals(
    left - ((gridSize / 100) * opts.topHeavyRatio),
  );
  return {
    left,
    right,
    topControlPoint,
    pathData:
      `<path d="M ${left} ${center} Q ${topControlPoint} 0 ${center} 0 T ${right} ${center} ${center} ${gridSize} ${left} ${center}" />`,
  };
}
export function clipShapeElement(
  shape: string,
  geometry?: SquircleSlimmedGeometry,
  gridSize = 100,
): string {
  if (shape === "square") return '<rect width="100%" height="100%" />';
  if (shape === "circle") return '<circle cx="50%" cy="50%" r="50%" />';
  if (shape === "squircleSlimmed") {
    return geometry?.pathData ??
      squircleSlimmedGeometry(gridSize, {
        widthNarrowness: 10,
        topHeavyRatio: 1,
      }).pathData;
  }
  return squircleClipPath(gridSize);
}
export function slimmedViewBox(
  geometry: SquircleSlimmedGeometry,
  viewBox: ViewBox,
): string {
  return `${toFixedTrimmed(geometry.left)} ${viewBox.y} ${
    toFixedTrimmed(geometry.right - geometry.left)
  } ${viewBox.height}`;
}
export function applySlimmedViewBox(
  svg: string,
  geometry: SquircleSlimmedGeometry,
  viewBox: ViewBox,
): string {
  return replaceViewBox(svg, slimmedViewBox(geometry, viewBox));
}
