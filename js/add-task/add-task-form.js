import { saveTaskToDB, clearForm } from "./add-task-save.js";
import { getSelectedContactIds } from "./add-task-contacts.js";
import { addEventListenerSubtask } from "./add-task-subtask.js";
import { getSubtasks } from "./add-task-subtask.js";
import { getStatus } from "../board/task-add-overlay.js"

/**
 * Initializes the add-task form: sets up create button and date input event handler.
 */
export function initAddTaskForm() {
  addEventListenerCreateTask();
  addEventListenerClearTaskForm();
  addEventListenerChangesDueDate();
  addEventListenerSubtask();
}

/**
 * This function sets the eventListener to create task
 * @returns Returns nothing. It cancels the function.
 */
function addEventListenerCreateTask(){
  const oldCreateBtn = document.getElementById("create-task-btn");

  if (!oldCreateBtn) return;
  const createBtn = oldCreateBtn.cloneNode(true);
  oldCreateBtn.replaceWith(createBtn);
  createBtn.addEventListener("click", handleFormSubmit);
}

/**
 * This function sets the eventListener to clear the task form
 * @returns Returns nothing. It cancels the function.
 */
function addEventListenerClearTaskForm(){
  const oldClearBtn = document.getElementById("clear-btn");

  if (!oldClearBtn) return;
  const clearBtn = oldClearBtn.cloneNode(true);
  oldClearBtn.replaceWith(clearBtn);
  clearBtn.addEventListener("click", clearForm);
}

/**
 * This function sets the eventListener and reacts to changes in the Due Date input field.
 * And sets the earliest possible date.
 */
export function addEventListenerChangesDueDate(){
  const dateInput = document.getElementById('due-date');
  let today = new Intl.DateTimeFormat('sv-SE').format(new Date());

  dateInput.min = today
  dateInput.addEventListener("input", validateDueDate);
}

/**
 * Handles form submission: validates fields, then saves the task.
 * @param {Event} event - The submit event.
 */
function handleFormSubmit(event) {
  event.preventDefault();
  let valid = true;
  if (!validateTitle()) valid = false;
  if (!validateDueDate()) valid = false;
  if (!validateCategory()) valid = false;

  if (valid) saveTaskToDB(collectTaskData());
}

/**
 * Validates the title field.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateTitle() {
  const title = document.getElementById("title").value.trim();
  const errorTitle = document.getElementById('error-title');
  errorTitle.textContent = "";
  if (!title) {
    errorTitle.textContent = "Please enter a title!";
    return false;
  }
  return true;
}

/**
 * Validates the due date field.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateDueDate() {
  const dueDate = document.getElementById("due-date");
  const errorDueDate = document.getElementById('error-due-date');
  const today = new Intl.DateTimeFormat('sv-SE').format(new Date());
  errorDueDate.textContent = "";

  if(!dueDate.value){
    errorDueDate.textContent = "Please select a due date!";
    return false;
  }
  if(dueDate.value < today){
    errorDueDate.textContent = "Due date cannot be in the past!";
    return false;
  }
  return true;
}

/**
 * Validates the category field.
 * @returns {boolean} True if valid, false otherwise.
 */
export function validateCategory() {
  const category = document.getElementById("category").value;
  const errorCategory = document.getElementById('error-category');
  errorCategory.textContent = "";
  if (!category) {
    errorCategory.textContent = "Please select a category!";
    return false;
  }
  return true;
}

/**
 * Collects all form values and returns a task object.
 * @returns {Object} The task object.
 */
export function collectTaskData() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    dueDate: document.getElementById("due-date").value,
    category: document.getElementById("category").value,
    status: getStatus(),
    priority: getSelectedPriority(),
    subtasks: getSubtasks(),
    assignedTo: getSelectedContactIds(),
  };
}

/**
 * Returns the selected priority value as string ("urgent", "medium", "low").
 * @returns {string} The selected priority.
 */
function getSelectedPriority() {
  if (document.getElementById("urgent-btn").children[0].checked) return "urgent";
  if (document.getElementById("medium-btn").children[0].checked) return "medium";
  if (document.getElementById("low-btn").children[0].checked) return "low";
  return "medium";
}