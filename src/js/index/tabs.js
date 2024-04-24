function openTab(evt, tabName) {
    const tabContent = document.getElementsByClassName("tab-content");
    const tabLinks = document.getElementsByClassName("tab");

    for (let i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";

    if (evt) {
        evt.currentTarget.classList.add("active"); // Add 'active' class to the clicked tab
    } else {
        // If no event, then it's the initial load, so manually set the first tab link as active
        console.log("document.querySelector('.tab'): ", document.querySelector('.tabLinks')) //null
        document.querySelector('.tab').classList.add('active');
    }
}

// Automatically open the first tab when the page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContent loaded.')

    // Add the 'active' class to the first tab
    document.querySelector('.tab').classList.add('active');

    // Open the first tab
    openTab(null, 'tab-1');
});
