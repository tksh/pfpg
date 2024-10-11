import { decodeUrlParams } from 'common-utils/read-url-params'

export
    { getInitialOpacitySteps
    , calculateStepsFromTwoOpacities
    }


// Get initial opacity steps from original lines data
function getInitialOpacitySteps() {

    // Get the whole lines data
    const decodedLinesByGroups = decodeUrlParams().linesData
    // e.g.: Map(3) {0 => {…}, 1 => {…}, 2 => {…}}

    return calculateStepsFromTwoOpacities(decodedLinesByGroups)
}

// Get the opacity steps from url param value
function calculateStepsFromTwoOpacities(dataByGroups) {
   // Extract the values of opacities / e.g.: (3) ['1.0', '1.0', '1.0']
   const opArr = [...dataByGroups.values()].map(data => data.groupColors.gOpacity)
   const soArr = [...dataByGroups.values()].map(data => data.groupColors.gStrokeOpacity)

   // Convert the type to number / e.g.: (3) [1.0, 1.0, 1.0]
   const opNumArray = opArr.map(value => Number(value))
   const soNumArray = soArr.map(value => Number(value))

   // Find largest step selected from [0.2, 0.1, 0.04] for each attr
   const opLargestStep = findLargestStep(opNumArray)
   const soLargestStep = findLargestStep(soNumArray)

   // Select smaller step value to get 'opacity steps' value for this artwork
   const steps = Math.min(opLargestStep, soLargestStep)

   return steps
}

// Find largest step from number array, selected from [0.2, 0.1, 0.04]
function findLargestStep(numberArray) {
    // 値を整数に変換する
    const intValues = numberArray.map(v => Math.round(v * 100))

    let maxStep = 0.2
    let currentGCD = 0

    // 要素が0.2、0.1、0.04のいずれかで割り切れるかを確認する
    for (let i = 0; i < intValues.length; i++) {
        // 要素が20で割り切れる場合
        if (intValues[i] % 20 === 0) {
            // 現在の最大公約数と20の最大公約数を求める
            currentGCD = gcd(currentGCD, 20)
        }
        // 要素が10で割り切れる場合
        else if (intValues[i] % 10 === 0) {
            // 現在の最大公約数と10の最大公約数を求める
            currentGCD = gcd(currentGCD, 10)
        }
        // 要素が4で割り切れる場合
        else if (intValues[i] % 4 === 0) {
            // 現在の最大公約数と4の最大公約数を求める
            currentGCD = gcd(currentGCD, 4)
        }
    }

    // 最大公約数に応じて、最大ステップサイズを決定する
    if (currentGCD === 20) {
        maxStep = 0.2
    } else if (currentGCD === 10) {
        maxStep = 0.1
    } else if (currentGCD === 4) {
        maxStep = 0.04
    }

    // 最大ステップサイズを返す
    return maxStep
}

// 最大公約数を求める関数
function gcd(a, b) {
    // 2つの数の最大公約数を求める
    // ユークリッドの互除法を使用
    while (b !== 0) {
        // bが0でなければ、aをbで割った余りをbに代入する
        [a, b] = [b, a % b]
    }
    // aが最大公約数となる
    return Math.abs(a)
}
