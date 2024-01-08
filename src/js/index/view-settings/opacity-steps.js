// セレクトメニューの要素を取得
const selectOfOpacitySteps = document.getElementById("opacity-steps");
console.log('selectOfOpacitySteps.length is ', selectOfOpacitySteps.length); // 3

// changeイベントを設定
selectOfOpacitySteps.addEventListener("change", () => {

    // 選択されたセレクトメニューの値を取得
    const steps = selectOfOpacitySteps.value;
    console.log('selectOfOpacitySteps.value: ', steps); //

//    // 現在 設定されている 全ての group colors の opacity, strok-opacity の値を取得
//    const opacity = 
//    const strokeOpacity = 
//
//    // 新しい選択要素を生成
//    const newSelectElement = generateOpacityElements("opacity", opacity, step);
});