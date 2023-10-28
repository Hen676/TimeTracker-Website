// Global Vars
/** Adds extra logging. */
const  debug = true;
const  debugFakeEmptyStorage = false;

// Stopwatch vars
let stopwatchRunning = false;
let stopwatchStartTime = 0;
let stopwatchElapsedTime = 0;
var worker;

/** Array of TimeTask's. */
let taskStorage = [];

// HTML Elements
let body = document.getElementById("body");

let taskFormForm = document.getElementById("createTimeTask");

let darkMode = document.getElementById("darkMode");
let darkModeIcon = document.getElementById("darkModeIcon");

let startA = document.getElementById("start");
let pauseA = document.getElementById("pause");
let restartA = document.getElementById("restart");

let submitA = document.getElementById("submit");
let stopWatchTimeP = document.getElementById("stopWatchTime");

let totalTimeP = document.getElementById("totalTime");
let totalTasksP = document.getElementById("totalTasks");
let taskListSection = document.getElementById("taskList");

// Stopwatch events and functions
startA.addEventListener("click", (e) => {
    if(!stopwatchRunning) {
        stopwatchRunning = true;
        stopwatchStartTime = Date.now() - stopwatchElapsedTime;
        worker = setInterval(updateTime, 75);
    }
});

pauseA.addEventListener("click", (e) => {
    if(stopwatchRunning) {
        stopwatchRunning = false;
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
        clearInterval(worker);
    }
});

restartA.addEventListener("click", (e) => {
    if(stopwatchRunning)
        stopwatchRunning = false;
    stopwatchStartTime = 0;
    stopwatchElapsedTime = 0;
    updateTime();
    clearInterval(worker);
});

darkMode.addEventListener("click", (e) => {
    body.classList.toggle("dark");

    var darkModeBool = body.classList.contains("dark");
    toggleDarkModeIcon(darkModeBool);

    if (isStorageAvailable)
        localStorage.setItem("dark", darkModeBool);
});



// Dark mode
var isStorageAvailable = typeof Storage !== "undefined";
if (isStorageAvailable) {
    if (localStorage.getItem("dark") === "true") {
        body.classList.add("dark");
        toggleDarkModeIcon();
    }
}
function toggleDarkModeIcon() {
    darkModeIcon.classList.toggle("fa-moon");
    darkModeIcon.classList.toggle("fa-sun");
}


function updateTime() {
    if(stopwatchRunning)
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
    stopWatchTimeP.innerHTML = formatTime(stopwatchElapsedTime);
}

// Task creation events
submitA.addEventListener("click", (e) => {
    if(debug)
        console.log(e);

    let taskTitle = document.getElementById("taskTitle");
    let tasks = document.getElementById("tasks");

    // Clean up values if needed
    if(tasks.value == "")
        tasks.value = 1;

    // Send alert anr return if stop watch is running or has never run.
    if(stopwatchRunning || stopwatchElapsedTime == 0) {
        alert("No time given, please give a time")
        return;
    }
    var timeTask;
    if(taskTitle.value == "") {
        timeTask = new TimeTask(
            "Default title", 
            parseInt(tasks.value), 
            parseInt(stopwatchElapsedTime), 
            new Date().getTime());
    } else {
        timeTask = new TimeTask(
            taskTitle.value, 
            parseInt(tasks.value), 
            parseInt(stopwatchElapsedTime), 
            new Date().getTime());
    }


    if(debug) {
        console.log(timeTask);
    }

    // Save to local storage
    taskStorage.push(timeTask);
    localStorage.Tasks = JSON.stringify(taskStorage);

    // Update totals
    updateTotals();

    stopwatchTimeTotal = 0;
    taskFormForm.reset();
});

/** Get TimeTasks from local storage. 
 * @returns {TimeTask[]} TimeTasks from local storage
*/
function getLocalStorageOrEmpty() {
    if(localStorage.Tasks == null)
        return [];
    var storage = JSON.parse(localStorage.Tasks);
    if(debug)
        console.log(storage);
    if(storage == null || debugFakeEmptyStorage)
        return [];
    return storage;
}

/** Convert milliseconds to hours, minutes and seconds.
 * @param {number} time - Time in milliseconds.
 * @returns {string} Time formatted into a string
 */
function formatTime(time) {
    function padAndFloor(unit) {
        return ('0' + Math.floor(unit)).slice(-2);
    }

    const seconds = padAndFloor((time / 1000) % 60);
    const minutes = padAndFloor((time / 1000 / 60) % 60);
    const hours = padAndFloor((time / 1000 / 60 / 60) % 24);

    return `${hours}:${minutes}:${seconds}`;
}

/** Update running totals. */
function updateTotals() {
    var currentDate = new Date().toDateString();
    var time = 0;
    var tasks = 0;
    taskStorage.forEach(element => {
        if(new Date(element.date).toDateString() == currentDate) {
            time += parseInt(element.time);
            tasks += parseInt(element.tasks)
        }
    });

    // Total tasks
    totalTasksP.innerText = tasks;
    totalTimeP.innerText = formatTime(time);
    if (debug) {
        console.log(`Total tasks: ${tasks}`);
        console.log(`Total time: ${time}`);
    }
    loadTasks();
}

function deleteTask(index) {
    if (debug)
        console.log("Deleting: " + index);

    taskStorage.splice(index, 1);
    localStorage.Tasks = JSON.stringify(taskStorage);

    loadTasks();
}

/** Initialize all data need for the website + fill in empty values. */
function load() {
    function compareFn(a, b) {
        if (a.date < b.date) {
            return -1;
        } else if (a.date > b.date) {
            return 1;
        }
        return 0;
    }


    taskStorage = getLocalStorageOrEmpty();
    updateTotals();

    taskStorage.sort(compareFn)

    // Display the last 10 tasks
    loadTasks();
}

function loadTasks() {
    taskListSection.innerHTML = taskStorage.map((element, index) => `
    <div class="task">
        <div class="top">
            <h1>${element.title}</h1>
            <p>${new Date(element.date).toDateString()}</p>
        </div>
        <ul class="iconList">
            <li class="tooltip">
                <a class="iconSimple" onclick="deleteTask(${index})">
                    <i class="fa-solid fa-xmark fa-xl"></i>
                </a>
                <span class="tooltipText">Delete</span>
            </li>
        </ul>
        <div class="bottom">
            <p>Time: ${formatTime(element.time)}</p>
            <p>Tasks: ${element.tasks}</p>
            <p>Time per task: ${formatTime(element.time / element.tasks)}</p>
        </div>
    </div>
    `).join('');
}

// Call load on window load
window.onload = load();