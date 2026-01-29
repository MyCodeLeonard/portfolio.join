import { loadTasks } from "./task-card.js";
import { initTaskDetailsOverlay } from "./task-details-overlay.js"
import { addEventListenerOpendAddTaskOverlay } from "./task-add-overlay.js";
import { initSearch } from "./search.js";

/**
 * Initializes all modules and event handlers on DOM ready.
 */
window.addEventListener("DOMContentLoaded", init);

/**
 * This function Initializes the board
 */
function init(){
  loadTasks();
  initTaskDetailsOverlay();
  addEventListenerOpendAddTaskOverlay();
  initSearch();
}