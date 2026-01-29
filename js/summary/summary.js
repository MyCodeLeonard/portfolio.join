import { auth, db } from "../firebase/firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

/**
 * Waits for the DOM to be ready and then initializes
 * greeting, task counters, and deadline date widgets.
 * Also handles the loader animation on page start.
 * Hides loader when everything is ready.
 */
window.addEventListener("DOMContentLoaded", onDomLoaded);

/**
 * Main entry after DOMContentLoaded: 
 * Handles loader visibility and calls all summary initializations.
 */
function onDomLoaded() {
    handleSummaryLoader();
    initGreeting();
    initTaskCounters();
    initDeadlineDate();
    hideLoader();
}

/**
 * Shows the loading animation if the user just logged in,
 * then hides it after a short delay, or hides it immediately.
 */
function handleSummaryLoader() {
  const loader = document.getElementById("summary-loader");
  if (sessionStorage.getItem("showSummaryLoader") === "1") {
    loader.style.display = "flex";
    setTimeout(() => {
      loader.style.display = "none";
      sessionStorage.removeItem("showSummaryLoader");
    }, 1200);
  } else {
    loader.style.display = "none";
  }
}

/**
 * Initializes the personalized greeting.
 * Sets the greeting time and fetches the user's name (if not guest).
 * Returns a Promise so other loaders can wait for greeting to finish.
 * @returns {Promise<void>}
 */
function initGreeting() {
  return new Promise(resolve => {
    setGreetingTime();
    onAuthStateChanged(auth, async user => {
        await setGreetingName(user);
        resolve();
    });
  });
}

/**
 * Sets the greeting message (Good morning/afternoon/evening) based on current time.
 */
function setGreetingTime() {
  const field = document.querySelector("#summary-greeting-time");
  const h = new Date().getHours();
  if (h < 12) field.textContent = "Good morning";
  else if (h < 18) field.textContent = "Good afternoon";
  else field.textContent = "Good evening";
}

/**
 * Loads and displays the current user's name,
 * or shows nothing if guest is logged in.
 * @param {object} user - The current Firebase user object.
 */
async function setGreetingName(user) {
  const nameField = document.querySelector("#summary-greeting-name");
  if (user && user.email !== "guest@example.com") {
    nameField.textContent = user ? user.displayName : "Unbekannt";
    const field = document.querySelector("#summary-greeting-time");
    field.textContent +=',';
  } else {
    nameField.textContent = "";
  }
}

/**
 * Hides the loader overlay after a short delay,
 * and makes the body visible.
 */
function hideLoader() {
  const loader = document.getElementById('summary-loader');
  setTimeout(() => {
    if (loader) loader.style.display = 'none';
    document.body.classList.remove('hidden');
  }, 900);
}

/**
 * Initializes task counters:
 * Subscribes to real-time updates from the database and updates all summary counters when tasks change.
 */
function initTaskCounters() {
  const tasksRef = ref(db, 'tasks');
  onValue(tasksRef, snapshot => {
    if (!snapshot.exists()) return;
    updateCounters(Object.values(snapshot.val()));
  });
}

/**
 * Updates all summary boxes with the latest task counts (by status, priority, etc).
 * @param {Array} tasks - Array of all tasks.
 */
function updateCounters(tasks) {
  setCount('#todo h2', countByStatus(tasks, 'to-do'));
  setCount('#done h2', countByStatus(tasks, 'done'));
  setCount('#urgent h2', countByPriority(tasks, 'urgent'));
  setCount('#atBoard h2', tasks.length);
  setCount('#onProgress h2', countByStatus(tasks, 'in-progress'));
  setCount('#awaitFeedback h2', countByStatus(tasks, 'await-feedback'));
}

/**
 * Counts the number of tasks matching the given status.
 * @param {Array} tasks - Array of all tasks.
 * @param {string} status - The status to filter by.
 * @returns {number} - The count of tasks with that status.
 */
function countByStatus(tasks, status) {
  return tasks.filter(t => t.status === status).length;
}

/**
 * Counts the number of tasks matching the given priority (e.g., 'urgent').
 * @param {Array} tasks - Array of all tasks.
 * @param {string} priority - The priority to filter by.
 * @returns {number} - The count of tasks with that priority.
 */
function countByPriority(tasks, priority) {
  return tasks.filter(t => t.priority === priority).length;
}

/**
 * Updates the text content of a DOM element with the given selector.
 * @param {string} selector - CSS selector for the element.
 * @param {number} value - The value to display.
 */
function setCount(selector, value) {
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}

/**
 * Initializes deadline date loading: 
 * Fetches all tasks from the database, finds the next urgent deadline,
 * and updates the UI with the formatted date.
 */
function initDeadlineDate() {
  const tasksRef = ref(db, 'tasks');
  onValue(tasksRef, (snapshot) => {
  if (!snapshot.exists()) return;
    const tasks = Object.values(snapshot.val());
    const date = getNextUrgentDeadline(tasks);
    updateDeadlineUI(date);
  });
}

/**
 * Returns the soonest dueDate from all tasks with priority "urgent".
 * Returns null if no urgent task is found.
 * @param {Array} tasks - List of all tasks.
 * @returns {string|null} - Next urgent dueDate or null.
 */
function getNextUrgentDeadline(tasks) {
  const urgent = tasks.filter(t => t.priority === 'urgent' && t.dueDate);
  const sorted = urgent.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  return sorted[0]?.dueDate || null;
}

/**
 * Updates the UI element with the nearest urgent deadline,
 * or displays "No urgent tasks" if there is none.
 * @param {string|null} dateStr - The date string to display.
 */
function updateDeadlineUI(dateStr) {
  const el = document.querySelector('#deadline-date');
  if (!el) return;
  el.textContent = formatDate(dateStr) || 'No urgent tasks';
}

/**
 * Formats a date string (YYYY-MM-DD) into "Month Day, Year".
 * Returns null if dateStr is missing.
 * @param {string} dateStr - Date string to format.
 * @returns {string|null} - Formatted date or null.
 */
function formatDate(dateStr) {
  if (!dateStr) return null;
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateStr).toLocaleDateString('en-US', options);
}