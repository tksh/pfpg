// For event listener of Opacity steps <select>.

// 'opacity' and 'stroke-opacity' values of whole groups will be changed as selected new steps.
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
    values = numbersIncrementByStep(step)
    console.log('values: ', values)
    // step: 0.04 => (26) [1, 0.96, 0.92, 0.88, 0.84, 0.8, 0.76, 0.72, 0.68, 0.64, 0.6, 0.56, 0.52, 0.48, 0.44, 0.4, 0.36, 0.32, 0.28, 0.24, 0.2, 0.16, 0.12, 0.08, 0.04, 0]
    // step: 0.1  => (11) [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0]
    // step: 0.2  =>  (6) [1, 0.8, 0.6, 0.4, 0.2, 0]

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



// Update SVG

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



// For init()

// Get initial opacity steps detected from original decoded SVG
function getInitialOpacitySteps() {

    // get whole group 'opacity' and 'stroke-opacity' values
    const groupColorsValues = getGroupColorsValues()
    const opNumArray = groupColorsValues.get('opacity_array').map(value => Number(value))
    const soNumArray = groupColorsValues.get('stroke_opacity_array').map(value => Number(value))

    // Find largest step selected from [0.2, 0.1, 0.04] for each attr
    const opLargestStep = findLargestStep(opNumArray)
    const soLargestStep = findLargestStep(soNumArray)

    // Select smaller, it is 'opacity steps' for this artwork
    return Math.min(opLargestStep, soLargestStep);
}

// Find largest step from number array, selected from [0.2, 0.1, 0.04]
function findLargestStep(numberArray) {
    // 値を整数に変換する
    const intValues = numberArray.map(v => Math.round(v * 100));

    // 最大公約数を求める関数
    function gcd(a, b) {
        // 2つの数の最大公約数を求める
        // ユークリッドの互除法を使用
        while (b !== 0) {
            // bが0でなければ、aをbで割った余りをbに代入する
            [a, b] = [b, a % b];
        }
        // aが最大公約数となる
        return Math.abs(a);
    }

    let maxStep = 0.2;
    let currentGCD = 0;

    // 要素が0.2、0.1、0.04のいずれかで割り切れるかを確認する
    for (let i = 0; i < intValues.length; i++) {
        // 要素が20で割り切れる場合
        if (intValues[i] % 20 === 0) {
            // 現在の最大公約数と20の最大公約数を求める
            currentGCD = gcd(currentGCD, 20);
        }
        // 要素が10で割り切れる場合
        else if (intValues[i] % 10 === 0) {
            // 現在の最大公約数と10の最大公約数を求める
            currentGCD = gcd(currentGCD, 10);
        }
        // 要素が4で割り切れる場合
        else if (intValues[i] % 4 === 0) {
            // 現在の最大公約数と4の最大公約数を求める
            currentGCD = gcd(currentGCD, 4);
        }
    }

    // 最大公約数に応じて、最大ステップサイズを決定する
    if (currentGCD === 20) {
        maxStep = 0.2;
    } else if (currentGCD === 10) {
        maxStep = 0.1;
    } else if (currentGCD === 4) {
        maxStep = 0.04;
    }

    // 最大ステップサイズを返す
    return maxStep;
}


// Get the opacity steps detected from html <select> element
function getOpacitySteps() {
    return Number(document.getElementById("opacity-steps").value)
}
