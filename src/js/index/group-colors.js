// <g>タグを生成する
function generateGroupColorsSvgTags(matches) {
    console.log('matches: ', matches) // (4) [undefined, '#4E8D09', '0.6', '1']

    const color = splitOpacityAndExtended(matches[1], matches[2], matches[3]) // stroke, opacity, stroke-opacity
    // console.log('color: ', color) // (4) [undefined, '#4E8D09', '0.6', '1']
    const opacity = color[2] !== undefined ? color[2] : "1";       // opacity が明示的に指定されていない場合は1.0とみなす
    const strokeOpacity = color[3] !== undefined ? color[3] : "1"; // strokeOpacity が明示的に指定されていない場合は1.0とみなす
    const groupElem = `<g stroke="${color[1]}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`

    console.log('groupElem: ', groupElem) // <g stroke="#4E8D09" opacity="0.6" stroke-opacity="1">
    return groupElem
}



// Generate the strokes group color input HTML tags
generateGroupColorsHtmlTags()

function generateGroupColorsHtmlTags() {
    console.log('generateGroupColorsHtmlTags() now started.')

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

        <label for="group-colors-stroke-${i}">group ${i + 1}:</label>
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


// Generate the strokes group color input HTML elements
generateGroupColorsHtmlElems()

function generateGroupColorsHtmlElems() {
    console.log('generateGroupColorsHtmlElems() now started.')

    const numberOfColorPickersAndColorsArrays = getStrokesColors();
    const numberOfColorPickers = numberOfColorPickersAndColorsArrays[0]
    const stroke = numberOfColorPickersAndColorsArrays[1]
    const opacity = numberOfColorPickersAndColorsArrays[2]
    const strokeOpacity = numberOfColorPickersAndColorsArrays[3]

    // 挿入先のdiv要素を取得
    const groupColorsDivElem = document.getElementById("group-colors-input-and-select");

    // Generate the elements

    // カラーピッカータグを格納する配列を作成
    //    const colorPickers = [];
    // マッチした部分の数だけ繰り返す
    for (let i = 0; i < numberOfColorPickers; i++) {
        console.log('stroke[i]; ', stroke[i])

        // // ブラウザ固有の標準カラーピッカーを作成
        // // label要素を作成
        // const labelElement = document.createElement("label");
        // labelElement.name = `group-colors-stroke-${i}`;
        // labelElement.textContent = `group ${i + 1}:`;
        // // input要素を作成
        // const inputElement = document.createElement("input");
        // inputElement.type = 'color';
        // inputElement.name = `group-colors-stroke-${i}`;
        // inputElement.id = `group-colors-stroke-${i}`;
        // inputElement.value = `${stroke[i]}`;
        // // select要素をdiv要素の子として追加
        // groupColorsDivElem.appendChild(labelElement)
        // groupColorsDivElem.appendChild(inputElement)

        // jscolor カラーピッカーを作成
        // label要素を作成
        const labelElement = document.createElement("label");
        labelElement.name = `group-colors-stroke-${i}`;
        labelElement.textContent = `group ${i + 1}:`;
        // input要素を作成
        const inputElement = document.createElement("input");
        inputElement.dataset.jscolor = '{}';
        // inputElement.setAttribute("data-jscolor", "{}");   // also work
        // inputElement.dataset.jscolor = JSON.stringify({}); // also work
        inputElement.style = 'width: 6.5rem; margin-left: 0.5rem';
        inputElement.class = 'input-color add-margin-bottom';
        inputElement.autocomplete = "off";
        inputElement.id = `group-colors-stroke-${i}`;
        inputElement.value = `${stroke[i]}`;
        // select要素をdiv要素の子として追加
        groupColorsDivElem.appendChild(labelElement)
        groupColorsDivElem.appendChild(inputElement)


        // Generate <select> elements for opacity and stroke-opacity
        const opacitySelectElem = generateOpacityElements('opacity', opacity[i])
        const strokeOpacitySelectElem = generateOpacityElements('stroke-opacity', strokeOpacity[i])

        function generateOpacityElements(attrName, attrValue) {
            // 選択肢となる数値のリストを作成
            let values = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0];

            // 現在の値を設定
            let currentValue = attrValue;

            // 現在の値に最も近い値を見つけ出す
            let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev);

            // select要素を作成
            let selectElement = document.createElement("select");
            selectElement.name = `group-colors-${attrName}-${i}`;
            selectElement.id = `group-colors-${attrName}-${i}`;

            // 各選択肢を作成し、それぞれにvalue属性を設定
            values.forEach((value) => {
                let optionElement = document.createElement("option");
                optionElement.value = value;
                optionElement.text = value;

                // 現在の値に最も近い値に対応するオプションに 'selected' 属性を設定
                if (value === closestValue) {
                    optionElement.setAttribute('selected', 'selected');
                }

                selectElement.appendChild(optionElement);
            });
            return selectElement
        }

        groupColorsDivElem.appendChild(opacitySelectElem)
        groupColorsDivElem.appendChild(strokeOpacitySelectElem)

    }

    return numberOfColorPickers
}


function getStrokesColors() {

    // Find whole group colors elements

    // Get the matches for <g> from current SVG string in textarea
    const currentSVG = getInputSvg()
    const matches = regexMatchesOfGroupColors(currentSVG)
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

    for (let i = 0; i < matches.length; i++) { // i = group ID
        // Get three group colors value
        const stroke = hexExpandTo6(getStroke(matches[i]))       // 6 digits hex (with hash mark)
        const opacity = getOpacity(matches[i])       // [0-1] number
        const strokeOpacity = getStrokeOpacity(matches[i]) // [0-1] number

        // Set into each array
        strokeHexArray.push(stroke)
        opacityArray.push(opacity)
        strokeOpacityArray.push(strokeOpacity)
    }
    // strokeHexArray:      (5) ['#000000', '#000000', '#000000', '#eeeeee', '#ffffff']
    // opacityArray:        (5) ['1', '1', '1', '1', '1']
    // strokeOpacityArray:  (5) ['1', '1', '1', '1', '1']

    return [numberOfColorPickers, strokeHexArray, opacityArray, strokeOpacityArray] // [Number, Array[], Array[], Array[]]
}

// Get the values from group colors <g> element string
// like '<g stroke="#000000" opacity="1" stroke-opacity="1">'
function regexMatchesOfGroupColors(inputSvg) {
    const pattern = /<g stroke=[^>]*>/g;
    const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
    // console.log('matches: ', matches)
    // (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']
    return matches
}
// Get each attrs values
function getStroke(inputStr) {
    const pattern = /(#.*?)"/
    const matches = inputStr.match(pattern)
    return matches[1]
}
function getOpacity(inputStr) {
    const pattern = /\sopacity="(.*?)"/
    const matches = inputStr.match(pattern)
    return matches[1]
}
function getStrokeOpacity(inputStr) {
    const pattern = /stroke-opacity="(.*?)"/
    const matches = inputStr.match(pattern)
    return matches[1]
}


// Get the number of stroke colors to add multipul event listener
// via addEventListenerForGroupColorsInputs()
function getNumberOfStrokeGroups(inputSVG) {
    // 正規表現パターンを作成
    const pattern = /g stroke="[^"]*"/g; // g stroke="..." にマッチするパターン
    // パターンにマッチする部分をすべて探す
    const matches = inputSVG.match(pattern); // matchメソッドで配列を返す
    console.log('matches(g stroke="#XXX"): ', matches) // Array(3) [ 'g stroke="#000"', 'g stroke="#eee"', 'g stroke="#fff"' ]
    // マッチした部分の数を取得
    const numberOfColorPickers = matches.length; // 配列の長さでマッチした部分の数を得る
    console.log('typeof(numberOfColorPickers): ', typeof (numberOfColorPickers)) // number
    return numberOfColorPickers
}
