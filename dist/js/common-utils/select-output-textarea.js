export
{ isOnDataManipulatorPage, selectOutputTextareaId}
function isOnDataManipulatorPage() {const url = window.location.href
const target = 'data-manipulator'
return url.includes(target)}
function selectOutputTextareaId(isRelative, isDataManipulatorPage) {if (isDataManipulatorPage === true) {if (isRelative === true) {return 'textarea-decoded-svg-as-rel'} else if (isRelative === false) {return 'textarea-decoded-svg-as-abs'}} else if (isDataManipulatorPage === false) {return 'svg-string'}}