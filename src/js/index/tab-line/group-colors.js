// SVG

// <g>タグを生成する
function generateGroupColorsSvgTags(matches) {
    console.log('matches: ', matches) // e.g.: (4) [undefined, '#4E8D09', '0.6', '1']

    const stroke        = tryShortenAsHalf(matches[1].slice(1));                                 // `#`記号 を除く文字列を取得
    const opacity       = matches[2] !== undefined ? matches[2] : "1";       // opacity が明示的に指定されていない場合は 1 とみなす
    const strokeOpacity = matches[3] !== undefined ? matches[3] : "1"; // strokeOpacity が明示的に指定されていない場合は 1 とみなす
    const groupElem = `<g stroke="#${stroke}" opacity="${opacity}" stroke-opacity="${strokeOpacity}">`

    console.log('groupElem: ', groupElem) // e.g.: <g stroke="#4E8D09" opacity="0.6" stroke-opacity="1">
    return groupElem
}


// HTML

// Generate the strokes group color input HTML elements

function generateGroupColorsHtmlElements(step) {
    console.log(`generateGroupColorsHtmlElements() now started. (Opacity step = ${step})`)

    const groupColorsValues = getGroupColorsValues();
    const numberOfGroups = groupColorsValues.get('number_of_groups')
    const stroke         = groupColorsValues.get('stroke_array')
    const opacity        = groupColorsValues.get('opacity_array')
    const strokeOpacity  = groupColorsValues.get('stroke_opacity_array')

    // 挿入先のdiv要素を取得
    const groupColorsDiv = document.getElementById("group-colors-input-and-select");

    // Delete current whole child nodes
    while (groupColorsDiv.firstChild) {
        groupColorsDiv.removeChild(groupColorsDiv.firstChild);
    }

    // マッチした部分の数だけ繰り返す
    for (let i = 0; i < numberOfGroups; i++) {

        const optsCellDiv = document.createElement('div');
        // クラスを追加
        optsCellDiv.classList.add('opts-cell-for-group-colors');

        // jscolor カラーピッカーを作成

        // label要素を作成
        const labelElement = document.createElement("label");
        labelElement.setAttribute('for', `group-colors-stroke-${i}`);
        labelElement.textContent = `${i + 1}:`;
        labelElement.classList.add('stroke');

        // input要素を作成
        const inputElement = document.createElement("input");
        inputElement.classList.add('stroke');
        inputElement.autocomplete = "off";
        inputElement.id = `group-colors-stroke-${i}`;
        inputElement.setAttribute('value', `${stroke[i]}`);
        inputElement.setAttribute("data-jscolor", "{}");

        // label, input要素を div要素の子として追加
        optsCellDiv.appendChild(labelElement)
        optsCellDiv.appendChild(inputElement)


        // Generate <select> elements for opacity and stroke-opacity
        const opacitySelectElem = generateOpacityElements(i, step, 'opacity', opacity[i])
        const strokeOpacitySelectElem = generateOpacityElements(i, step, 'stroke-opacity', strokeOpacity[i])
        console.log('opacitySelectElem: ', opacitySelectElem)
        console.log('strokeOpacitySelectElem: ', strokeOpacitySelectElem)
        optsCellDiv.appendChild(opacitySelectElem)
        optsCellDiv.appendChild(strokeOpacitySelectElem)

        groupColorsDiv.appendChild(optsCellDiv)
    }
}



function generateOpacityElements(i, step, attrName, attrValue) {

    // 選択肢となる数値のリストを作成
    values = numbersIncrementByStep(step)
    console.log('values: ', values)
    // 0.04 => // (26) [ "1", "0.96", "0.92", "0.88", "0.84", "0.8", "0.76", "0.72", "0.68", "0.64", … "0" ]
    // 0.1  => // (11) [ "1", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", … "0" ]
    // 0.2  => //  (6) [ "1", "0.8", "0.6", "0.4", "0.2", "0" ]

    // 現在の値を設定
    let currentValue = attrValue;

    // 現在の値に最も近い値を見つけ出す
    let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev);

    // select要素を作成
    let selectElement = document.createElement("select");
    selectElement.name = `group-colors-${attrName}-${i}`;
    selectElement.id   = `group-colors-${attrName}-${i}`;
    selectElement.classList.add('opacity');

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


function getGroupColorsValues() {
    console.log(`getGroupColorsValues now started.`)

    // Find whole group colors elements

    // Get the matches for <g> from current SVG string in textarea
    const currentSvg = getInputSvg()
    const matches = regexMatchesOfGroupColors(currentSvg)
    // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']

    // マッチした部分の数を取得
    const numberOfGroups = matches.length; // 配列の長さでマッチした部分の数を得る
    // console.log('numberOfGroups: ', numberOfGroups) // 5 (Number)


    // Get each color as hex code
    // カラーピッカー生成時に 初期値として設定するために マッチした部分の内容から各カラー情報の値を 取り出し
    let strokeArray = [];
    let opacityArray = [];
    let strokeOpacityArray = [];

    for (let i = 0; i < matches.length; i++) { // i = group ID
        // Get three group colors value
        const stroke = '#' + hexExpandToSix(getStroke(matches[i]).slice(1)) // 6 digits hex (delete '#' mark using '.slice(1)' before expand)
        const opacity       = getOpacity(matches[i])                        // [0-1] number
        const strokeOpacity = getStrokeOpacity(matches[i])                  // [0-1] number

        // Set into each array
        strokeArray.push(stroke)
        opacityArray.push(opacity)
        strokeOpacityArray.push(strokeOpacity)
    }

    console.log('strokeArray: ', strokeArray)                // e.g.: (5) ['#000000', '#000000', '#000000', '#eeeeee', '#ffffff']
    console.log('opacityArray: ', opacityArray)              // e.g.: (5) ['1', '1', '1', '1', '1']
    console.log('strokeOpacityArray: ', strokeOpacityArray)  // e.g.: (5) ['1', '1', '1', '1', '1']

    return new Map([
        ['number_of_groups', numberOfGroups], // Number
        ['stroke_array', strokeArray], // Array
        ['opacity_array', opacityArray], // Array
        ['stroke_opacity_array', strokeOpacityArray]  // Array
    ])
}

// Get the values from group colors <g> element string
function regexMatchesOfGroupColors(inputSvg) {
    const pattern = /<g stroke=[^>]*>/g;
    const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
    // console.log('matches: ', matches)
    // e.g.: (5) ['<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#000000" opacity="1" stroke-opacity="1">', '<g stroke="#eeeeee" opacity="1" stroke-opacity="1">', '<g stroke="#ffffff" opacity="1" stroke-opacity="1">']
    return matches
}
// Get each attrs values
function getStroke(inputStr) {
    const pattern = /(#.*?)"/
    const matches = inputStr.match(pattern)
    return matches[1]
}
function getOpacity(inputStr) {
    const pattern = /\sopacity="([^"]*)"/
    const matches = inputStr.match(pattern)
    //console.log('matches[1]: ', matches[1])
    return matches[1]
}
function getStrokeOpacity(inputStr) {
    const pattern = /stroke-opacity="([^"]*)"/
    const matches = inputStr.match(pattern)
    //console.log('matches[1]: ', matches[1])
    return matches[1]
}


// Get the number of stroke colors to add multiple event listener
// via addEventListenerForGroupColorsInputs()
function getNumberOfGroups(inputSvg) {
    // 正規表現パターンを作成
    const pattern = /g stroke="[^"]*"/g; // g stroke="..." にマッチするパターン
    // パターンにマッチする部分をすべて探す
    const matches = inputSvg.match(pattern); // matchメソッドで配列を返す
    //console.log('matches(g stroke="#XXX"): ', matches) // Array(3) [ 'g stroke="#000"', 'g stroke="#eee"', 'g stroke="#fff"' ]
    // マッチした部分の数を取得
    const numberOfGroups = matches.length; // 配列の長さでマッチした部分の数を得る
    //console.log('typeof(numberOfGroups): ', typeof (numberOfGroups)) // number
    return numberOfGroups
}
