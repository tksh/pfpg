function openTab(evt, tabName) {
    var i, tab-content, tablinks;
    tab-content = document.getElementsByClassName("tab-content");
    for (i = 0; i < tab-content.length; i++) {
        tab-content[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tab");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    if (evt) {
        evt.currentTarget.classList.add("active"); // Add 'active' class to the clicked tab
    } else {
        // If no event, then it's the initial load, so manually set the first tab link as active
        console.log("document.querySelector('.tab'): ", document.querySelector('.tablinks')) //null
        document.querySelector('.tab').classList.add('active');

    }
}

// Automatically open the first tab when the page loads
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContent loaded.')

    // Add the 'active' class to the first tab
    document.querySelector('.tab').classList.add('active');
    // <button class="tab active" data-tab="Tab1" onclick="openTab(event, 'Tab1')">

    // Open the first tab
    openTab(null, 'Tab1');
});
