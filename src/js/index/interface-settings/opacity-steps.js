function changeOpacitySelectOptionsAsNewStep(step) {

    const groupColorsValues = getGroupColorsValues();
    const numberOfGroups = groupColorsValues.get('number_of_groups')
    const opacity        = groupColorsValues.get('opacity_array')
    const strokeOpacity  = groupColorsValues.get('stroke_opacity_array')

    // group colors の数だけ繰り返す
    for (let i = 0; i < numberOfGroups; i++) {
        // 新しい step の <option>に 置き換える
        // selected は 新しい<option>の中から 現在の値に一番近いものに 変更する
        replaceToNewStepOptions(i, step, 'opacity', opacity)
        replaceToNewStepOptions(i, step, 'stroke-opacity', strokeOpacity)
    }
}


function replaceToNewStepOptions(i, step, attrName, attrValueArray) {

    // Get the elem to append the new <option>
    const selectElement = document.getElementById(`group-colors-${attrName}-${i}`);

    // Delete current whole child <option> nodes
    while (selectElement.firstChild) {
        selectElement.removeChild(selectElement.firstChild);
    }


    // Add new <option>

    // 選択肢となる数値のリストを作成
    values = valuesByStep(step)
    console.log('values: ', values)
    // 0.04 => // (26) ['0.00', '0.04', '0.08', '0.12', '0.16', '0.20', '0.24', '0.28', '0.32', '0.36', '0.40', '0.44', '0.48', '0.52', '0.56', '0.60', '0.64', '0.68', '0.72', '0.76', '0.80', '0.84', '0.88', '0.92', '0.96', '1.00']
    // 0.1  => // (11) ['0.0', '0.1', '0.2', '0.3', '0.4', '0.5', '0.6', '0.7', '0.8', '0.9', '1.0']
    // 0.2  => //  (6) ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0']

    // 現在の値を設定
    let currentValue = attrValueArray[i]

    // 現在の値に最も近い値を見つけ出す
    let closestValue = values.reduce((prev, curr) => Math.abs(curr - currentValue) < Math.abs(prev - currentValue) ? curr : prev);

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
}

function valuesByStep(step) {
    let values = [];
    if (step === 0.04) {
        // 0から100までの整数を4の間隔で配列に格納
        for (let i = 0; i <= 100; i += 4) {
            // 整数を100で割って小数に戻す
            values.push((i / 100).toFixed(2));
        }
    } else { // step = 0.1|0.2
        for (let i = 0; i <= 1; i += parseFloat(step)) {
            values.push(i.toFixed(1));
        }
    }
    return values.reverse() // 一番上に表示される選びやすい<option>が 0 ではなく 1 になるように 逆順にする
}
// console.log(valuesByStep(0.04))
// console.log(valuesByStep(0.1))
// console.log(valuesByStep(0.2))
// (26) ['1.00', '0.96', '0.92', '0.88', '0.84', '0.80', '0.76', '0.72', '0.68', '0.64', '0.60', '0.56', '0.52', '0.48', '0.44', '0.40', '0.36', '0.32', '0.28', '0.24', '0.20', '0.16', '0.12', '0.08', '0.04', '0.00']
// (11) ['1.0', '0.9', '0.8', '0.7', '0.6', '0.5', '0.4', '0.3', '0.2', '0.1', '0.0']
//  (6) ['1.0', '0.8', '0.6', '0.4', '0.2', '0.0']



function updateSvgForNewStep() {

    // Read current SVG string from <textarea>
    let svgString = getInputSvg()

    // Get current SVG string and number of groups
    const numberOfGroups = getNumberOfGroups(svgString)

    // Loop by group ID: Extract the values from UI tab HTML elements => Replace the <textarea> string
    for (let groupId = 0; groupId < numberOfGroups; groupId++) {

        // Get 'stroke' value
        const strokeElementId = `group-colors-stroke-${groupId}`
        const strokeElement = document.getElementById(`${strokeElementId}`)
        const stroke = strokeElement.value

        // Get 'opacity' value
        const opacityElementId = `group-colors-opacity-${groupId}`
        const opacityElement = document.getElementById(`${opacityElementId}`)
        const opacity = opacityElement.value

        // Get 'stroke-opacity' value
        const strokeOpacityElementId = `group-colors-stroke-opacity-${groupId}`
        const strokeOpacityElement = document.getElementById(`${strokeOpacityElementId}`)
        const strokeOpacity = strokeOpacityElement.value

        // Generate the array like regex 'match' object with input value
        const valueAsMatchesStructure = [
            undefined,    // [0] = undefined
            stroke,       // [1] = value of stroke
            opacity,      // [2] = value of opacity
            strokeOpacity // [3] = value of stroke-opacity
        ]

        // Generate new group colors <g> element
        changedGroupElem = generateGroupColorsSvgTags(valueAsMatchesStructure)

        // Replace the <g> elements via group ID
        const pattern = /<g stroke=[^>]*>/g
        svgString = replaceAtIndex(svgString, pattern, changedGroupElem, groupId)
    }

    // Refresh the SVG string in <textarea>
    const svgTextarea = document.querySelector('#input-svg')
    svgTextarea.value = svgString

    return svgString
}