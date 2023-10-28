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
    }
}