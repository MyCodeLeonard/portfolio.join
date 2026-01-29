import { db } from "../firebase/firebase-init.js";
import { ref, push, set, off, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { resetSelectedContacts } from "./add-task-contacts.js";
import { showMessage } from "../multiple-application/confirmation-window.js";
import { loadTasksSnapshort, tasksRef } from "../board/task-card.js";
import { closeAddTaskOverlay } from "../board/task-add-overlay.js"

/**
 * Saves a task object to Firebase and resets form/UI after success.
 * @param {Object} task - The task object to save.
 * @returns {Promise<void>}
 */
export async function saveTaskToDB(task) {
  document.getElementById('create-task-btn').disabled = true;
  try {
    off(tasksRef, 'value', loadTasksSnapshort);
    await pushTaskToDB(task);
    showMessage("Task successfully created!", "successful");
    handleRedirects();
  } catch (err) {
    showMessage("Saving failed! " + (err?.message || ""), "error");
    document.getElementById('create-task-btn').disabled = false;
  }
}

/**
 * Pushes the new task object into Firebase DB.
 * @param {Object} task - The task object to push.
 * @returns {Promise<void>}
 */
async function pushTaskToDB(task) {
  const tasksRef = ref(db, "tasks");
  const newTaskRef = push(tasksRef);
  await set(newTaskRef, task);
}

/**
 * Redirects or closes overlay based on current page.
 */
function handleRedirects() {
  getPathElements().forEach(element => {
    if (element == 'add-task.html') {
      setTimeout(() => {
        document.getElementById('create-task-btn').disabled = false;
        window.location.href = 'board.html';
      }, 1000);
    }
    if (element == 'board.html') {
      onValue(tasksRef, loadTasksSnapshort);
      clearForm();
      closeAddTaskOverlay();
      document.getElementById('create-task-btn').disabled = false;
    }
  });
}

/**
 * Splits pathname to check where we are.
 * @returns {Array<string>} Array of path elements.
 */
function getPathElements() {
  return window.location.pathname.split('/').filter(Boolean);
}

/**
 * Resets the form and all fields, errors, subtasks and contacts.
 */
export function clearForm() {
  resetFormFields();
  resetDateInput();
  resetPriorityButtons();
  clearSubtasks();
  clearAllErrors();
  resetSelectedContacts();
}

/**
 * Resets form fields via form.reset().
 */
function resetFormFields() {
  const form = document.getElementById("add-task-form");
  if (form) form.reset();
}

/**
 * Sets date input to today.
 */
function resetDateInput() {
  const dateInput = document.getElementById("due-date");
  if (dateInput) {
    let today = new Intl.DateTimeFormat('sv-SE').format(new Date());
    dateInput.value = "";
    dateInput.min = today;
  }
}

/**
 * Resets all priority buttons, sets medium as default.
 */
function resetPriorityButtons() {
  document.getElementById("medium-btn").children[0].checked;
}

/**
 * Clears the subtask list in the form.
 */
function clearSubtasks() {
  const subtaskList = document.getElementById("subtask-list");
  if (subtaskList) subtaskList.innerHTML = "";
}

/**
 * Clears all field error messages.
 */
function clearAllErrors() {
  setErrorText('error-title', "");
  setErrorText('error-due-date', "");
  setErrorText('error-category', "");
}

/**
 * Sets error message for a given field.
 * @param {string} id - The element ID.
 * @param {string} value - The error message.
 */
function setErrorText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value;
}