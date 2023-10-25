// Global Vars
/** Adds extra logging. */
const  debug = true;
/** Debug fakes the local storage to be empty. */
const  debugFakeEmptyStorage = false;
/** Is the stop watch running. */
let stopwatchRunning = false;
/** Time value in milliseconds. */
let stopwatchTime;
/** Array of TimeTask's. */
let taskStorage = [];

// HTML Elements
let taskForm = document.getElementById("createTimeTask");
let stopwatch = document.getElementById("stopwatch");
let totalTime = document.getElementById("totalTime");
let totalTasks = document.getElementById("totalTasks");
let taskList = document.getElementById("taskList");

stopwatch.addEventListener("click", (e) => {
    if(stopwatchRunning) {
        stopwatchTime = new Date().getTime() - stopwatchTime;
        stopwatch.value = "Restart"
    }
    else {
        stopwatchTime = new Date().getTime();
        stopwatch.value = "Stop"
    }
    stopwatchRunning = !stopwatchRunning;
});

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if(debug)
        console.log(e);

    let taskTitle = document.getElementById("taskTitle");
    let tasks = document.getElementById("tasks");

    // Clean up values if needed
    if(tasks.value == "")
        tasks.value = 1;

    // Send alert anr return if stop watch is running or has never run.
    if(stopwatchRunning || stopwatchTime == null) {
        alert("No time given, please give a time")
        return;
    }
    var timeTask;
    if(taskTitle.value == "")
        timeTask = new TimeTask("Default title", parseInt(tasks.value), parseInt(stopwatchTime), new Date().toDateString());
    else
        timeTask = new TimeTask(taskTitle.value, parseInt(tasks.value), parseInt(stopwatchTime), new Date().toDateString());


    if(debug)
        console.log(timeTask);

    // Save to local storage
    taskStorage.push(timeTask);
    localStorage.Tasks = JSON.stringify(taskStorage);

    // Update totals
    updateTotals();

    stopwatch.value = "Start";
    stopwatchTime = 0;
    taskForm.reset();
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
    const seconds = Math.floor((time / 1000) % 60);
    const minutes = Math.floor((time / 1000 / 60) % 60);
    const hours = Math.floor((time / 1000 / 60 / 60) % 24);

    if(hours == 0 && minutes == 0)
        return seconds.toString() + "s";
    if(hours == 0)
        return [minutes.toString() + "m",seconds.toString() + "s"].join(" ");
    return [hours.toString() + "h",minutes.toString() + "m",seconds.toString() + "s"].join(" ");
}

/** Update running totals. */
function updateTotals() {
    var currentDate = new Date().toDateString();
    var time = 0;
    var tasks = 0;

    taskStorage.forEach(element => {
        if(element.date == currentDate) {
            time += parseInt(element.time);
            tasks += parseInt(element.tasks)
        }
        if(debug) {
            console.log(element.date == currentDate)
        }
    });

    // Total tasks
    totalTasks.innerText = tasks;
    totalTime.innerText = formatTime(time);
}

/** Initialize all data need for the website + fill in empty values. */
function load() {
    taskStorage = getLocalStorageOrEmpty();
    updateTotals();

    // Display the last 10 tasks
    taskList.innerHTML = taskStorage.reverse().slice(0, 10).map(i => `
    <div class="task">
        <p>${i.title}</p>
        <p>Date: ${i.date}</p>
        <p>Time taken: ${formatTime(i.time)}</p>
        <p>Tasks: ${i.tasks}</p>
        <p>Time taken per task: ${formatTime(i.time / i.tasks)}</p>
    </div>
    `).join('');
}

// Call load on window load
window.onload = load();