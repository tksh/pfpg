export function removeOpacity(svg: string): string {
  return svg.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, "");
}

export function removeLineBreaks(svg: string): string {
  return svg.replace(/>\s+</g, "><");
}

export function removeSpaces(svg: string): string {
  return svg.replace(/(\sd="[^>]+>)/g, (match) =>
    match
      .replace(/([MLHVCSQTAZ])\s+/gi, "$1")
      .replace(/(\d)\s+([MLHVCSQTAZ])/gi, "$1$2")
      .replace(/ -/g, "-")
      .replace(/"\s+(\/)/g, '"$1'));
}

export function tryRemoveSpaces(
  svg: string,
  isSpacesRemoved: unknown,
): string {
  return isSpacesRemoved ? removeSpaces(svg) : svg;
}

export function optimizeSvgText(
  svg: string,
  options: {
    removeOpacity: boolean;
    removeLineBreaks: boolean;
    removeSpaces: boolean;
  },
): string {
  let output = svg;
  if (options.removeOpacity) output = removeOpacity(output);
  if (options.removeLineBreaks) output = removeLineBreaks(output);
  if (options.removeSpaces) output = removeSpaces(output);
  return output;
}
