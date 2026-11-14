export function optimizeSvgText(
  svg: string,
  options: {
    removeOpacity: boolean;
    removeLineBreaks: boolean;
    removeSpaces: boolean;
  },
): string {
  let output = svg;
  if (options.removeOpacity) {
    output = output.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, "");
  }
  if (options.removeLineBreaks) output = output.replace(/>\s+</g, "><");
  if (options.removeSpaces) {
    output = output.replace(/(\sd="[^>]+>)/g, (match) =>
      match
        .replace(/([MLHVCSQTAZ])\s+/gi, "$1")
        .replace(/(\d)\s+([MLHVCSQTAZ])/gi, "$1$2")
        .replace(/ -/g, "-")
        .replace(/"\s+(\/)/g, '"$1'));
  }
  return output;
}
