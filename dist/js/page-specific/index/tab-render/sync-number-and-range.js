export
{ syncWidthNum, adjustWidthNum}
function syncWidthNum(element) {const id = element.id
const value = element.value
const targetId = id === "png-size-number" ? "png-size-range" : "png-size-number"
const target = document.getElementById(targetId)
target.value = value}
function adjustWidthNum(step) {const rangeInput = document.getElementById("png-size-range")
const numberInput = document.getElementById("png-size-number")
const currentValue = parseInt(rangeInput.value, 10)
const newValue = currentValue + (step * rangeInput.step)
if (newValue >= rangeInput.min && newValue <= rangeInput.max) {rangeInput.value = newValue
numberInput.value = newValue
syncWidthNum(rangeInput)
return newValue}
return null}