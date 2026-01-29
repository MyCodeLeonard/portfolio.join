/**
 * Handles Enter key in subtask input.
 * @param {KeyboardEvent} event - The keyboard event.
 */
function handleSubtaskInputKey(event) {
  if (event.key === "Enter") {
    addSubtask();
    event.preventDefault();
  }
}

/**
 * Handles clicking on subtask list for editing.
 * @param {MouseEvent} e - The click event.
 */
function handleSubtaskListClick(e) {
  if (e.target.tagName === "LI") {
    editSubtask(e.target);
  }
}

/**
 * This function sets the eventListener for the sub task
 */
export function addEventListenerSubtask(){
  document.getElementById("subtask").addEventListener("keydown", handleSubtaskInputKey);
  document.querySelector(".subtask-button").addEventListener("click", addSubtask);
  document.getElementById("subtask-list").addEventListener("click", handleSubtaskListClick);
}

/**
 * Adds a new subtask from input to the subtask list.
 */
export function addSubtask() {
  const input = document.getElementById("subtask");
  const value = input.value.trim();
  if (!value) return;
  const list = document.getElementById("subtask-list");
  const li = createSubtaskListItem(value);
  list.appendChild(li);
  input.value = "";
  addSubtaskIconsListeners(li);
}

/**
 * Creates a subtask list item element.
 * @param {string} value - The subtask text.
 * @returns {HTMLLIElement} The list item element.
 */
function createSubtaskListItem(value) {
  const li = document.createElement("li");
  li.textContent = value;
  li.classList.add('subtask-list');
  li.innerHTML += getSubtaskIconsHTML();
  return li;
}

/**
 * Returns HTML for subtask edit/delete icons.
 * @returns {string} The icons HTML string.
 */
function getSubtaskIconsHTML() {
  return `<div class="subtask-icons-div">
    <img src="assets/img/edit.png" class="subtask-icon edit-subtask">
    <img src="assets/img/delete.png" class="subtask-icon delete-subtask">
  </div>`;
}

/**
 * Adds listeners for edit/delete icons to a subtask.
 * @param {HTMLLIElement} li - The list item element.
 */
function addSubtaskIconsListeners(li) {
  li.querySelector(".edit-subtask").addEventListener("click", iconEdit);
  li.querySelector(".delete-subtask").addEventListener("click", iconDelete);
}

/**
 * Handler for edit icon click.
 * @param {MouseEvent} e - The click event.
 */
function iconEdit(e) {
  const li = e.target.closest("li");
  if (li) editSubtask(li);
}

/**
 * Handler for delete icon click.
 * @param {MouseEvent} e - The click event.
 */
function iconDelete(e) {
  const li = e.target.closest("li");
  if (li) deleteSubtask(li);
}

/**
 * Enables editing a subtask inline.
 * @param {HTMLLIElement} li - The list item element.
 */
function editSubtask(li) {
  const oldValue = li.firstChild.textContent || li.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = oldValue;
  li.textContent = "";
  li.appendChild(input);
  input.focus();

  input.addEventListener("blur", () => finishEdit(li, input, oldValue));
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") finishEdit(li, input, oldValue);
  });
}

/**
 * Finishes subtask edit and updates the DOM.
 * @param {HTMLLIElement} li - The list item element.
 * @param {HTMLInputElement} input - The input element.
 * @param {string} oldValue - The previous value.
 */
function finishEdit(li, input, oldValue) {
  const value = input.value.trim() || oldValue;
  li.textContent = value;
  li.classList.add('subtask-list');
  li.innerHTML += getSubtaskIconsHTML();
  addSubtaskIconsListeners(li);
}

/**
 * Deletes a subtask from the list.
 * @param {HTMLLIElement} li - The list item element.
 */
function deleteSubtask(li) {
  li.remove();
}

/**
 * Gets all subtasks from the DOM as objects.
 * @returns {Array<Object>} Array of subtask objects.
 */
export function getSubtasks() {
  const items = document.querySelectorAll("#subtask-list li");
  return Array.from(items).map(li => ({
    "task": li.textContent.trim(),
    "checked": false
  }));
}