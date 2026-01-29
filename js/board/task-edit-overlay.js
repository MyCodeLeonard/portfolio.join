import { db } from '../firebase/firebase-init.js';
import { ref, get, off, update, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { clearForm } from "../add-task/add-task-save.js";
import { addEventListenerChangesDueDate, validateTitle, validateDueDate, validateCategory, initAddTaskForm, collectTaskData} from "../add-task/add-task-form.js";
import { initContactsDropdown, handleContactToggle } from "../add-task/add-task-contacts.js";
import { addSubtask } from "../add-task/add-task-subtask.js";
import { loadTaskSnapshort, taskRef} from "./task-details-overlay.js";
import { loadTasksSnapshort, tasksRef } from "./task-card.js";
import { showMessage } from "../multiple-application/confirmation-window.js";

export let currentStatus = 'to-do';
export let isEditingTask = false;

/**
 * This function prepares the editing task overlay and 
 * inserts the values of the selected task through the id
 * @param {string} taskId -The id of the task
 */
export function passingDataToEditOverlay(taskId){
    addEventListenerClose();
    addEventListenerChangesDueDate();
    initAddTaskForm();
    initContactsDropdown();
    setTimeout(() => passingTaskValues(taskId), 50);
    
    addEventListenerEditingSave(taskId);
}

/**
 * This function sets the eventListener on the 'editing save button'.
 * In addition, it is checked whether all values are present.
 * If all values are present, the function ifPresentAllValues is called, which then updates the task
 * @param {string} taskId -The id of the task
 */
function addEventListenerEditingSave(taskId){
    document.getElementById('editing-save-btn').addEventListener('click', () => {
        let isTitle = validateTitle();
        let isDueDate = validateDueDate();
        let isCategory = validateCategory();

        if(isTitle && isDueDate && isCategory) ifPresentAllValues(taskId);
    });
}

/**
 * This function updates the task
 * @param {string} taskId -The id of the task
 */
function ifPresentAllValues(taskId){
    off(taskRef, 'value', loadTaskSnapshort);
    off(tasksRef, 'value', loadTasksSnapshort);
    update(ref(db, `tasks/${taskId}`), collectTaskData())
    .then(() => {
        showMessage("Task successfully updated.", "successful");
        closeEditTaskOverlay();
        onValue(tasksRef, loadTasksSnapshort);
        onValue(taskRef, loadTaskSnapshort);
    })
    .catch(error => {
      showMessage("An Error updating task.", "error");
      console.error("Error updating task:", error);
    });
}

/**
 * This function sets the eventListener to close the edit task overlay
 */
function addEventListenerClose(){
    closeOverlayEventListener();
    closeBtnEventListener();
    editingCancelBtnEventListener();

    const formAddEditTaskDOM = document.getElementById('form-add-edit-task');
    formAddEditTaskDOM.addEventListener('click', (event) => event.stopPropagation());

    const taskDetailsOverlayDOM = document.getElementById("task-overlay");
    taskDetailsOverlayDOM.classList.add("d-none");
}

/**
 * This function sets the eventListener on the 'background overlay' to close the 'edit task overlay'
 */
function closeOverlayEventListener(){
    const oldCloseOverlay = document.getElementById('add-edit-task-overlay');
    const closeOverlay = oldCloseOverlay.cloneNode(true);
    oldCloseOverlay.replaceWith(closeOverlay);

    closeOverlay.addEventListener("click", closeEditTaskOverlay);
}

/**
 * This function sets the eventListener on the 'close button' to close the 'edit task overlay'
 */
function closeBtnEventListener(){
    const oldCloseBtn = document.getElementById('add-edit-close-btn');
    const closeBtn = oldCloseBtn.cloneNode(true);
    oldCloseBtn.replaceWith(closeBtn);

    closeBtn.addEventListener('click', closeEditTaskOverlay);
}

/**
 * This function sets the eventListener on the 'editing cancel button' to close the 'edit task overlay'
 */
function editingCancelBtnEventListener(){
    const oldEditingCancelBtn = document.getElementById('editing-cancel-btn');
    const editingCancelBtn = oldEditingCancelBtn.cloneNode(true);
    oldEditingCancelBtn.replaceWith(editingCancelBtn);

    editingCancelBtn.addEventListener('click', closeEditTaskOverlay);
}

/**
 * Closes the edit task overlay and shows again the task details overlay.
 */
export function closeEditTaskOverlay() {
    document.getElementById("task-overlay").classList.remove("d-none");
    document.getElementById("add-edit-task-overlay").classList.add("d-none");
    document.getElementById('edit-btns-div').classList.add("d-none");
    clearForm();
    isEditingTask = false;
}


/**
 * This function calls the data of the Task via the id and passes it to the 'edit task overlay'
 * @param {string} taskId -The id of the task
 */
function passingTaskValues(taskId){
    get(ref(db, `tasks/${taskId}`))
    .then(snapshot => {
        if (snapshot.exists()) {
            let task = snapshot.val();
            passesTitleDescDueCatValues(task);
            passesPriorityValues(task);
            passesAssignedToValues(task);
            passesSubtasksValues(task);
            isEditingTask = true;
            currentStatus = task.status;
        }
    })
    .catch(console.error);
}

/**
 * This function passes the called values of title, description, due date and category to the 'edit task overlay'
 * @param {string} taskId -The id of the task
 */
function passesTitleDescDueCatValues(task){
    const titleDOM = document.getElementById('title');
    titleDOM.value = task.title;

    const descriptionDOM = document.getElementById('description');
    descriptionDOM.value = task.description;

    const dueDateDOM = document.getElementById('due-date');
    dueDateDOM.value = task.dueDate;

    const categoryDOM = document.getElementById('category');
    categoryDOM.value = task.category;
}

/**
 * This function passes the called priority value to the 'editing task overlay'
 * @param {string} taskId -The id of the task
 */
function passesPriorityValues(task){
    const lowRadioDOM = document.getElementById('low-btn').children[0];
    const mediumRadioDOM = document.getElementById('medium-btn').children[0];
    const urgentRadioDOM = document.getElementById('urgent-btn').children[0]

    if(task.priority == "low") lowRadioDOM.checked = true;
    else if(task.priority == "medium") mediumRadioDOM.checked = true;
    else if(task.priority == "urgent") urgentRadioDOM.checked = true;
}

/**
 * This function passes the called assigned to values to the 'editing task overlay'
 * @param {string} taskId -The id of the task
 */
function passesAssignedToValues(task){
    task.assignedTo?.forEach(contactId => {
        handleContactToggle(contactId);
    });
}

/**
 * This function passes the called subtask values to the 'edit task overlay'
 * @param {string} taskId -The id of the task
 */
function passesSubtasksValues(task){
    const subtaskInputDOM = document.getElementById('subtask');

    task.subtasks?.forEach(subtask => {
        subtaskInputDOM.value = subtask.task;
        addSubtask();
    });
}