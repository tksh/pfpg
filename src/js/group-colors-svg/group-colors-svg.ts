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

// Strip the default-opaque opacity/stroke-opacity attributes from every
// element; the <g> element generator above omits them entirely. This remains
// for post-processing arbitrary SVG text.
export function removeOpacity(svgString: string): string {
  return svgString.replace(/\s(opacity|stroke-opacity)="1(\.0)?"/g, "");
}

// Re-insert default opacity attributes on <g> elements that have a stroke.
export function restoreOpacity(svgString: string): string {
  return svgString.replace(
    /<g\b([^>]*)>/g,
    function (match: string, attributes: string) {
      if (!/\bstroke="[^"]*"/.test(attributes)) {
        return match;
      }

      const attrs = attributes.split(/\s+/).filter((attr) =>
        attr.trim() !== ""
      );

      let opacityValue = "1.0";
      let strokeOpacityValue = "1.0";
      const newAttrs: string[] = [];

      for (const attr of attrs) {
        if (attr.startsWith('opacity="')) {
          const opacityPart = attr.split('"')[1];
          if (opacityPart !== undefined) {
            opacityValue = opacityPart;
          }
        } else if (attr.startsWith('stroke-opacity="')) {
          const strokeOpacityPart = attr.split('"')[1];
          if (strokeOpacityPart !== undefined) {
            strokeOpacityValue = strokeOpacityPart;
          }
        } else {
          newAttrs.push(attr);
        }
      }

      newAttrs.push(`opacity="${opacityValue}"`);
      newAttrs.push(`stroke-opacity="${strokeOpacityValue}"`);

      return `<g ${newAttrs.join(" ")}>`;
    },
  );
}

// Build one <g> element string from a decoded color entry
// ([undefined, stroke, opacity, strokeOpacity]) while honoring the UI state
// for removing default-opacity attributes.
export function buildGroupColorElement(
  gId: number,
  stroke: string | number | undefined,
  opacity: string | number | undefined,
  strokeOpacity: string | number | undefined,
  opts?: { removeOpacity?: boolean },
): string {
  const opacityValue = opacity !== undefined ? opacity : "1.0";
  const strokeOpacityValue = strokeOpacity !== undefined
    ? strokeOpacity
    : "1.0";
  const groupElem =
    `<g id="${gId}" stroke="${stroke}" opacity="${opacityValue}" stroke-opacity="${strokeOpacityValue}">`;

  return opts?.removeOpacity ? removeOpacity(groupElem) : groupElem;
}

// Replace every `<g stroke=...>` element in the SVG with the decoded colors.
// Works on arbitrary strings (browser applyGroupColors and the Deno Deploy
// pipeline share it), so no document/state access happens here.
export function applyGroupColorsToSvg(
  svgString: string,
  colorsByGroups: Array<[undefined, string, number, number]>,
  opts?: { removeOpacity?: boolean },
): string {
  let updatedSvg = svgString;
  colorsByGroups.forEach((groupColorsArr, gId) => {
    const gElem = buildGroupColorElement(
      gId,
      groupColorsArr[1],
      groupColorsArr[2],
      groupColorsArr[3],
      opts,
    );
    updatedSvg = replaceAtIndex(
      updatedSvg,
      GROUP_COLORS_ELEMENT_REGEX,
      gElem,
      gId,
    );
  });
  return updatedSvg;
}
