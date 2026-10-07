// @tksh/group-colors-svg (internal extraction): single source of truth for
// parsing and rewriting the `<g stroke=...>` group-color elements in the SVG.
// Previously, the same regex and attribute parsers were duplicated across
// several tab-* modules.

export {
  getGroupColorsValues,
  getOpacity,
  getStroke,
  getStrokeHex,
  getStrokeOpacity,
  getStrokeRgb,
  regexMatchesOfGroupColors,
};

// /<g ... stroke="..." ... >/g に該当するグループ色要素への唯一のパターン
export const GROUP_COLORS_ELEMENT_REGEX = /<g[^>]*stroke=[^>]*>/g;

function getGroupColorsValues(
  svgString: string,
): Map<string, number | string[]> {
  const matches = regexMatchesOfGroupColors(svgString);

  const numberOfGroups = matches.length;

  const strokeArray: string[] = [];
  const opacityArray: string[] = [];
  const strokeOpacityArray: string[] = [];

  for (let i = 0; i < matches.length; i++) { // i = group ID
    const match = matches[i];
    if (match === undefined) {
      throw new Error(
        `getGroupColorsValues: no group colors match at index ${i}`,
      );
    }
    const stroke = getStroke(match); // string (rgb or hex)
    if (stroke === undefined) {
      throw new Error(
        `getGroupColorsValues: could not parse stroke value from: ${match}`,
      );
    }
    const opacity = getOpacity(match); // [0-1] number
    const strokeOpacity = getStrokeOpacity(match); // [0-1] number

    strokeArray.push(stroke);
    opacityArray.push(opacity);
    strokeOpacityArray.push(strokeOpacity);
  }

  console.log("strokeArray: ", strokeArray);
  console.log("opacityArray: ", opacityArray);
  console.log("strokeOpacityArray: ", strokeOpacityArray);

  return new Map<string, number | string[]>([
    ["number_of_groups", numberOfGroups],
    ["stroke_array", strokeArray],
    ["opacity_array", opacityArray],
    ["stroke_opacity_array", strokeOpacityArray],
  ]);
}

export function getNumberOfGroups(inputSvg: string): number {
  const matches = inputSvg.match(GROUP_COLORS_ELEMENT_REGEX);
  console.log(
    'matches like <g (id="0") stroke="rgb(0 0 0)|#000000" ... >: ',
    matches,
  );
  return matches?.length ?? 0;
}

function regexMatchesOfGroupColors(inputSvg: string): string[] {
  const matches = inputSvg.match(GROUP_COLORS_ELEMENT_REGEX);
  if (matches === null) {
    throw new Error(
      "regexMatchesOfGroupColors: no group colors <g> elements found",
    );
  }
  return matches;
}

function getStroke(inputStr: string): string | undefined {
  const strokeRgb = getStrokeRgb(inputStr);
  const strokeHex = getStrokeHex(inputStr);
  return strokeRgb ?? strokeHex;
}
function getStrokeHex(inputStr: string): string | undefined {
  const pattern = /(#.*?)"/;
  const matches = inputStr.match(pattern);
  return matches?.[1];
}
function getStrokeRgb(inputStr: string): string | undefined {
  const pattern = /(rgb\(.*?\))/;
  const matches = inputStr.match(pattern);
  return matches?.[1];
}

function getOpacity(inputStr: string): string {
  const pattern = /\sopacity="([^"]*)"/;
  const matches = inputStr.match(pattern);
  return matches === null ? "1.0" : (matches[1] ?? "1.0");
}
function getStrokeOpacity(inputStr: string): string {
  const pattern = /stroke-opacity="([^"]*)"/;
  const matches = inputStr.match(pattern);
  return matches === null ? "1.0" : (matches[1] ?? "1.0");
}

export function replaceAtIndex(
  inputString: string,
  regexPattern: RegExp,
  replacement: string,
  index: number,
): string {
  const matches = Array.from(inputString.matchAll(regexPattern));

  const matchToReplace = matches[index];
  if (matchToReplace === undefined || matchToReplace.index === undefined) {
    throw new Error(`replaceAtIndex: no match at index ${index}`);
  }

  const firstMatch = matchToReplace[0];
  if (firstMatch === undefined) {
    throw new Error(`replaceAtIndex: empty match at index ${index}`);
  }
  const replacedString = inputString.slice(0, matchToReplace.index) +
    replacement +
    inputString.slice(matchToReplace.index + firstMatch.length);

  console.log("replacedString: ", replacedString);
  return replacedString;
}
