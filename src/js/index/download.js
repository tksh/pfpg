// function to get the svg whole string

function getInputSvg() {

    // <textarea>の要素を取得
    const svgElement = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...

    // <textarea>のvalue属性を取得
    return svgElement.value.trim() // `.trim()` = 文字列の両端の空白を削除

}

// Get the artwork ID
function getArtworkId() {
    const inputSVG = getInputSvg()
    // Set the regex to match the artwork id inside the <title> tag
    // `.` は任意の一文字にマッチし `*?` は直前の文字が 0回以上できるだけ少なく 繰り返される
    const patternForTitle = /<title>(.*?)<\/title>/g;

    // Assign the content of the <title> tag to a variable
    const titleText = patternForTitle.exec(inputSVG)[1];
    console.log('titleText: ', titleText) // titleText:  202304_001

    return titleText
}

// Get the grid size of SVG
function getGridSizeWxH() {
    const inputSVG = getInputSvg()

    // Set the regex to match the grid size inside the viewBox attr
    // e.g. viewBox="0 0 31 31", viewBox="0 0 255 255"
    // スペースとダブルクォートに挟まれた 数字の一回以上の繰り返し にマッチ, 数字部分のみをグルーピング;
    const patternForGridSize = /viewBox="\d+ \d+ (\d+) (\d+)"/;

    // Assign the content of the <title> tag to a variable
    const matchesGridSize = patternForGridSize.exec(inputSVG); // 配列の 0番目には全体のマッチ結果, 1番目以降にはグルーピングした部分

    const gridSizeWidth = matchesGridSize[1]
    const gridSizeHeight = matchesGridSize[2]
    const gridSizeWxH = `${gridSizeWidth}x${gridSizeHeight}`
    //console.log('gridSizeWxH is ', gridSizeWxH)

    return gridSizeWxH
}

// Get the rasterized pixel size of PNG
function getPixelSizeWxH() {
    // from info text
    const pngInfoElem = document.getElementById('png-info')
    const pngInfoText = pngInfoElem.textContent;
    console.log('pngInfoElem.textContent: ', pngInfoElem.textContent)

    // extract WxH from like 'Converted PNG size: 352 x 352 px'
    const patternForPngSize = /(\d+) x (\d+)/;

    // Assign the content of the <title> tag to a variable
    const matchesPngSize = patternForPngSize.exec(pngInfoText); // 配列の 0番目には全体のマッチ結果, 1番目以降にはグルーピングした部分

    const pngSizeWidth = matchesPngSize[1]
    const pngSizeHeight = matchesPngSize[2]
    const pngSizeWxH = `${pngSizeWidth}x${pngSizeHeight}`
    console.log('pngSizeWxH: ', pngSizeWxH)

    return pngSizeWxH
}



// Get the current preference status
function getCurrentStatus() {

    // stroke color
    const strokeColorInput = document.getElementById('stroke-color-picker')
    //console.log(strokeColorInput)
    const strokeColorWithHashsymbol = strokeColorInput.value; // 要素の値は文字列として扱われる
    const strokeColor = strokeColorWithHashsymbol.substring(1) // 先頭の `#` を削除
    console.log('strokeColor: ', strokeColor)

    // multipul strokesc olors
    const numberOfGroupsAndHexCodeArray = getGroupColorsValues();
    const hexCodeArray = numberOfGroupsAndHexCodeArray.stroke_array
    // const hexCodeArray = numberOfGroupsAndHexCodeArray[1]
    const hexCodeStringArrayWithoutHash = hexCodeArray.map((eachColorStr) => eightToFourOrThree(eachColorStr).slice(1).toUpperCase());
    const hexCodeStringArrayJoined = hexCodeStringArrayWithoutHash.join('_')

    // background color
    const rectColorInput = document.getElementById('rect-color-picker')
    //console.log(rectColorInput)
    const rectColorWithHashsymbol = rectColorInput.value; // 要素の値は文字列として扱われる
    const rectColorWithHashsymbolShorten = eightToFourOrThree(rectColorWithHashsymbol); // 同じ値が連続していれば4桁に省略し さらに 最後が'F'or'f'なら削除し3桁にする
    const rectColor = rectColorWithHashsymbolShorten.substring(1).toUpperCase() // 先頭の `#` を削除
    console.log('rectColor: ', rectColor)

    // antiAliasing
    const antiAliasingSelect = document.getElementById('shape-rendering')
    let antiAliasing;
    if (antiAliasingSelect.value === 'geometricPrecision') {
        antiAliasing = 'on';
    } else if (antiAliasingSelect.value === 'crispEdges') {
        antiAliasing = 'off';
    }

    // shape to trim
    const shapeToTrimSelect = document.getElementById('shape-to-trim')
    //console.log(shapeToTrimSelect)
    const shapeToTrim = shapeToTrimSelect.value; // 要素の値は文字列として扱われる
    console.log('shapeToTrim: ', shapeToTrim)



    // 'shape to trim' に 'squircleSlimmed' が 適用されている場合だけ ふたつのオプションの値を取得し それを含むファイル名を生成する
    if (shapeToTrim === 'squircleSlimmed') {

        // Two options for squircle, slimmed
        const selectWidthNarrowness = document.getElementById('width-narrowness');
        const selectTopHeavyRatio = document.getElementById('top-heavy-ratio');
        const widthNrrowness = selectWidthNarrowness.value;
        const topHeavyRatio = selectTopHeavyRatio.value;

        // Merge the all values of status, with two options
        return `strokeColor_${hexCodeStringArrayJoined}-bgColor_${rectColor}-trimmedShape_${shapeToTrim}_${widthNrrowness}_${topHeavyRatio}-antiAlias_${antiAliasing}`

    }


    // Merge the all values of status
    return `strokeColor_${hexCodeStringArrayJoined}-bgColor_${rectColor}-trimmedShape_${shapeToTrim}-antiAlias_${antiAliasing}`

}



// Download as SVG

function downloadSvg() {

    const svg = document.getElementById('input-svg').value;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;


    // Generate a the filename

    // artwork id
    const artworkId = getArtworkId()

    // grid size
    const gridSizeWxH = getGridSizeWxH()

    // current status
    const currenSstatus = getCurrentStatus()


    // Set the filename
    link.download = `${artworkId}-${gridSizeWxH}-${currenSstatus}.svg`;

    link.click();
}
// Result:
// 106 chars
// 202304_001-strokeColor_B90000E2-backgroundColor_44FF2A99-trimmedShape_squircleSlimmed-antiAliasing_Off.svg



// Download as PNG

function downloadPng() {

    // Get a Blob URL from rasterized img
    const imgElem = document.getElementById('img');
    //console.log('imgElem ', imgElem)
    console.log('imgElem.src ', imgElem.src)
    const url = imgElem.src

    // Generate an <a> element
    const link = document.createElement('a');
    // set the url as 'href' attr
    link.href = url;


    // Generate a the filename

    // artwork id
    const artworkId = getArtworkId()

    // rasterized PNG pixel size
    const pixelSize = getPixelSizeWxH()

    // current status
    const currenSstatus = getCurrentStatus()


    // Set the filename
    link.download = `${artworkId}-${pixelSize}px-${currenSstatus}.png`;

    link.click();
}
// Result:
// 95 chars
// 202304_001-255x255px-strokeColor_000000FF-bgColor_FFFFFF99-trimmedShape_squircleSlimmed-antiAlias_Off.svg

