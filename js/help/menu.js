import { auth } from '../firebase/firebase-init.js';
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

/**
 * Initializes the topbar user menu:
 * Sets up menu toggle, logout, and click-outside-to-close logic.
 */
export function setupTopbarMenu() {
  const userIcon = document.querySelector('.topbar-user');
  const menu = document.getElementById('menuID');
  const logoutBtn = document.getElementById('log-out-buttonID');
  if (!userIcon || !menu || !logoutBtn) return;
  setupUserIcon(userIcon, menu);
  setupLogoutBtn(logoutBtn);
  setupOutsideClick(menu, userIcon);
}

/**
 * Handles toggling the user menu when the user icon is clicked.
 * @param {HTMLElement} userIcon - The user icon element in the topbar.
 * @param {HTMLElement} menu - The menu element to toggle.
 */
function setupUserIcon(userIcon, menu) {
  userIcon.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.toggle('d-none');
    menu.classList.toggle('d-flex');
  });
}

/**
 * Handles logout: clears storage and redirects to login page.
 * @param {HTMLElement} logoutBtn - The logout button element.
 */
function setupLogoutBtn(logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'index.html';
    })
    .catch((error) => {
      console.error("An error occurred while logging out:", error);
    });
  });
}

/**
 * Closes the menu if the user clicks outside of it (anywhere else on the page).
 * @param {HTMLElement} menu - The menu element to close.
 * @param {HTMLElement} userIcon - The user icon element to exclude from close logic.
 */
function setupOutsideClick(menu, userIcon) {
  document.addEventListener('click', e => {
    if (!menu.contains(e.target) && !userIcon.contains(e.target)) {
      menu.classList.add('d-none');
      menu.classList.remove('d-flex');
    }
  });
}