import { db } from '../firebase/firebase-init.js';
import { ref, onValue, get, update, remove, off } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { loadTasksSnapshort, tasksRef } from "./task-card.js";
import { addEventListenerDelete } from "./task-edit-delete.js"

export let taskRef;

/**
 * This variable stores the Firebase Realtime Database snapshot
 * @type {function} -DataSnapshot
 */
export let loadTaskSnapshort = (snapshot) => {
    let task = snapshot.val();
    task.id = snapshot.key;
    
    passCategoryToDetails(task);
    passTitleToDetails(task);
    passDescriptionToDetails(task);
    passDueDateToDetails(task);
    passPriorityToDetails(task);
    createPassInitialsToDetails(task);
    createPassSubtasksToDetails(task);
}

/**
 * Sets up click event listener for task cards to open the overlay.
 */
export function initTaskDetailsOverlay(){
    document.addEventListener("click", onTaskCardClick);
}

/**
 * Handles click on a task card to open its overlay.
 * @param {Event} e - The click event.
 */
function onTaskCardClick(e) {
  const card = e.target.closest(".task-card");
  if (card) openTaskOverlay(card.dataset.taskId);
}

/**
 * Opens the overlay and fills its content for a given task.
 * @param {string} taskId - The ID of the task.
 */
function openTaskOverlay(taskId) {
  showTaskOverlay();
  const card = document.querySelector(`.task-card[data-task-id="${taskId}"]`);
  if (!card) return;
  taskRef = ref(db, `tasks/${taskId}`);
  onValue(taskRef, loadTaskSnapshort);
  addEventListenerClose();
  addEventListenerDelete(taskId);
}

/**
 * Shows the task overlay details and disables body scroll.
 */
function showTaskOverlay() {
  document.getElementById("task-overlay").classList.remove("d-none");
  document.getElementById("body").classList.add('overflow-hidden');
}

/**
 * This function sets the eventListener to close the details overlay
 */
function addEventListenerClose(){
    document.getElementById('overlay-content').addEventListener('click', (event) => event.stopPropagation());
    document.getElementById('overlay-close').addEventListener("click", closeOverlay);
    document.getElementById('task-overlay').addEventListener('click', closeOverlay);
}

/**
 * Closes the task overlay and re-enables body scroll and reset the event listener.
 */
export function closeOverlay() {
  document.getElementById("task-overlay").classList.add("d-none");
  document.getElementById("body").classList.remove('overflow-hidden');
  off(taskRef, 'value', loadTaskSnapshort);

  const oldElement = document.getElementById('edit-task-btn');
  const newElement = oldElement.cloneNode(true);
  oldElement.replaceWith(newElement);
}

/**
 * This function passes the category to the details overlay.
 * @param {object} task -The task object to render.
 */
function passCategoryToDetails(task){
    let categorydiv = document.getElementById('category-value');
    categorydiv.textContent = task.category;
    categorydiv.style.backgroundColor = task.category == 'Technical Task' ? 'rgb(0, 199, 163)' : 'rgb(0, 56, 255)';
}

/**
 * This function passes the title to the details overlay.
 * @param {object} task -The task object to render.
 */
function passTitleToDetails(task){
    let titleH2 = document.getElementById('title-value');
    titleH2.textContent = task.title;
}

/**
 * This function passes the description to the details overlay.
 * @param {object} task -The task object to render.
 */
function passDescriptionToDetails(task){
    let descriptionDiv = document.getElementById('description-value');
    descriptionDiv.textContent = task.description;
}

/**
 * This function passes the dueDate to the details overlay.
 * @param {object} task -The task object to render.
 */
function passDueDateToDetails(task){
    let dueDateSpan = document.getElementById('due-date-value');
    dueDateSpan.textContent = task.dueDate.split("-").reverse().join("/");
}

/**
 * This function passes the priority (text and image) to the details overlay.
 * @param {object} task -The task object to render.
 */
function passPriorityToDetails(task){
    let prioritySpan = document.getElementById('priority-value');
    prioritySpan.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    let priorityImg = document.getElementById('priority-icon')
    priorityImg.src = `assets/img/${task.priority}-btn-icon.png`;
}

/**
 * This function create and passes the initials to the details overlay.
 * @param {object} task -The task object to render.
 */
function createPassInitialsToDetails(task){
    let initialsDiv = document.getElementById('initial-group');
    createAssignedToIfExists(task, initialsDiv);
}

/**
 * This function creates the assignedInitials to if exists
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
*/
function createAssignedToIfExists(task, initialsDiv){
    if(task.assignedTo)assignedToExists(task, initialsDiv);
    else assignedToExistsNot(initialsDiv);
}

/**
 * This function creates the assignedInitials (span Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
*/
function assignedToExists(task, initialsDiv){
    let iconConter =0;
    initialsDiv.replaceChildren();
    
    task.assignedTo.forEach((contactId, index) => {
        if(iconConter > 4) return
        get(ref(db, `contacts/${contactId}`)).then((snapshot) => {
            if (snapshot.exists()) iconConter = existsContactSnapshot(task, initialsDiv, snapshot, iconConter); 
            else noExistsContactSnapshot(task, index);
        })
        .catch((error) => console.error(error));
    });
}

/**
 * This function executes either "underThreeAssignedTo" or "overThreeAssignedTo",
 * depending on the value of the "iconConter" parameter.
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
 * @param {object} snapshot -Passes the snapshot
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
*/
function existsContactSnapshot(task, initialsDiv, snapshot, iconConter){
    let contact = snapshot.val();
    if(iconConter <= 2) iconConter = underThreeAssignedTo(contact, initialsDiv, iconConter);
    else if(iconConter == 3) iconConter = overThreeAssignedTo(task, initialsDiv, iconConter);
    return iconConter;
}

/**
 * This function creates the icon (initials) (span Element)
 * @param {object} contact -The contact object to render.
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
*/
function underThreeAssignedTo(contact, initialsDiv, iconConter){
    let icon = document.createElement('span'); 
    icon.classList.add('initials-task');
    icon.style.backgroundColor = contact.iconBackgroundColor;
    icon.textContent = contact.initials;
    initialsDiv.append(icon);
    iconConter++;
    
    let iconstoArray =[];
    iconstoArray = Array.from(initialsDiv.children);
    iconstoArray.sort((a, b) => a.textContent.localeCompare(b.textContent));
    iconstoArray.forEach(icon => initialsDiv.appendChild(icon));
    return iconConter
}

/**
 * This function creates the icon (After the third icon) (span Element)
 * @param {object} task -The task object to render.
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
 * @param {number} iconConter -Passes the iconConter
 * @returns {number} returns the iconConter
*/
function overThreeAssignedTo(task, initialsDiv, iconConter){
    let icon = document.createElement('span'); 
    icon.classList.add('initials-task', 'initials-extra');
    icon.style.backgroundColor = 'rgb(135, 135, 135)';
    icon.textContent = `+${task.assignedTo.length - 3}`;
    initialsDiv.append(icon);
    iconConter++;
    return iconConter
}

/**
 * This function removes the contact ID in tasks if it is not present in "contacts".
 * @param {object} task -The task object to render.
 * @param {number} index -The index that references the non-existent ID.
*/
function noExistsContactSnapshot(task, index){
    off(taskRef, "value", loadTaskSnapshort);
    remove(ref(db, `tasks/${task.id}/assignedTo/${index}`)).then(() => {
        onValue(taskRef, loadTaskSnapshort);
    })
    .catch(error => {
        console.error(error);
    });
}

/**
 * This function creates an alternative if no assignedInitials exist. (span Element)
 * @param {HTMLDivElement} initialsDiv -Passes the initialsDiv (div) element.
*/
function assignedToExistsNot(initialsDiv){
    initialsDiv.replaceChildren();
    let span = document.createElement('span');
    span.textContent = 'None assigned';
    initialsDiv.append(span);
}

/**
 * This function create and passes subtasks to the details overlay.
 * @param {object} task -The task object to render. 
 */
function createPassSubtasksToDetails(task){
    let subtasksUl = document.getElementById('popup-subtasks');
    if(task.subtasks) subtaskExisting(task, subtasksUl);
    else subtaskExistingNot(subtasksUl);
}

/**
 * This function creates the subtasks objects.
 * @param {object} task -The task object to render. 
 * @param {HTMLUListElement} subtasksUl -Passes the subtasksUl (ul) element.
 */
function subtaskExisting(task, subtasksUl){
    subtasksUl.replaceChildren();

    task.subtasks.forEach((subtask, id) => {
        let subtaskLi = document.createElement('li');
        
        createSubtaskInput(task, subtask, id, subtaskLi);
        createSubtaskLabel(task, id, subtaskLi);
        createSubtaskSpan(subtask, subtaskLi, subtasksUl);
    });
}

/**
 * This function creates the subtasks input element.
 * @param {object} task -The task object to render.
 * @param {object} subtask -The subtask object to render.
 * @param {number} id -The id of the subtask
 * @param {HTMLLIElement} subtaskLi -Passes the subtasksLl (ll) element.
 */
function createSubtaskInput(task, subtask, id, subtaskLi){
    let subtaskInput = document.createElement('input');
    subtaskInput.type = "checkbox";
    subtaskInput.classList.add('custom-checkbox');
    subtaskInput.id = `${task.id}-${id}`;
    
    subtaskInput.checked = subtask.checked;
    subtaskInput.addEventListener("change", () => chackboxValueUpdate(task.id, id, subtaskInput.checked));
    subtaskLi.append(subtaskInput);
}

/**
 * This function creates the subtasks label element.
 * @param {object} task -The task object to render.
 * @param {number} id -The id of the subtask
 * @param {HTMLLIElement} subtaskLi -Passes the subtasksLl (ll) element.
 */
function createSubtaskLabel(task, id, subtaskLi){
    let subtaskLabel = document.createElement('label');
    subtaskLabel.htmlFor = `${task.id}-${id}`;
    subtaskLi.append(subtaskLabel);
}

/**
 * This function creates the subtasks span element.
 * @param {object} subtask -The subtask object to render.
 * @param {HTMLLIElement} subtaskLi -Passes the subtasksLl (ll) element.
 * @param {HTMLUListElement} subtasksUl -Passes the subtasksUl (ul) element.
 */
function createSubtaskSpan(subtask, subtaskLi, subtasksUl){
    let subtaskSpan = document.createElement('span');
    subtaskSpan.textContent = subtask.task;
    subtaskLi.append(subtaskSpan);
    subtasksUl.append(subtaskLi);
}


/**
 * This function creates an alternative if no subtasks exist.
 * @param {HTMLUListElement} subtasksUl -Passes the subtasksUl (ul) element.
*/
function subtaskExistingNot(subtasksUl){
    subtasksUl.replaceChildren();
    let subtaskLi = document.createElement('li');
    let subtaskSpan = document.createElement('span');
    subtaskSpan.textContent = "No subtasks available";
    
    subtaskLi.append(subtaskSpan);
    subtasksUl.append(subtaskLi);
}

/**
 * This function updates the checked state of the subtask Checkbox.
 * @param {number} taskId -The id of the task
 * @param {number} subtaskId -The id of the subtask
 * @param {boolean} isChecked -The checked state of the subtask Checkbox.
*/
function chackboxValueUpdate(taskId, subtaskId, isChecked){
    off(taskRef, 'value', loadTaskSnapshort);
    off(tasksRef, 'value', loadTasksSnapshort);
    const updates = {};
    updates[`tasks/${taskId}/subtasks/${subtaskId}/checked`] = isChecked;
    
    update(ref(db), updates)
    .then(() => {
        onValue(tasksRef, loadTasksSnapshort);
        onValue(taskRef, loadTaskSnapshort);
    })
    .catch(error => console.error(error));
}