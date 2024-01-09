// セレクトメニューの要素を取得
const selectOfOpacitySteps = document.getElementById("opacity-steps");
console.log('selectOfOpacitySteps.length is ', selectOfOpacitySteps.length); // 3

// changeイベントを設定
selectOfOpacitySteps.addEventListener("change", () => {

    // 選択されたセレクトメニューの値を取得
    const step = Number(selectOfOpacitySteps.value);
    console.log('selectOfOpacitySteps.value: ', typeof (step), step); // number, 0.04|0.1|0.2

    changeOpacitySelectOptionsAsNewStep(step)
});