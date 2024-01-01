// For generating the shapes to trim

// Get the grid size
function getGridSize() {
    const patternToGetGridsizeFromViewbox = /viewBox="\d+\s+\d+\s+\d+\s+(\d+)"/; // viewBox属性の値から最後の数字を抽出する正規表現
    const matchs = patternToGetGridsizeFromViewbox.exec(getInputSvg()); // // 正規表現パターンと文字列を照合, 結果を配列として返す
    const gridSize = matchs[1]
    //console.log('gridSize: ', gridSize) // 配列の 0番目には全体のマッチ結果, 1番目にはグルーピングした部分 // 255
    return gridSize
}

// Get center (the half of grid size)
function getCenter() {
    const gridSize = getGridSize()
    const center = roundToTwoDecimals(gridSize / 2)
    return center
}

// Two option <select> for 'Squircle, slimmed'

// Width narrowness
function getWidthNarrowness() {
    const selectWidthNarrowness = document.getElementById('width-narrowness');
    return selectWidthNarrowness.value;
}

// Top-heavy ratio
function getTopHeavyRatio() {
    const selectTopHeavyRatio = document.getElementById('top-heavy-ratio');
    return selectTopHeavyRatio.value;
}

// Generate the path string of Squircle, slimmed
function generateClipPathShapeOfSquircleSlimmed(widthNarrowness, topHeavyRatio) {
    console.log('widthNarrowness, topHeavyRatio: ', widthNarrowness, topHeavyRatio)

    const gridSize = getGridSize();
    const center = getCenter();

    // generate the path of squircle slimmed
    const eachSideWidthForNarrowing = ((gridSize / 100) * (widthNarrowness / 2))
    const left = roundToTwoDecimals(0 + eachSideWidthForNarrowing)
    //console.log('left: ', left)
    const right = roundToTwoDecimals(gridSize - eachSideWidthForNarrowing)
    //console.log('right: ', right)
    const topInflationAmount = roundToTwoDecimals(left - ((gridSize / 100) * topHeavyRatio))
    //console.log('topInflationAmount: ', topInflationAmount)
    const shapePathOfSquircleSlimmed = `<path d="M ${left},${center}Q ${topInflationAmount},0 ${center},0T ${right},${center} ${center},${gridSize} ${left},${center}" />`
    return shapePathOfSquircleSlimmed;
}


// Replace the path string with new selected shape one
function svgWithNewShapeToTrim(shape, inputSVG, shapePathOfSquircle, shapePathOfSquircleSlimmed) {
    let updatedSVG;

    // cliPathとして使う かたち のパス文字列 を 取得する正規表現パターン
    const patternForClipPathShape = /<clipPath id="clipShape">\n.*\n.*<\/clipPath>/g;

    if (shape == 'square') {
        console.log('Selected shape is ', shape)
        // 正規表現でマッチした部分を書き換える
        updatedSVG = inputSVG.replace(patternForClipPathShape, '<clipPath id="clipShape">\n            <rect width="100%" height="100%" />\n        <\/clipPath>');
        //console.log('updatedSVG is ', updatedSVG)
    } else if (shape == 'circle') {
        console.log('Selected shape is ', shape)
        updatedSVG = inputSVG.replace(patternForClipPathShape, '<clipPath id="clipShape">\n            <circle cx="50%" cy="50%" r="50%" />\n        <\/clipPath>');
        //console.log('updatedSVG is ', updatedSVG)
    } else if (shape == 'squircle') {
        console.log('Selected shape is ', shape)
        updatedSVG = inputSVG.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircle}\n        <\/clipPath>`);
        //console.log('updatedSVG is ', updatedSVG)
    } else if (shape == 'squircleSlimmed') {
        console.log('Selected shape is ', shape)
        updatedSVG = inputSVG.replace(patternForClipPathShape, `<clipPath id="clipShape">\n            ${shapePathOfSquircleSlimmed}\n        <\/clipPath>`);
        //console.log('updatedSVG is ', updatedSVG)
    }

    return updatedSVG
}
