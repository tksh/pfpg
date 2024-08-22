export
    { initThemeColorSelect
    , setSchemeAsDefaultTheme
    }

function initThemeColorSelect() {

    // セレクトメニューの要素を取得
const colorThemeSelector = document.getElementById("theme-color");
console.log('colorThemeSelector.length is ', colorThemeSelector.length); // 2

// changeイベントを設定
colorThemeSelector.addEventListener("change", () => {

    // 選択されたセレクトメニューの値を取得
    const selectedTheme = colorThemeSelector.value;
    console.log('colorThemeSelector.value is ', selectedTheme); // white, light, dark, black

    // 選択されたテーマに基づいてdata-theme属性を設定
    document.documentElement.setAttribute('data-theme', selectedTheme);

    //    // img要素を取得
    //    const img = document.querySelector("img");
    //
    //    // Switch the class for img
    //    if (value == "on") {
    //        console.log('colorThemeSelector.value is ', colorThemeSelector.value)
    //        img.classList.add("checker");
    //    } else if (value == "off") {
    //        console.log('colorThemeSelector.value is ', colorThemeSelector.value)
    //        img.classList.remove("checker");
    //    }
});

}

function setSchemeAsDefaultTheme() {
    // セレクトメニューの要素を取得
    const colorThemeSelector = document.getElementById("theme-color");

    // 選択されたセレクトメニューの値を取得
//    const selectedTheme = colorThemeSelector.value;

    // ブラウザの prefers-color-scheme の設定を取得する
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

        // ダークテーマが設定されている場合の処理
        console.log('Dark mode is enables.');
        colorThemeSelector.value = 'dark'
    } else {
        // ライトテーマが設定されている場合の処理
        console.log('Light mode is enables.');
        colorThemeSelector.value = 'light'
    }
}
//setSchemeAsDefaultTheme()