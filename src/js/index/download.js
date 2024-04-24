// function to get the svg whole string
function getInputSvg() {

    // <textarea>の要素を取得
    const svgTextarea = document.querySelector('#input-svg') // Select <textarea id="input-svg" ...

    // <textarea>のvalue属性を取得
    return svgTextarea.value.trim() // `.trim()` = 文字列の両端の空白を削除

}

// Get the <textarea> element and string value of SVG
function getSvgTextareaAndString() {
    const svgTextarea = document.querySelector('#input-svg')
    const svgString = svgTextarea.value.trim() // <textarea>のvalue属性を取得, `.trim()` => 文字列の両端の空白を削除
    return new Map([
        ['element', svgTextarea],
        ['string', svgString]
    ])
}



// Get the artwork ID
function getArtworkId() {
    const inputSVG = getInputSvg()
    // Set the regex to match the artwork id inside the <title> tag
    // `.` は任意の一文字にマッチし `*?` は直前の文字が 0回以上できるだけ少なく 繰り返される
    const patternForTitle = /<title>(.*?)<\/title>/g

    // Assign the content of the <title> tag to a variable
    const titleText = patternForTitle.exec(inputSVG)[1]
    console.log('titleText: ', titleText) // titleText:  202304_001

    return titleText
}

// Get the grid size of SVG
function getGridSizeWxH() {
    const inputSVG = getInputSvg()

    // Set the regex to match the grid size inside the viewBox attr
    // e.g. viewBox="0 0 31 31", viewBox="0 0 255 255"
    // スペースとダブルクォートに挟まれた 数字の一回以上の繰り返し にマッチ, 数字部分のみをグルーピング
    //const patternForGridSize = /viewBox="([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)"/
    // const patternForGridSize = /viewBox="\d+ \d+ (\d+) (\d+)"/

    const viewboxStr = getViewboxStr(inputSVG)
    const viewboxValues = extractViewboxValues(viewboxStr) // e.g: Map(4) {'x' => 0, 'y' => 0, 'w' => 31, 'h' => 31}

    // Assign the content of the <title> tag to a variable
    //const matchesGridSize = patternForGridSize.exec(inputSVG) // 配列の 0番目には全体のマッチ結果, 1番目以降にはグルーピングした部分

    const gridSizeWidth = viewboxValues.get('w')
    const gridSizeHeight = viewboxValues.get('h')
    const gridSizeWxH = `${gridSizeWidth}x${gridSizeHeight}`
    //console.log('gridSizeWxH is ', gridSizeWxH)

    return gridSizeWxH
}

// Get the rasterized pixel size of PNG
function getPixelSizeWxH() {
    // from info text
    const pngInfoElem = document.getElementById('png-info')
    const pngInfoText = pngInfoElem.textContent
    console.log('pngInfoElem.textContent: ', pngInfoElem.textContent)

    // extract WxH from like 'Converted PNG size: 352 x 352 px'
    const patternForPngSize = /(\d+) x (\d+)/

    // Assign the content of the <title> tag to a variable
    const matchesPngSize = patternForPngSize.exec(pngInfoText) // 配列の 0番目には全体のマッチ結果, 1番目以降にはグルーピングした部分

    const pngSizeWidth = matchesPngSize[1]
    const pngSizeHeight = matchesPngSize[2]
    const pngSizeWxH = `${pngSizeWidth}x${pngSizeHeight}`
    console.log('pngSizeWxH: ', pngSizeWxH)

    return pngSizeWxH
}



// Get the current preference status
function getCurrentStatus() {

    // Lines group attributes (stroke, opacity, stroke-opacity)
    const numberOfGroupsAndColorsValueArray = getGroupColorsValues()
    const stArray = numberOfGroupsAndColorsValueArray.stroke_array
    const opArray = numberOfGroupsAndColorsValueArray.opacity_array
    const soArray = numberOfGroupsAndColorsValueArray.stroke_opacity_array
    console.log(stArray) // Type: String | e.g.: Array(5) [ "#97FF6E", "#000000", "#8ACAFF", "#eeeeee", "#ffffff" ]
    console.log(opArray) // Type: String | e.g.: Array(5) [ "0.5", "1", "1", "1", "1" ]
    console.log(soArray) // Type: String | e.g.: Array(5) [ "1", "0.8", "1", "1", "1" ]

    const stHexArray = stArray.map((colorValueStr) => colorValueStr.slice(1).toUpperCase()) // Delete '#'
    const opHexArray = opArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
    const soHexArray = soArray.map((colorValueStr) => normalizedToHex(Number(colorValueStr)).toUpperCase())
    console.log(stHexArray) // 6 chars hex | e.g.: Array(5) [ "97FF6E", "000000", "8ACAFF", "EEEEEE", "FFFFFF" ]
    console.log(opHexArray) // 2 chars hex | e.g.: Array(5) [ "80", "FF", "FF", "FF", "FF" ]
    console.log(soHexArray) // 2 chars hex | e.g.: Array(5) [ "FF", "CC", "FF", "FF", "FF" ]

    // Format as 5(3+1+1) or 10(6+2+2) or 3(3+0+0) or 6(6+0+0) chars hex string
    // 'stroke' (3|6) + 'opacity' (0|1|2) + 'stroke-opacity' (0|1|2)

    // Merging the arrays (10(6+2+2) chars hex):
    const mergedHexArray = stHexArray.map((item, index) => item + opHexArray[index] + soHexArray[index])

    // Reducing into half length if all hex pairs are duplicated.                  10 => 5
    // And deleting for "FF" (in 5 chars hex) or "FFFF" (in 10 chars hex) at last. 10 => 6, 5 => 3
    const optimizedHexArray = mergedHexArray.map(tenCharsHex => tryDeleteFs(tenToTenOrFive(tenCharsHex)))

    // Join the formatted hex with underscore '_'
    const groupColorsHexString = optimizedHexArray.join('_')
    console.log('groupColorsHexString: ', groupColorsHexString) // e.g.: "FCFF4280FF_000FC_8F52FFFFFF_EEEFF_FFFFF"


    // Path mode
    const pathModeSelect = document.getElementById('path-mode')
    const pathMode = pathModeSelect.value.slice(0, 3) + pathModeSelect.value.slice(8, 11)
    //  'relativeMerged' | 'absoluteSeparated' => 'relMer' | 'absSep'


    // Base color
    const rectColorInput = document.getElementById('base-rect-color-picker')
    // e.g.: <input id="base-rect-color-picker" class="bgcolor jscolor" value="#FFF9" data-jscolor="{}" ...  data-current-color="#99999999" ...
    const rectColorWithHash = rectColorInput.value // 要素の値は文字列として扱われる
    // e.g.: #99999999
    const rectColorWithHashShorten = eightToFourOrThree(rectColorWithHash) // 同じ値が連続していれば4桁に省略し さらに 最後が'F'or'f'なら削除し3桁にする
    const rectColor = rectColorWithHashShorten.substring(1).toUpperCase() // 先頭の `#` を削除
    // e.g.: 9999


    // Anti-aliasing (shapeRendering)
    const antiAliasingSelect = document.getElementById('shape-rendering')
    const shapeRendering = antiAliasingSelect.value


    // Shape to trim
    const shapeToTrimSelect = document.getElementById('shape-to-trim')
    //console.log(shapeToTrimSelect)
    let shapeToTrim = shapeToTrimSelect.value // 要素の値は文字列として扱われる
    console.log('shapeToTrim: ', shapeToTrim)

    // 'Shape to trim' に 'squircleSlimmed' が 適用されている場合だけ ふたつのオプションの値を取得し それを含むファイル名を生成する
    if (shapeToTrim === 'squircleSlimmed') {

        // Two options for 'Squircle, slimmed'
        const selectWidthNarrowness = document.getElementById('width-narrowness')
        const selectTopHeavyRatio   = document.getElementById('top-heavy-ratio')
        const widthNarrowness = selectWidthNarrowness.value
        const topHeavyRatio   = selectTopHeavyRatio.value

        // Merge with two option values
        shapeToTrim = `squircleSlimmed_${widthNarrowness}_${topHeavyRatio}`
    }


    // Merge the all values of status
    return `g_${groupColorsHexString}-p_${pathMode}-b_${rectColor}-t_${shapeToTrim}-r_${shapeRendering}`
}



// Download as SVG

function downloadSvg() {

    const svg = document.getElementById('input-svg').value
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url


    // Generate a the filename

    // artwork id
    const artworkId = getArtworkId()

    // grid size
    const gridSizeWxH = getGridSizeWxH()

    // current status
    const currentStatus = getCurrentStatus()


    // Set the filename
    link.download = `${artworkId}-${gridSizeWxH}-${currentStatus}.svg`

    link.click()
}
// e.g.: 202308_001-31x31-g_000_000_000_EEE_FFF-p_abs-b_9999-t_square-r_crispEdges.svg



// Download as PNG

function downloadPng() {

    // Get a Blob URL from rasterized img
    const imgElem = document.getElementById('img')
    //console.log('imgElem ', imgElem)
    console.log('imgElem.src ', imgElem.src)
    const url = imgElem.src

    // Generate an <a> element
    const link = document.createElement('a')
    // set the url as 'href' attr
    link.href = url


    // Generate a the filename

    // artwork id
    const artworkId = getArtworkId()

    // rasterized PNG pixel size
    const pixelSize = getPixelSizeWxH()

    // current status
    const currentStatus = getCurrentStatus()


    // Set the filename
    link.download = `${artworkId}-${pixelSize}px-${currentStatus}.png`

    link.click()
}
// e.g.: 202308_001-256x256px-g_000_000_000_EEE_FFF-p_abs-b_9999-t_square-r_crispEdges.png
