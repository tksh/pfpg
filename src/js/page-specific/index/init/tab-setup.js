import { adjustOutputBoxSize } from 'init/adjust-output-boxes-size'

export function initTabs() {
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => openTab(event, tab.dataset.tab))
    })

    // Open the first tab when the page loads
    openTab(null, 'tab-1')

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress)
}

function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content")
    const tabLinks = document.getElementsByClassName("tab")
    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none"
    }
    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "")
    }
    document.getElementById(tabName).style.display = "block"
    if (evt) {
        evt.currentTarget.classList.add("active") // Add 'active' class to the clicked tab
    } else {
        // If no event, then it's the initial load, so manually set the first tab link as active
        document.querySelector('.tab').classList.add('active')
    }
    adjustOutputBoxSize('tabChanged')
}

function handleKeyPress(event) {

    // Altキーが押されていない場合は、処理を行わない
    if (!event.altKey) return

    const key = event.key.toLowerCase()
    const keyMap = {
        'h': 'tab-1',  // Alt + h
        'j': 'tab-2',  // Alt + j
        'k': 'tab-3',  // Alt + k
        'l': 'tab-4'   // Alt + l
    }

    if (key in keyMap) {
        event.preventDefault() // Prevent default key behavior
        const tabName = keyMap[key]
        const tab = document.querySelector(`[data-tab="${tabName}"]`)
        if (tab) {
            openTab({ currentTarget: tab }, tabName)
        }
    }
}