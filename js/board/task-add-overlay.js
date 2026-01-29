import { initContactsDropdown } from "./../add-task/add-task-contacts.js"
import { initAddTaskForm } from "./../add-task/add-task-form.js";
import { clearForm } from "../add-task/add-task-save.js";
import { currentStatus, isEditingTask} from "./task-edit-overlay.js";

let handoversStatus = "to-do";

/**
 * This function sets the eventListener to opend add task overlay
 */
export function addEventListenerOpendAddTaskOverlay(){
    document.getElementById('add-task-button').addEventListener("click", () => opendAddTaskOverlay('to-do'));
    document.getElementById('add-task-to-do').addEventListener("click", () => opendAddTaskOverlay('to-do'));
    document.getElementById('add-task-progress').addEventListener("click", () => opendAddTaskOverlay('in-progress'));
    document.getElementById('add-task-feedback').addEventListener("click", () => opendAddTaskOverlay('await-feedback'));
}

/**
 * This function open the add task overlay and disabled body scroll.
 */
function opendAddTaskOverlay(status){
    document.getElementById('add-edit-overlay-h1').textContent = "Add Task";
    document.getElementById('add-btns-div').classList.remove("d-none");
    document.getElementById("add-edit-task-overlay").classList.remove("d-none");
    document.getElementById("body").classList.add('overflow-hidden');

    addEventListenerClose();
    initContactsDropdown();
    initAddTaskForm();
    handoversStatus = status
}

/**
 * This function returns the status
 * @returns {string} here the status is returned
 */
export function getStatus(){
    if(isEditingTask) return currentStatus;
    else return handoversStatus;
}

/**
 * This function sets the eventListener to close the details overlay
 */
function addEventListenerClose(){
    const oldCloseOverlay = document.getElementById('add-edit-task-overlay');
    const closeOverlay = oldCloseOverlay.cloneNode(true);
    oldCloseOverlay.replaceWith(closeOverlay);

    const oldCloseBtn = document.getElementById('add-edit-close-btn');
    const closeBtn = oldCloseBtn.cloneNode(true);
    oldCloseBtn.replaceWith(closeBtn);

    document.getElementById('form-add-edit-task').addEventListener('click', (event) => event.stopPropagation());
    closeOverlay.addEventListener("click", closeAddTaskOverlay);
    closeBtn.addEventListener('click', closeAddTaskOverlay);
}

/**
 * Closes the task overlay and re-enables body scroll.
 */
export function closeAddTaskOverlay() {
    document.getElementById("add-edit-task-overlay").classList.add("d-none");
    document.getElementById("body").classList.remove('overflow-hidden');
    document.getElementById('add-btns-div').classList.add("d-none");
    clearForm();
}