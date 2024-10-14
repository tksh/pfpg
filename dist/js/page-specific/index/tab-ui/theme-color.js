import { updateState } from 'state/url-state-manager'
export
{ changeThemeColor, initThemeColorSelect, getDefaultThemeViaPrefersColorScheme}
function initThemeColorSelect() {const colorThemeSelector = document.getElementById('theme-color')
colorThemeSelector.addEventListener('change', () => {const themeColor = colorThemeSelector.value
changeThemeColor(themeColor)})}
function changeThemeColor(themeColor) {document.documentElement.setAttribute('data-theme', themeColor)
document.documentElement.setAttribute('data-theme', themeColor)
updateState('themeColor', themeColor)}
function getDefaultThemeViaPrefersColorScheme() {if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {return 'dark'} else {return 'light'}}