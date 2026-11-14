export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
export function extractViewboxValues(svg: string): ViewBox | null {
  const value = svg.match(/viewBox="([^"]+)"/)?.[1];
  if (!value) return null;
  const [x, y, width, height] = value.trim().split(/[ ,]+/).map(Number);
  return [x, y, width, height].every(Number.isFinite)
    ? { x: x!, y: y!, width: width!, height: height! }
    : null;
}
export function replaceViewBox(svg: string, viewBox: string | ViewBox): string {
  const value = typeof viewBox === "string"
    ? viewBox
    : `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;
  return svg.replace(/viewBox="[^"]+"/, `viewBox="${value}"`);
}
export function replaceShapeRendering(svg: string, value: string): string {
  if (value !== "crispEdges" && value !== "geometricPrecision") {
    throw new TypeError("Invalid shapeRendering");
  }
  return svg.replace(/shape-rendering="[^"]+"/, `shape-rendering="${value}"`);
}
