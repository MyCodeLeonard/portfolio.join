import { db } from '../firebase/firebase-init.js';
import { ref, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/**
 * Deletes a task from Firebase by ID.
 * @param {string} taskId - The ID of the task to delete.
 */
export function deleteTask(taskId) {
  const taskRef = ref(db, 'tasks/' + taskId);
  remove(taskRef)
    .then(() => handleDeleteSuccess())
    .catch(error => handleDeleteError(error));
}

/**
 * Handles successful task deletion: closes overlay.
 */
function handleDeleteSuccess() {
  closeTaskOverlay();
}

/**
 * Handles task deletion errors and shows alert.
 * @param {Error} error - The error object.
 */
function handleDeleteError(error) {
  // console.error('Fehler beim Löschen des Tasks:', error);
  showMessage("Fehler beim Löschen des Tasks", true);
}

/**
 * Closes the task overlay and re-enables body scroll.
 */
function closeTaskOverlay() {
  document.getElementById('task-overlay').classList.add('d-none');
  document.getElementById("body").classList.remove('overflow-hidden');
}

/**
 * Shows a confirmation or error message for 2 seconds.
 * @param {string} message - The message text.
 * @param {boolean} isError - True if error, false if success.
 */
function showMessage(message, isError) {
  const box = document.getElementById("confirmation-window");
  const span = box?.querySelector("span");
  if (!box || !span) return;
  span.textContent = message;
  box.classList.remove("d-none", "error");
  if (isError) box.classList.add("error");
  box.style.display = "block";
  setTimeout(() => hideMessage(box), 2000);
}