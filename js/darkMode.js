/**
 * Dark mode file
 */
var body = document.getElementById("body");
var darkModeIcon = document.getElementById("darkModeIcon");
var isStorageAvailable = typeof Storage !== "undefined";

darkModeLoad();

// Dark mode
function darkModeLoad() {
    let darkModeA = document.getElementById("darkMode");
    if (isStorageAvailable) {
        if (localStorage.getItem("dark") === "true") {
            body.classList.add("dark");
            toggleDarkModeIcon();
        }
    }
    darkModeA.addEventListener("click", (e) => {
        body.classList.toggle("dark");
    
        var darkModeBool = body.classList.contains("dark");
        toggleDarkModeIcon(darkModeBool);
    
        if (isStorageAvailable)
            localStorage.setItem("dark", darkModeBool);
    });
}

function toggleDarkModeIcon() {
    darkModeIcon.classList.toggle("fa-moon");
    darkModeIcon.classList.toggle("fa-sun");
}