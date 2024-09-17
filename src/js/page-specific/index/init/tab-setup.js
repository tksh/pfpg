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
}

function handleKeyPress(event) {
    const key = event.key.toLowerCase()
    const keyMap = {
        'l': 'tab-1',
        'c': 'tab-2',
        'r': 'tab-3',
        'u': 'tab-4'
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