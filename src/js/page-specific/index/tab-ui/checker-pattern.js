export function initCheckerPatternListener() {

    // セレクトメニューの要素を取得
const selectOfCheckerPattern = document.getElementById("checker-pattern");
console.log('selectOfCheckerPattern.length is ', selectOfCheckerPattern.length); // 2

// changeイベントを設定
selectOfCheckerPattern.addEventListener("change", () => {

    // 選択されたセレクトメニューの値を取得
    const value = selectOfCheckerPattern.value;
    //console.log('selectOfCheckerPattern.value is ', value); // on|off

    // img要素を取得
    const img = document.querySelector("img");

    // Switch the class for img
    if (value == "on") {
        console.log('selectOfCheckerPattern.value is ', selectOfCheckerPattern.value)
        img.classList.add("checker");
    } else if (value == "off") {
        console.log('selectOfCheckerPattern.value is ', selectOfCheckerPattern.value)
        img.classList.remove("checker");
    }
});

}