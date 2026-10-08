import { updateState } from "state/url-state-manager";

export {
  changeThemeColor,
  getDefaultThemeViaPrefersColorScheme,
  initThemeColorSelect,
};

function initThemeColorSelect(): void {
  const colorThemeSelect = document.getElementById("theme-color");
  if (!colorThemeSelect) throw new Error("Element 'theme-color' not found");

  (colorThemeSelect as HTMLSelectElement).addEventListener("change", () => {
    changeThemeColor((colorThemeSelect as HTMLSelectElement).value);
  });
}

function changeThemeColor(themeColor: string): void {
  document.documentElement.setAttribute("data-theme", themeColor);
  updateState("themeColor", themeColor);
}

function getDefaultThemeViaPrefersColorScheme(): string {
  if (
    globalThis.matchMedia &&
    globalThis.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    return "dark";
  }
  return "light";
}
