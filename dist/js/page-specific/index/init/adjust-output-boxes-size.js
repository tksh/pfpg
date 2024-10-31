export async function initLayout() {await adjustOutputBoxSize()}
async function adjustOutputBoxSize() {const windowInnerHeight = window.innerHeight
const bodyElem = document.querySelector('body')
const bodyRect = bodyElem.getBoundingClientRect()
const headerElem = document.querySelector('header')
const headerRect = headerElem.getBoundingClientRect()
const mainElem = document.querySelector('main')
const mainRect = mainElem.getBoundingClientRect()
const imgBoxElem = document.getElementById('img-box')
const imgBoxRect = imgBoxElem.getBoundingClientRect()
const textareaBoxElem = document.getElementById('textarea-box')
const textareaBoxRect = textareaBoxElem.getBoundingClientRect()
const headerAndMainHeight = headerRect.height + mainRect.height
const diffHeight = Math.round(window.innerHeight - headerAndMainHeight)
const imgBoxHeightNew = Math.round(imgBoxRect.height + diffHeight)
if (window.innerWidth > 512
&& window.innerHeight >= 720) {if (imgBoxHeightNew < imgBoxRect.width) {imgBoxElem.style.height = imgBoxHeightNew + "px"
imgBoxElem.style.width = imgBoxHeightNew + "px"
textareaBoxElem.style.height = imgBoxHeightNew + "px"
textareaBoxElem.style.width = imgBoxHeightNew + "px"}} else {}}