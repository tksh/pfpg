export function replaceShapeRendering(svgString, shapeRendering) {
    // 正規表現パターンを作成
    const patternForShapeRendering = /shape-rendering="[^"]*"/g
    // 正規表現でマッチした部分を書き換える
    return svgString.replace(patternForShapeRendering, `shape-rendering="${shapeRendering}"`)
}