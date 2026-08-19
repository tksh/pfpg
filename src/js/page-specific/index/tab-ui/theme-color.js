import { updateState }          from 'state/url-state-manager'
import { determinePickerTheme } from 'tab-lines/group-colors-generator'

export
    { changeThemeColor
    , initThemeColorSelect
    , getDefaultThemeViaPrefersColorScheme
    }

function initThemeColorSelect() {
    // セレクトメニューの要素を取得
    const colorThemeSelector = document.getElementById('theme-color')

    // changeイベントを設定
    colorThemeSelector.addEventListener('change', () => {
        // 選択されたテーマに基づいて サイトUIの data-theme属性を設定
        const themeColor = colorThemeSelector.value
        console.log('The value of theme color from selector:', themeColor)
        changeThemeColor(themeColor)

        // 選択されたテーマに基づいて Alwanカラーピッカーの data-theme属性を設定
        const lightOrDark = determinePickerTheme()
        document.querySelectorAll('.alwan').forEach(picker => {
            picker.dataset.theme = lightOrDark;
        });
    })
}

function changeThemeColor(themeColor) {
    // 選択されたテーマに基づいてdata-theme属性を設定
    document.documentElement.setAttribute('data-theme', themeColor)

    console.log('Set new theme color:', themeColor)

    // Update the state with url params
    updateState('themeColor', themeColor)
}



function getDefaultThemeViaPrefersColorScheme() {

    // ブラウザの prefers-color-scheme の設定を取得する
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {

        // ダークテーマが設定されている場合の処理
        console.log('Detect default theme color via browser preference: Dark mode')
        return 'dark'

    } else {
        // ライトテーマが設定されている場合の処理
        console.log('Detect default theme color via browser preference: Light mode')
        return 'light'
    }
}
