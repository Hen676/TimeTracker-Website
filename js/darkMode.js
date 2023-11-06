/**
 * Dark mode file
 * 
 * Javascript needed to switch between light and dark modes.
 */

/** @type {HTMLElement} */
var body = document.getElementById("body");
/** @type {HTMLElement} */
var darkModeIcon = document.getElementById("darkModeIcon");
/** @type {boolean} */
var isStorageAvailable = typeof Storage !== "undefined";

// Dark mode
function darkModeLoad() {
    let darkModeA = document.getElementById("darkMode");
    if (isStorageAvailable) {
        if (localStorage.getItem("dark") === "true") {
            body.classList.add("dark");
            toggleDarkModeIcon();
        }
    }
    darkModeA.addEventListener("click", () => {
        body.classList.toggle("dark");
    
        var darkModeBool = body.classList.contains("dark");
        toggleDarkModeIcon();
        if (isStorageAvailable)
            localStorage.setItem("dark", darkModeBool);
    });
}

function toggleDarkModeIcon() {
    darkModeIcon.classList.toggle("fa-moon");
    darkModeIcon.classList.toggle("fa-sun");
}


// Call load on window load
window.onload = darkModeLoad();