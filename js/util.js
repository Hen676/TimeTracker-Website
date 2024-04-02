class TimeTask {
	/** Get TimeTasks from local storage.
	 * @param {string} title - Title of task.
	 * @param {number} tasks - Amount of tasks.
	 * @param {number} time - Time in milliseconds.
	 * @param {number} date - Date in milliseconds.
	 * */
	constructor(title, tasks, time, date) {
		this.title = title;
		this.tasks = tasks;
		this.time = time;
		this.date = date;
		this.id = getID();
	}
}

class Settings {
	/** Get Settings from local storage.
	 * @param {boolean} debug - Debug mode.
	 * @param {boolean} debugStorage - Fakes empty storage.
	 * @param {string} defaultTitle - Default task title.
	 * @param {number} defaultTasks - Default amount of tasks.
	 * */
	constructor(debug, debugStorage, defaultTitle, defaultTasks) {
		this.debug = debug;
		this.debugStorage = debugStorage;
		this.defaultTitle = defaultTitle;
		this.defaultTasks = defaultTasks;
	}
}

/**
 * Convert milliseconds to hours, minutes and seconds. [01:01:01]
 * @param {number} time - Time in milliseconds.
 * @returns {string} Time formatted into a string
 */
function formatTime(time) {
	// TODO:: Add cache on padAndFloor?
	function padAndFloor(unit) {
		return ("0" + Math.floor(unit)).slice(-2);
	}

	let seconds = padAndFloor((time / 1000) % 60);
	let minutes = padAndFloor((time / 1000 / 60) % 60);
	let hours = padAndFloor((time / 1000 / 60 / 60) % 24);
	return `${hours}:${minutes}:${seconds}`;
}

/**
 * Convert milliseconds to hours, minutes and seconds. [1h 1m 1s]
 * @param {number} time - Time in milliseconds.
 * @returns {string} Time formatted into a string
 */
function formatTimeForCopying(time) {
	if (time < 1000) return "0";

	let seconds = Math.floor((time / 1000) % 60);
	let minutes = Math.floor((time / 1000 / 60) % 60);
	let hours = Math.floor((time / 1000 / 60 / 60) % 24);

	var text = "";
	if (hours != 0) text += `${hours}h `;
	if (minutes != 0) text += `${minutes}m `;
	if (seconds != 0) text += `${seconds}s `;
	return text.slice(0, -1);
}

/*
    Local storage functions
*/

/**
 * Gets TimeTasks from local storage.
 * @returns {TimeTask[] | []} TimeTasks from local storage
 */
function getTasks() {
	if (localStorage.Tasks == null || settings.debugStorage) return [];
	return JSON.parse(localStorage.Tasks) ?? [];
}

function saveTasks() {
	localStorage.Tasks = JSON.stringify(taskStorage);
}

/**
 * Gets Settings from local storage.
 * @returns {Settings} Settings from local storage
 */
function getSettings() {
	if (localStorage.Settings == null) return defaultSettings();
	return JSON.parse(localStorage.Settings) ?? defaultSettings();
}

/**
 * Gets default Settings
 * @returns {Settings}
 */
function defaultSettings() {
	return new Settings(false, false, "Default Title", 1);
}

function saveSettings() {
	localStorage.Settings = JSON.stringify(settings);
}

function showSettings() {
	document.getElementById("defaultTaskTitle").value = settings.defaultTitle;
	document.getElementById("defaultTasks").value = settings.defaultTasks;
	document.getElementById("debug").checked = settings.debug;
	document.getElementById("debugStorage").checked = settings.debugStorage;
}

function getID() {
	let uuid = self.crypto.randomUUID();
	while (taskStorage.find((timeTask) => timeTask.id == uuid) != undefined)
		uuid = self.crypto.randomUUID();
	return uuid;
}
