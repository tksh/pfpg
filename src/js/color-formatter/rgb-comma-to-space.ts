export function convertRgbCommaToSpace(rgbString: string): string {
  return rgbString.replace(/,\s*/g, " ");
}
