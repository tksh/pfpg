import { getSvgString } from 'button/download-as-file'
export
{ copyPngToClipboard, copySvgToClipboard}
async function copyPngToClipboard() {try {const imgElem = document.getElementById('img');
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = imgElem.naturalWidth;
canvas.height = imgElem.naturalHeight;
ctx.drawImage(imgElem, 0, 0);
canvas.toBlob(async (blob) => {await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
const pngActionButtonElement = document.getElementById("png-action-button");
const originalText = pngActionButtonElement.innerHTML;
pngActionButtonElement.textContent = '✔️ Successfully copied!';
pngActionButtonElement.classList.add('success-message');
setTimeout(() => {pngActionButtonElement.innerHTML = originalText;
pngActionButtonElement.classList.remove('success-message');}, 1500);});} catch (error) {console.error("Failed to copy PNG image: ", error);}}
async function copySvgToClipboard() {try {await navigator.clipboard.writeText(getSvgString());
const svgActionButtonElement = document.getElementById("svg-action-button")
const originalHtml = svgActionButtonElement.innerHTML
svgActionButtonElement.textContent = '✔️ Successfully copied!'
svgActionButtonElement.classList.add('success-message');
setTimeout(() => {svgActionButtonElement.innerHTML = originalHtml
svgActionButtonElement.classList.remove('success-message')}, 1500)} catch (error) {console.error("Failed to copy SVG text: ", error);}}