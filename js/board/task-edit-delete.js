import { db } from '../firebase/firebase-init.js';
import { ref, remove, off, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { closeOverlay } from "./task-details-overlay.js";
import { loadTaskSnapshort, taskRef} from "./task-details-overlay.js";
import { loadTasksSnapshort, tasksRef } from "./task-card.js";
import { passingDataToEditOverlay } from "./task-edit-overlay.js";
import { showMessage } from "../multiple-application/confirmation-window.js";

/**
 * This function sets the eventListener to delete task
 */
export function addEventListenerDelete(taskId){
    const oldDeleteTaskBtn = document.getElementById('delete-task-btn');
    const deleteTaskBtn = oldDeleteTaskBtn.cloneNode(true);
    oldDeleteTaskBtn.replaceWith(deleteTaskBtn);

    const oldEditTaskBtn = document.getElementById('edit-task-btn');
    const editTaskBtn = oldEditTaskBtn.cloneNode(true);
    oldEditTaskBtn.replaceWith(editTaskBtn);

    deleteTaskBtn.addEventListener("click", openQueryDeleteOverlay);
    editTaskBtn.addEventListener('click', () => opendEditTaskOverlay(taskId));
    queryDeleteEventListener(taskId);
}

/**
 * This function sets the eventListeners to close 
 * the query-delete overlay and permanently delete the task
 */
function queryDeleteEventListener(taskId){
  document.getElementById('cancel-delete-button').addEventListener("click", closeQueryDeleteOverlay)
  document.getElementById('query-window').addEventListener("click", closeQueryDeleteOverlay);
  document.getElementById('overlay-window').addEventListener("click", (event) => event.stopPropagation());

  const oldYesDeleteBtn = document.getElementById('yes-delete-button');
  const yesDeleteBtn = oldYesDeleteBtn.cloneNode(true);
  oldYesDeleteBtn.replaceWith(yesDeleteBtn);

  yesDeleteBtn.addEventListener("click", ()=> {
    deleteTask(taskId);
    closeQueryDeleteOverlay();
  });
}

/**
 * This function opens the delete query overlay
 */
function openQueryDeleteOverlay(){
  document.getElementById('query-window').classList.remove('d-none');
}

/**
 * This function closes the delete query overlay
 */
function closeQueryDeleteOverlay(){
  document.getElementById('query-window').classList.add('d-none');
}

/**
 * Deletes a task from Firebase by ID.
 * @param {string} taskId - The ID of the task to delete.
 */
export function deleteTask(taskId) {
    off(taskRef, 'value', loadTaskSnapshort);
    off(tasksRef, 'value', loadTasksSnapshort);
    remove(ref(db, `tasks/${taskId}`))
    .then(() => {
        onValue(tasksRef, loadTasksSnapshort);
        closeOverlay();
        showMessage("The task was successfully deleted", 'successful');
    })
    .catch(error => {
        handleDeleteError(error);
        showMessage("Error deleting the task", 'error');
    });
}

/**
 * Open the edit task overlay, hidden the task details overlay and disabled body scroll.
 */
function opendEditTaskOverlay(taskId){
    passingDataToEditOverlay(taskId);
    document.getElementById('add-edit-overlay-h1').textContent = "Edit Task";
    document.getElementById('edit-btns-div').classList.remove("d-none");
    document.getElementById("add-edit-task-overlay").classList.remove("d-none");
    document.getElementById("body").classList.add('overflow-hidden');
}