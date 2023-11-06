/** @type {boolean} */
let stopwatchRunning = false;
/** @type {Number} */
let stopwatchStartTime = 0;
/** @type {number} */
let stopwatchElapsedTime = 0;
/** Worker for the stopwatch. @type {number} */
var workerId;

/** @type {Settings} */
let settings = getSettings();
/** @type  {TimeTask[]} */
let taskStorage = getTasks();

// Check storage and settings
if (settings.debug) {
    console.log(taskStorage);
    console.log(settings);
}

// HTML Elements
/** @type  {HTMLFormElement} */
let taskFormForm = document.getElementById("createTimeTask");
/** @type  {HTMLLinkElement} */
let submitA = document.getElementById("submit");
/** @type  {HTMLParagraphElement} */
let stopWatchTimeP = document.getElementById("stopWatchTime");
/** @type  {HTMLParagraphElement} */
let totalTimeP = document.getElementById("totalTime");
/** @type  {HTMLParagraphElement} */
let totalTasksP = document.getElementById("totalTasks");
/** @type  {HTMLElement} */
let taskListSection = document.getElementById("taskList");
/** @type  {HTMLElement} */
let settingsAside = document.getElementById("settings");

/*
    Stopwatch
*/
function updateTime() {
    if(stopwatchRunning) 
        stopwatchElapsedTime = Date.now() - stopwatchStartTime;
    stopWatchTimeP.innerHTML = formatTime(stopwatchElapsedTime);
}

/** 
 * Stopwatch cannot be running while editing the time.
 * Min time of 0.
 * Max time of 23:59:59.
 * @param {number} time - Time in milliseconds.
 */
function changeTimeInMilliseconds(time) {
    if (stopwatchRunning) return;
    stopwatchElapsedTime += time;
    if (stopwatchElapsedTime < 0) 
        stopwatchElapsedTime = 0;
    else if (stopwatchElapsedTime > 86_399_999) 
        stopwatchElapsedTime = 86_399_999;
    stopWatchTimeP.innerHTML = formatTime(stopwatchElapsedTime);
}


/** Update running totals and show today's tasks */
function updateTotalsAndShowTasks() {
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
    showTasks();
}

function deleteTask(index) {
    if (settings.debug) console.log("Deleting: " + index);
    taskStorage.splice(index, 1);
    localStorage.Tasks = JSON.stringify(taskStorage);
    updateTotalsAndShowTasks();
}

/**
 * Adds click event that toggles "visible" class
 * @param {HTMLElement} element 
 */
function addEventListenerToggleSettings(element) {
    if (element != null)
        element.addEventListener("click", () => toggleVisibleClass());
}

function toggleVisibleClass() {
    settingsAside.classList.toggle("visible");
}

function showTasks() {
    taskStorage.sort((a, b) => {
        if (a.date > b.date) return -1;
        else if (a.date < b.date) return 1;
        return 0;
    });

    taskListSection.innerHTML = getTodaysTasks().map((element, index) => `
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

function getTodaysTasks() {
    var currentDate = new Date().toDateString();
    return taskStorage.filter(element => {
        return new Date(element.date).toDateString() == currentDate;
    });
}

/** 
 *  Initialize all data need for the website + fill in empty values.
 *  Also initializes all events.
 */
function load() {
    // Register stopwatch events
    document.getElementById("start").addEventListener("click", () => {
        if(!stopwatchRunning) {
            stopwatchRunning = true;
            stopwatchStartTime = Date.now() - stopwatchElapsedTime;
            workerId = setInterval(updateTime, 75);
        }
    });
    document.getElementById("pause").addEventListener("click", () => {
        if(stopwatchRunning) {
            stopwatchRunning = false;
            stopwatchElapsedTime = Date.now() - stopwatchStartTime;
            clearInterval(workerId);
        }
    });
    document.getElementById("restart").addEventListener("click", () => {
        if(stopwatchRunning)
            stopwatchRunning = false;
        stopwatchStartTime = 0;
        stopwatchElapsedTime = 0;
        updateTime();
        clearInterval(workerId);
    });

    // Register task submit button
    document.getElementById("submit").addEventListener("click", () => {
        let taskTitle = document.getElementById("taskTitle");
        let tasks = document.getElementById("tasks");

        // Send alert anr return if stop watch is running or has never run.
        if(stopwatchRunning || stopwatchElapsedTime == 0) {
            alert("No time given, please give a time")
            return;
        }
        var timeTask;
        if(taskTitle.value == "") {
            timeTask = new TimeTask(
                settings.defaultTitle, 
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
        if(settings.debug) console.log(timeTask);
        // Save to local storage
        taskStorage.push(timeTask);
        localStorage.Tasks = JSON.stringify(taskStorage);
        // Update totals
        updateTotalsAndShowTasks();
        stopwatchTimeTotal = 0;
        taskFormForm.reset();
        tasks.value = settings.defaultTasks;
    });

    // Register settings buttons
    addEventListenerToggleSettings(document.getElementById("settingsToggle"));
    addEventListenerToggleSettings(document.getElementById("closeSettings"));
    // Esc key opens settings
    window.onkeydown = function (event) {
        if (event.keyCode == 27) toggleVisibleClass();
    };

    document.getElementById("saveSettings").addEventListener("click", () => {
        settings.defaultTitle = document.getElementById("defaultTaskTitle").value;
        settings.defaultTasks = parseInt(document.getElementById("defaultTasks").value);
        settings.debug = document.getElementById("debug").checked;
        settings.debugStorage = document.getElementById("debugStorage").checked;
        saveSettings();
    });

    document.getElementById("resetSettings").addEventListener("click", () => {
        settings = defaultSettings();
        saveSettings();
        showSettings();
    });

    let tasks = document.getElementById("tasks");
    tasks.value = settings.defaultTasks;

    // Update totals and show tasks
    updateTotalsAndShowTasks();
    // Show settings
    showSettings();
}

// Call load on window load
window.onload = load();