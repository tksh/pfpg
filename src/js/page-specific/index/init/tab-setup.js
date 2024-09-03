export function initTabs() {
    const tabs = document.querySelectorAll('.tab')
    tabs.forEach(tab => {
        tab.addEventListener('click', (event) => openTab(event, tab.dataset.tab))
    })

    // Open the first tab when the page loads
    openTab(null, 'tab-1')
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
        console.log("document.querySelector('.tab'): ", document.querySelector('.tabLinks')) //null
        document.querySelector('.tab').classList.add('active')
    }
}
