import { updateState } from 'state/url-state-manager'
export
{ initViewScalingSelect, switchViewScaling}
function initViewScalingSelect() {const selectOfViewScaling = document.getElementById('view-scaling')
selectOfViewScaling.addEventListener('change', () => {const viewScaling = selectOfViewScaling.value
updateState('viewScaling', viewScaling)
switchViewScaling(viewScaling)})}
function switchViewScaling(viewScaling) {const img = document.querySelector('img')
if (viewScaling == 'fit') {img.classList.add('fit-to-display-area')
img.classList.remove('actual-image-size')} else if (viewScaling == 'actual') {img.classList.add('actual-image-size')
img.classList.remove('fit-to-display-area')}}