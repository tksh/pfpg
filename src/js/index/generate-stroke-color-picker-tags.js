// Generate the stroke color picker tags
generateStrokeColorPickerTags()

function generateStrokeColorPickerTags() {

    const numberOfColorPickersAndHexCodeArray = getStrokesColors();
    const numberOfColorPickers = numberOfColorPickersAndHexCodeArray[0]
    const hexCode = numberOfColorPickersAndHexCodeArray[1]

    // Generate the tags

    // カラーピッカータグを格納する配列を作成
    const colorPickers = [];
    // マッチした部分の数だけ繰り返す
    for (let i = 0; i < numberOfColorPickers; i++) {
        console.log('hexCode[i]; ', hexCode[i])
        // カラーピッカータグのHTMLを作成
        const html = `
    <!-- Color-picker: Stroke color for group ${i} -->
    <div>
      <div class="opts-cell">
        <label for="multipul-stroke-color-pickers-${i}">Stroke color [${i + 1}]:</label>
        <input value="${hexCode[i]}" style="width: 9rem;" data-jscolor="{alpha: true}" id="multipul-stroke-color-pickers-${i}" class="input-color add-margin-bottom" autocomplete="off">
      </div>
    </div>`;

        // 配列に追加
        colorPickers.push(html);
    }

    // 配列の要素を改行で結合して出力
    document.getElementById("multipul-stroke-color-pickers").innerHTML = colorPickers.join("\n");
    console.log(`${numberOfColorPickers} stroke color picker tags has generated and inserted.`)

    return numberOfColorPickers
}

// function


function getStrokesColors() {

    // Find whole stroke color groups

    // SVGのテキストを取得
    const inputSVG = getInputSvg()
    // 正規表現パターンを作成
    const pattern = /g stroke="[^"]*"/g; // g stroke="..." にマッチするパターン
    // パターンにマッチする部分をすべて探す
    const matches = inputSVG.match(pattern); // matchメソッドで配列を返す
    console.log('matches(g stroke="#XXX"): ', matches) // Array(3) [ 'g stroke="#000"', 'g stroke="#eee"', 'g stroke="#fff"' ]
    // マッチした部分の数を取得
    const numberOfColorPickers = matches.length; // 配列の長さでマッチした部分の数を得る
    console.log('numberOfColorPickers: ', numberOfColorPickers) // 3



    // Get each color as hex code

    // カラーピッカー生成時に 初期値として設定するために マッチした部分の内容からカラーコードのみを 取り出し

    let hexCodeArray = [];
    for (let i = 0; i < matches.length; i++) {
        //console.log(`stroke-${i}`, matches[i]); // 配列の要素でマッチした部分の内容を得る
        // stroke-0 g stroke="#000"
        // stroke-1 g stroke="#eee"
        // stroke-2 g stroke="#fff"

        // Extract hex code
        extractHexPattern = /(#.*)"/; // ハッシュマークと その次のダブルクォーテーションの あいだの文字列を 種類に関係なくキャプチャする
        const extractHexMatche = matches[i].match(extractHexPattern);
        //console.log('extractHexMatche(hex color code): ', extractHexMatche[1])
        // #000
        // #eee
        // #fff

        eachHexCode = extractHexMatche[1]

        hexCodeArray.push(mergeOpacityAndExtended(eachHexCode))
    }
    console.log('hexCodeArray: ', hexCodeArray) //  // Array(3) [ "#000000ff", "#eeeeeeff", "#ffffffff" ]
    return [numberOfColorPickers, hexCodeArray] // [Number, Array[]]
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

// Split the hex and opacity, and extended if in short style
// For: transparency-scope = whole-group
function splitOpacityAndExtended(hexCodeInput, opacityValueInput, strokeOpacityValueInput) {

    let hexcode = hexCodeInput.slice(1); // `#`記号 を除く文字列を取得

    if (hexcode.length === 3) {
        hexcode = '#' + hexcode.split("").map((char) => char.repeat(2)).join(""); // 文字列の各文字を2回繰り返して結合する
        return [undefined, hexcode.toUpperCase(), undefined]
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


// Generated tags

// <!-- Color-picker: Stroke color for group 0 -->
// <div>
//   <div class="opts-cell">
//     <label for="multipul-stroke-color-pickers-0">Stroke color [1]:</label>
//     <input value="#000000ff" style="width: 9rem; background-image: linear-gradient(to right, rgba(81, 4, 255, 0.54) 0%, rgba(81, 4, 255, 0.54) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="multipul-stroke-color-pickers-0" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#5104FF8B">
//   </div>
// </div>
//
// <!-- Color-picker: Stroke color for group 1 -->
// <div>
//   <div class="opts-cell">
//     <label for="multipul-stroke-color-pickers-1">Stroke color [2]:</label>
//     <input value="#eeeeeeff" style="width: 9rem; background-image: linear-gradient(to right, rgb(238, 238, 238) 0%, rgb(238, 238, 238) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="multipul-stroke-color-pickers-1" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#EEEEEEFF">
//   </div>
// </div>
//
// <!-- Color-picker: Stroke color for group 2 -->
// <div>
//   <div class="opts-cell">
//     <label for="multipul-stroke-color-pickers-2">Stroke color [3]:</label>
//     <input value="#ffffffff" style="width: 9rem; background-image: linear-gradient(to right, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 30px, rgba(0, 0, 0, 0) 31px, rgba(0, 0, 0, 0) 100%), url(&quot;data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAQCAYAAAB3AH1ZAAAAU0lEQVRIS2OcOXPmfwY84OzZs/ikGYyNjfHK49KfkpLCsG3btuWMow4YDYHREBjwEEhLS8NbDpCbz2GFAy79Tk5ODEuXLl3OOOqA0RAYDYGBDgEA8m6qcb3sNVEAAAAASUVORK5CYII=&quot;) !important; background-position: left top, left top !important; background-size: auto, 32px 16px !important; background-repeat: repeat-y, repeat-y !important; background-origin: padding-box, padding-box !important; padding-left: 40px !important;" data-jscolor="{}" id="multipul-stroke-color-pickers-2" class="input-color add-margin-bottom jscolor" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" data-current-color="#FFFFFFFF">
//   </div>
// </div>
