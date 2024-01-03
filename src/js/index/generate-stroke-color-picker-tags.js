// Generate the stroke color picker tags
generateStrokeColorPickerTags()

function generateStrokeColorPickerTags() {

    const numberOfColorPickersAndColorsArrays = getStrokesColors();
    const numberOfColorPickers = numberOfColorPickersAndColorsArrays[0]
    const stroke = numberOfColorPickersAndColorsArrays[1]
    const opacity = numberOfColorPickersAndColorsArrays[2]
    const strokeOpacity = numberOfColorPickersAndColorsArrays[3]

    // Generate the tags

    // カラーピッカータグを格納する配列を作成
    const colorPickers = [];
    // マッチした部分の数だけ繰り返す
    for (let i = 0; i < numberOfColorPickers; i++) {
        console.log('stroke[i]; ', stroke[i])
        // カラーピッカータグのHTMLを作成
        const html = `
    <!-- Color-picker: Stroke color for group ${i} -->
    <div>
      <div class="opts-cell-for-strokes">

        <label for="group-colors-stroke-${i}">Group [${i + 1}]:</label>
        <input value="${stroke[i]}" style="width: 9rem;" data-jscolor="{}" id="group-colors-stroke-${i}" class="input-color add-margin-bottom" autocomplete="off">

        <input type="number" min="0" max="1" step="0.1" value="${opacity[i]}" id="group-colors-opacity-${i}">

        <input type="number" min="0" max="1" step="0.1" value="${strokeOpacity[i]}" id="group-colors-stroke-opacity-${i}">

      </div>
    </div>`;

        // 配列に追加
        colorPickers.push(html);
    }

    // 配列の要素を改行で結合して出力
    document.getElementById("group-colors-stroke").innerHTML = colorPickers.join("\n");
    console.log(`${numberOfColorPickers} stroke color picker tags has generated and inserted.`)

    return numberOfColorPickers
}

// function


function getStrokesColors() {

    // Find whole stroke color groups

    // SVGのテキストを取得
    const inputSVG = getInputSvg()

    // 正規表現パターンを作成
    const pattern = /<g stroke=.*">/g; // g stroke="..." にマッチするパターン

    // パターンにマッチする部分をすべて探す
    const matches = inputSVG.match(pattern); // matchメソッドで配列を返す
    // console.log('matches: ', matches)
    // (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

    // マッチした部分の数を取得
    const numberOfColorPickers = matches.length; // 配列の長さでマッチした部分の数を得る
    // console.log('numberOfColorPickers: ', numberOfColorPickers) // 5 (Number)


    // Get each color as hex code
    // カラーピッカー生成時に 初期値として設定するために マッチした部分の内容から各カラー情報の値を 取り出し

    let strokeHexArray = [];
    let opacityArray = [];
    let strokeOpacityArray = [];

    for (let i = 0; i < matches.length; i++) {
        //console.log(`stroke-${i}`, matches[i]); // 配列の要素でマッチした部分の内容を得る
        // stroke-0 g stroke="#000"
        // stroke-1 g stroke="#eee"
        // stroke-2 g stroke="#fff"

        // Extract hex code of 'stroke'
        strokePattern = /(#.*?)"/; // ハッシュマークと その次のダブルクォーテーションの あいだの 最短の文字列
        const strokeMatche = matches[i].match(strokePattern);
        // console.log('strokeMatche: ', strokeMatche)
        // (2) ['#000000"', '#000000', index: 11, input: '<g stroke="#000000" opacity="1" stroke-opacity="1">', groups: undefined]
        // console.log('strokeMatche[1]: ', strokeMatche[1])
        // #000000

        // Extract two opacity values
        opacityPattern = /\sopacity="(.*?)"/;
        strokeOpacityPattern = /stroke-opacity="(.*?)"/;
        const opacityMatche = matches[i].match(opacityPattern);
        const strokeOpacityMatche = matches[i].match(strokeOpacityPattern);


        stroke = hexExpandTo6(strokeMatche[1]) // 6 digits hex
        opacity = opacityMatche[1]             // [0-1] number
        strokeOpacity = strokeOpacityMatche[1] // [0-1] number

        strokeHexArray.push(stroke)
        opacityArray.push(opacity)
        strokeOpacityArray.push(strokeOpacity)
    }
    // strokeHexArray:      (5) ['#000000', '#000000', '#000000', '#eeeeee', '#ffffff']
    // opacityArray:        (5) ['1', '1', '1', '1', '1']
    // strokeOpacityArray:  (5) ['1', '1', '1', '1', '1']

    return [numberOfColorPickers, strokeHexArray, opacityArray, strokeOpacityArray] // [Number, Array[], Array[], Array[]]
}

function hexExpandTo6(hexcodeWithHash) {
    let hexcode = hexcodeWithHash.slice(1); // `#`記号 を除く文字列を取得
    if (hexcode.length === 3) {
        const repeatTo6 = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        return "#" + repeatTo6
    } else { // 6 digits
        return "#" + hexcode
    }
}

// Merge the hex and opacity, and extended if in short style
// For: transparency-scope = per-stroke
// 'opacity' values are convert into hex 7,8 chars
function mergeOpacityAndExtended(hexCodeInput, opacityValueInput) {

    let hexcode = hexCodeInput.slice(1); // `#`記号 を除く文字列を取得
    console.log('hexcode.length(start): ', hexcode.length) // 3
    let hexForTransparency = ""; // Hex下二桁の透明度情報

    // 入力したhexがの長さが 3 or 6 で 且つ 'opacity' の値が 無い(undefined) なら 'FF' にする
    if (opacityValueInput === undefined) {
        hexForTransparency = 'FF'
    } else { // 'undefined'ではない 数値があった場合は それを hexに変換する
        hexForTransparency = normalizedToHex(opacityValueInput)
    }

    if (hexcode.length === 3) {
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        hexcode = hexcode + hexForTransparency
    } else if (hexcode.length === 6) {
        hexcode = hexcode + hexForTransparency
    } else if (hexcode.length === 4) { // hexcode has opacity, but in short style
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
    }
    console.log('hexcode.length(end): ', hexcode.length) // 10
    const hexWithHash = '#' + hexcode.toUpperCase()
    //    return eightToFourOrThree(hexWithHash) // shorten if could before return
    return hexWithHash // shorten if could before return
}
// console.log(mergeOpacityAndExtended('#000', 1))      // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1))   // #000000FF
// console.log(mergeOpacityAndExtended('#000000', 1.0)) // #000000FF


// Split the hex and opacity, and extended if in short style
// For: transparency-scope = whole-group
function splitOpacityAndExtended(hexCodeInput, opacityValueInput, strokeOpacityValueInput) {

    let hexcode = hexCodeInput.slice(1); // `#`記号 を除く文字列を取得

    if (hexcode.length === 3) {
        hexcode = '#' + hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        return [undefined, hexcode.toUpperCase(), opacityValueInput, strokeOpacityValueInput]
// 入力されるhex色情報は 3|6 だけでいい？ 下記のような透明度情報込みの 4|8 hex表現をサポートする必要があるかどうか 要検討

    } else if (hexcode.length === 8) {
        return splitHexAndOpacity(hexcode) // Hex6桁と 最後二桁の透明度情報を変換した数値[0-1]の 配列を返す
    } else if (hexcode.length === 4) { // hexcode has opacity, but in short style
        hexcode = hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する (4 => 8)
        return splitHexAndOpacity(hexcode) // Hex6桁と 最後二桁の透明度情報を変換した数値[0-1]の 配列を返す
    }

    // 6桁のときは そのまま にする
    //console.log('hex code length is 6')
    const hexWithHash = '#' + hexcode.toUpperCase()
    //const hexcodeShorten = eightToFourOrThree(hexWithHash) // shorten if could before return
    return [undefined, hexWithHash, opacityValueInput, strokeOpacityValueInput]
}
// console.log(splitOpacityAndExtended('#fff'))      // Array(3) [ undefined, "#FFFFFF", undefined ]
// console.log(splitOpacityAndExtended('#ffffff'))   // Array(3) [ undefined, "#FFFFFF", undefined ]
// console.log(splitOpacityAndExtended('#ffffffff')) // Array(3) [ undefined, "#FFFFFF", 1 ]
// console.log(splitOpacityAndExtended('#000'))      // Array(3) [ undefined, "#000000", undefined ]
// console.log(splitOpacityAndExtended('#000000'))   // Array(3) [ undefined, "#000000", undefined ]
// console.log(splitOpacityAndExtended('#00000000')) // Array(3) [ undefined, "#000000", 0 ]

// console.log(splitOpacityAndExtended('#fff'))  // (3) [undefined, '#FFFFFF', undefined]
// console.log(splitOpacityAndExtended('#ffffff')) // (4) [undefined, '#FFFFFF', undefined, undefined]
// Generated tags

// <!-- Color-picker: Stroke color for group 0 -->
// <div>
//   <div class="opts-cell">
//     <label for="group-colors-stroke-0">Stroke color [1]:</label>
//     <input value="#000000ff" style="width: 9rem; background-image: linear-gradient(to right, rgba(81, 4, 255, 0.54) 0%, rgba(81, 4, 255, 0.54) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="group-colors-stroke-0" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#5104FF8B">
//   </div>
// </div>
//
// <!-- Color-picker: Stroke color for group 1 -->
// <div>
//   <div class="opts-cell">
//     <label for="group-colors-stroke-1">Stroke color [2]:</label>
//     <input value="#eeeeeeff" style="width: 9rem; background-image: linear-gradient(to right, rgb(238, 238, 238) 0%, rgb(238, 238, 238) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="group-colors-stroke-1" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#EEEEEEFF">
//   </div>
// </div>
//
// <!-- Color-picker: Stroke color for group 2 -->
// <div>
//   <div class="opts-cell">
//     <label for="group-colors-stroke-2">Stroke color [3]:</label>
//     <input value="#ffffffff" style="width: 9rem; background-image: linear-gradient(to right, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="group-colors-stroke-2" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#FFFFFFFF">
//   </div>
// </div>
