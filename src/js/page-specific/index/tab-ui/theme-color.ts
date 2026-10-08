import { updateState } from "state/url-state-manager";
import { determinePickerTheme } from "tab-lines/group-colors-generator";

export {
  changeThemeColor,
  getDefaultThemeViaPrefersColorScheme,
  initThemeColorSelect,
};

function initThemeColorSelect(): void {
  // セレクトメニューの要素を取得
  const colorThemeSelector = document.getElementById("theme-color");
  if (!colorThemeSelector) throw new Error("Element 'theme-color' not found");
  const colorThemeSelect = colorThemeSelector as HTMLSelectElement;

  // changeイベントを設定
  colorThemeSelect.addEventListener("change", () => {
    // 選択されたテーマに基づいて サイトUIの data-theme属性を設定
    const themeColor = colorThemeSelect.value;
    changeThemeColor(themeColor);

    // 選択されたテーマに基づいて Alwanカラーピッカーの data-theme属性を設定
    const lightOrDark = determinePickerTheme();
    document.querySelectorAll(".alwan").forEach((picker: Element) => {
      (picker as HTMLElement).dataset.theme = lightOrDark;
    });
  });
}

function changeThemeColor(themeColor: string): void {
  // 選択されたテーマに基づいてdata-theme属性を設定
  document.documentElement.setAttribute("data-theme", themeColor);

  // Update the state with url params
  updateState("themeColor", themeColor);
}

function getDefaultThemeViaPrefersColorScheme(): string {
  // ブラウザの prefers-color-scheme の設定を取得する
  if (
    globalThis.matchMedia &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    // ダークテーマが設定されている場合の処理
    return "dark";
  } else {
    // ライトテーマが設定されている場合の処理
    return "light";
  }
}
