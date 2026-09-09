export {
  getGroupColorsValues,
  getOpacity,
  getStroke,
  getStrokeHex,
  getStrokeOpacity,
  getStrokeRgb,
  regexMatchesOfGroupColors,
};

function getGroupColorsValues(
  svgString: string,
): Map<string, number | string[]> {
  // Find whole group colors elements

  // Get the matches for <g> from current SVG string in textarea
  const matches = regexMatchesOfGroupColors(svgString);
  // console.log(`matches Array:es}`)${matches}`)
  // e.g.: <g stroke="#AAAAAA" opacity="1.0" stroke-opacity="1.0">,<g stroke="#000000" opacity="1.0" stroke-opacity="1.0">,<g stroke="#FFFFFF" opacity="1.0" stroke-opacity="1.0">
  // e.g.: (5) ['<g stroke="rgb(0,0,0)" opacity="1.0" stroke-opacity="1.0">', ...]

  // マッチした部分の数を取得
  const numberOfGroups = matches.length; // 配列の長さでマッチした部分の数を得る

  // Get each color as hex code
  // カラーピッカー生成時に 初期値として設定するために マッチした部分の内容から各カラー情報の値を 取り出し
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
    // Get three group colors value
    const stroke = getStroke(match); // string (rgb or hex)
    if (stroke === undefined) {
      throw new Error(
        `getGroupColorsValues: could not parse stroke value from: ${match}`,
      );
    }
    const opacity = getOpacity(match); // [0-1] number
    const strokeOpacity = getStrokeOpacity(match); // [0-1] number

    // Set into each array
    strokeArray.push(stroke);
    opacityArray.push(opacity);
    strokeOpacityArray.push(strokeOpacity);
  }

  console.log("strokeArray: ", strokeArray); // e.g.: (5) ['#000000', '#000000', '#000000', '#eeeeee', '#ffffff']
  console.log("opacityArray: ", opacityArray); // e.g.: (5) ['1', '1', '1', '1', '1']
  console.log("strokeOpacityArray: ", strokeOpacityArray); // e.g.: (5) ['1', '1', '1', '1', '1']

  return new Map<string, number | string[]>([
    ["number_of_groups", numberOfGroups], // Number
    ["stroke_array", strokeArray], // Array
    ["opacity_array", opacityArray], // Array
    ["stroke_opacity_array", strokeOpacityArray], // Array
  ]);
}

// Get the values from group colors <g> element string
function regexMatchesOfGroupColors(inputSvg: string): string[] {
  const pattern = /<g[^>]*stroke=[^>]*>/g;
  const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
  // console.log('matches: ', matches)
  // e.g.: (5) ['<g (id="0") stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']
  if (matches === null) {
    throw new Error(
      "regexMatchesOfGroupColors: no group colors <g> elements found",
    );
  }
  return matches;
}

// Get each attrs values
function getStroke(inputStr: string): string | undefined {
  const strokeRgb = getStrokeRgb(inputStr);
  const strokeHex = getStrokeHex(inputStr);
  return strokeRgb ?? strokeHex; // undefined ではない方を 返す
}
function getStrokeHex(inputStr: string): string | undefined {
  const pattern = /(#.*?)"/;
  const matches = inputStr.match(pattern);
  return matches?.[1]; // matches が null または undefined の場合に undefined を返し それ以外の場合には matches[1] の値
}
function getStrokeRgb(inputStr: string): string | undefined {
  const pattern = /(rgb\(.*?\))/;
  const matches = inputStr.match(pattern);
  return matches?.[1]; // matches が null または undefined の場合に undefined を返し それ以外の場合には matches[1] の値
}

function getOpacity(inputStr: string): string {
  const pattern = /\sopacity="([^"]*)"/;
  const matches = inputStr.match(pattern);
  return matches === null ? "1.0" : (matches[1] ?? "1.0"); // 完全に不透明な値が 省略されていて matches が null の場合に '1.0' を返す
}
function getStrokeOpacity(inputStr: string): string {
  const pattern = /stroke-opacity="([^"]*)"/;
  const matches = inputStr.match(pattern);
  return matches === null ? "1.0" : (matches[1] ?? "1.0"); // 完全に不透明な値が 省略されていて matches が null の場合に '1.0' を返す
}
