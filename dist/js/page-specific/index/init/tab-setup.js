export function initTabs() {const tabs = document.querySelectorAll('.tab')
tabs.forEach(tab => {tab.addEventListener('click', (event) => openTab(event, tab.dataset.tab))})
openTab(null, 'tab-1')
document.addEventListener('keydown', handleKeyPress)}
function openTab(evt, tabName) {const tabContent = document.getElementsByClassName("tab-content")
const tabLinks = document.getElementsByClassName("tab")
for (let i = 0; i < tabContent.length; i++) {tabContent[i].style.display = "none"}
for (let i = 0; i < tabLinks.length; i++) {tabLinks[i].className = tabLinks[i].className.replace(" active", "")}
document.getElementById(tabName).style.display = "block"
if (evt) {evt.currentTarget.classList.add("active")} else {document.querySelector('.tab').classList.add('active')}}
function handleKeyPress(event) {if (!event.altKey) return
const key = event.key.toLowerCase()
const keyMap = {'h': 'tab-1','j': 'tab-2','k': 'tab-3','l': 'tab-4'}
if (key in keyMap) {event.preventDefault()
const tabName = keyMap[key]
const tab = document.querySelector(`[data-tab="${tabName}"]`)
if (tab) {openTab({ currentTarget: tab }, tabName)}}}