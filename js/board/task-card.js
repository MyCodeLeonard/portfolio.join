import { db } from '../firebase/firebase-init.js';
import { ref, onValue, get, update, remove, off } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

export const tasksRef = ref(db, 'tasks/');

let draggedTask;

/**
 * This variable stores the Firebase Realtime Database snapshot
 * @type {function} -DataSnapshot
 */
export let loadTasksSnapshort = (snapshot) => {
  clearColumns();
  let tasks = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data }));
  tasks.forEach(task => completeTaskBox(task));
  setupDragAndDrop();
}

/**
 * Loads all tasks from the database and renders them into their board columns.
 */
export function loadTasks() {
  onValue(tasksRef, loadTasksSnapshort);
}

/**
 * Clears all board columns before re-rendering tasks.
 */
function clearColumns() {
  document.getElementById('to-do-tasks').innerHTML = "";
  document.getElementById('in-progress-tasks').innerHTML = "";
  document.getElementById('await-tasks').innerHTML = "";
  document.getElementById('done-tasks').innerHTML = "";
}

/**
 * This function creates the task-box and passes the values.
 * @param {object} task -The task object to render.
 */
function completeTaskBox(task){
  let taskBox = createTaskBox(task);
  createLabel(task, taskBox);
  createTitle(task, taskBox);
  createDescription(task, taskBox);
  let progressBarConter = createProgressBarConter(taskBox);
  let progressBarDiv = createProgressBarDiv(progressBarConter);
  let progressBar = createprogressBar(task, progressBarDiv);
  createTaskConter(task, progressBar, progressBarConter);
  let assignedInitialsPriority = createAssignedInitialsPriority(taskBox);
  let assignedInitials = createAssignedInitials(assignedInitialsPriority);
  createAssignedToIfExists(task, assignedInitials);
  createPrioityImg(task, assignedInitialsPriority);
  appendByTaskStatus(task, taskBox);
}

/**
 * This function creates the task-box (div Element)
 * @param {object} task -The task object to render.
 * @returns {HTMLDivElement} The created div element.
 */
function createTaskBox(task){
  let taskBox = document.createElement('div');
  taskBox.classList.add("task-card");
  taskBox.setAttribute("draggable", "true");
  taskBox.dataset.taskId = task.id;
  return taskBox
}

/**
 * This function creates the label (div Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 */
function createLabel(task, taskBox){
  let label = document.createElement('div');
  label.classList.add("task-label");
  label.textContent = task.category;
  if(task.category == "User Story") label.style.backgroundColor ="rgb(0, 56, 255)";
  else label.style.backgroundColor ="rgb(0, 199, 163)";
  taskBox.append(label);
}

/**
 * This function creates the title (h4 Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 */
function createTitle(task, taskBox){
  let title = document.createElement('h4');
  title.classList.add("task-title");
  title.textContent = task.title;
  taskBox.append(title);
}

/**
 * This function creates the description (p Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 */
function createDescription(task, taskBox){
  let description = document.createElement('p');
  description.classList.add("task-desc");
  description.textContent = task.description;
  taskBox.append(description);
}

/**
 * This function creates the progressBarConter (div Element)
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 * @returns {HTMLDivElement} The created progressBarConter (div) element.
 */
function createProgressBarConter(taskBox){
  let progressBarConter = document.createElement('div');
  progressBarConter.classList.add('progress-bar-task-conter-div');
  taskBox.append(progressBarConter);
  return progressBarConter
}

/**
 * This function creates the progressBarDiv (div Element)
 * @param {HTMLDivElement} progressBarConter -Passes the progressBarConter (div) element.
 * @returns {HTMLDivElement} The created progressBarDiv (div) element.
 */
function createProgressBarDiv(progressBarConter){
  let progressBarDiv = document.createElement('div');
  progressBarDiv.classList.add('progress-bar-container');
  progressBarConter.append(progressBarDiv);
  return progressBarDiv
}

/**
 * This function creates the progressBar (div Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} progressBarDiv -Passes the progressBarDiv (div) element.
 * @returns {HTMLDivElement} The created progressBar (div) element.
 */
function createprogressBar(task, progressBarDiv){
  let progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar');
  if(task.subtasks?.length >0) progressBar.style.display = 'block';
  else progressBar.style.display = 'none';
  progressBarDiv.append(progressBar);
  return progressBar
}

/**
 * This function creates the taskConter (div Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} progressBar -Passes the progressBar (div) element.
 * @param {HTMLDivElement} progressBarConter -Passes the progressBarConter (div) element.
 * @returns {HTMLDivElement} The created taskConter (div) element.
 */
function createTaskConter(task, progressBar, progressBarConter){
  let counter = 0;
  let taskConter = document.createElement('div');
  taskConter.classList.add('task-count');
  task.subtasks?.forEach(subtask => {
    if(subtask.checked == true) counter++;
  });
  taskConter.textContent = task.subtasks?.length ? counter + "/" + task.subtasks?.length : "";
  progressBar.style.width = new Intl.NumberFormat("en-US", { style: "percent" }).format(counter / task.subtasks?.length);
  progressBarConter.append(taskConter);
  return taskConter
}

/**
 * This function creates the assignedInitialsPriority (div Element)
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 * @returns {HTMLDivElement} The created assignedInitialsPriority (div) element.
 */
function createAssignedInitialsPriority(taskBox){
  let assignedInitialsPriority = document.createElement('div');
  assignedInitialsPriority.classList.add('assigned-initials_priority-div');
  taskBox.append(assignedInitialsPriority);
  return assignedInitialsPriority
}

/**
 * This function creates the assignedInitials (div Element)
 * @param {HTMLDivElement} assignedInitialsPriority -Passes the assignedInitialsPriority (div) element.
 * @returns {HTMLDivElement} The created assignedInitials (div) element.
 */
function createAssignedInitials(assignedInitialsPriority){
  let assignedInitials = document.createElement('div');
  assignedInitials.classList.add('assigned-initials', 'assigned-initials-board');
  assignedInitialsPriority.append(assignedInitials);
  return assignedInitials;
}

/**
 * This function creates the assignedInitials to if exists (span Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} assignedInitials -Passes the assignedInitials (div) element.
 */
function createAssignedToIfExists(task, assignedInitials){
  if(task.assignedTo){
    let iconConter =0;

    task.assignedTo.forEach((contactId, index) => {
      if(iconConter > 4) return
      get(ref(db, `contacts/${contactId}`)).then((snapshot) => {
        if (snapshot.exists()) iconConter = existsContactSnapshot(task, assignedInitials, snapshot, iconConter); 
        else noExistsContactSnapshot(task, index);
      })
      .catch((error) => console.error(error));
    });
  }
}

/**
 * This function executes either "underThreeAssignedTo" or "overThreeAssignedTo",
 * depending on the value of the "iconConter" parameter.
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} assignedInitials -Passes the assignedInitials (div) element.
 * @param {object} snapshot -Passes the snapshot
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
 */
function existsContactSnapshot(task, assignedInitials, snapshot, iconConter){
  let contact = snapshot.val();
  
  if(iconConter <= 2) iconConter = underThreeAssignedTo(contact, assignedInitials, iconConter);
  else if(iconConter == 3) iconConter = overThreeAssignedTo(task, assignedInitials, iconConter);
  return iconConter;
}

/**
 * This function creates the icon (initials) (span Element)
 * @param {object} contact -The contact object to render.
 * @param {HTMLDivElement} assignedInitials -Passes the assignedInitials (div) element.
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
 */
function underThreeAssignedTo(contact, assignedInitials, iconConter){
  let icon = document.createElement('span'); 
  icon.classList.add('initials-task');
  icon.style.backgroundColor = contact.iconBackgroundColor;
  icon.textContent = contact.initials;
  assignedInitials.append(icon);
  iconConter++;
  
  let iconstoArray =[];
  iconstoArray = Array.from(assignedInitials.children);
  iconstoArray.sort((a, b) => a.textContent.localeCompare(b.textContent));
  iconstoArray.forEach(icon => assignedInitials.appendChild(icon));
  return iconConter
}

/**
 * This function creates the icon (After the third icon) (span Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} assignedInitials -Passes the assignedInitials (div) element.
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
 */
function overThreeAssignedTo(task, assignedInitials, iconConter){
  let icon = document.createElement('span'); 
  icon.classList.add('initials-task', 'initials-extra');
  icon.style.backgroundColor = 'rgb(135, 135, 135)';
  icon.textContent = `+${task.assignedTo.length - 3}`;
  assignedInitials.append(icon);
  iconConter++;
  return iconConter
}

/**
 * This function removes the contact ID in tasks if it is not present in "contacts".
 * @param {object} task -The task object to render.
 * @param {number} index -The index that references the non-existent ID.
 */
function noExistsContactSnapshot(task, index){
  off(tasksRef, "value", loadTasksSnapshort);
  remove(ref(db, `tasks/${task.id}/assignedTo/${index}`)).then(() => {
    onValue(tasksRef, loadTasksSnapshort);
  })
  .catch(error => {
    console.error(error);
  });
}

/**
 * This function creates the priorityImg (img Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} assignedInitialsPriority -Passes the assignedInitialsPriority (div) element.
 */
function createPrioityImg(task, assignedInitialsPriority){
  let priorityImg = document.createElement('img');
  priorityImg.classList.add('priority-img');
  priorityImg.alt = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  priorityImg.src = `assets/img/${task.priority}-btn-icon.png`;
  assignedInitialsPriority.append(priorityImg);
}

/**
 * This function sorts the taskBoxs into the correct columns.
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} taskBox -Passes the taskBox (div) element.
 */
function appendByTaskStatus(task, taskBox){
  if(task.status == "to-do") document.getElementById('to-do-tasks').append(taskBox);
  if(task.status == "in-progress") document.getElementById('in-progress-tasks').append(taskBox);
  if(task.status == "await-feedback") document.getElementById('await-tasks').append(taskBox);
  if(task.status == "done") document.getElementById('done-tasks').append(taskBox);
}

/**
 * Sets up drag and drop events for tasks and columns.
 */
function setupDragAndDrop() {
  draggedTask = null;
  setupTaskCardDrags();
  setupTaskColumnDrops();
}

/**
 * Enables dragging on all task cards.
 */
function setupTaskCardDrags() {
  document.querySelectorAll('.task-card').forEach(task => {
    task.addEventListener('dragstart', e => {
      draggedTask = e.target;
      e.dataTransfer.effectAllowed = 'move';
    });
  });
}

/**
 * Sets up drop zones on columns for drag and drop.
 */
function setupTaskColumnDrops() {
  document.querySelectorAll('.task-column').forEach(column => {
    column.addEventListener('dragover', e => handleDragOver(e));
    column.addEventListener('drop', e => handleDrop(e, column));
  });
}

/**
 * Handles drag over event to allow dropping.
 * @param {Event} e - The dragover event.
 */
function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

/**
 * Handles drop event: moves task and updates status in database.
 * @param {Event} e - The drop event.
 * @param {HTMLElement} column - The target column element.
 */
function handleDrop(e, column) {
  e.preventDefault();
  if (!draggedTask) return;
  const newStatus = getStatusFromColumn(column);
  updateTaskStatus(draggedTask.dataset.taskId, newStatus);
  draggedTask=null;
}

/**
 * Returns new status string based on column class.
 * @param {HTMLElement} column - The column element.
 * @returns {string|null} The status string or null if invalid.
 */
function getStatusFromColumn(column) {
  if (column.id == 'to-do-tasks') return 'to-do';
  if (column.id == 'in-progress-tasks') return 'in-progress';
  if (column.id == 'await-tasks') return 'await-feedback';
  if (column.id == 'done-tasks') return 'done';
  return null;
}

/**
 * Updates the task status in Firebase.
 * @param {string} taskId - The ID of the task to update.
 * @param {string} newStatus - The new status for the task.
 */
function updateTaskStatus(taskId, newStatus) {
  if (!taskId || !newStatus) return;
  off(tasksRef, "value", loadTasksSnapshort);
  const updates = {};
  updates['/tasks/' + taskId + '/status'] = newStatus;
  update(ref(db), updates)
  .then(() => {
    onValue(tasksRef, loadTasksSnapshort);
  })
  .catch(error => {
    console.error(error);
  });
}