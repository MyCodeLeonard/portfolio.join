import { auth } from '../firebase/firebase-init.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export let userId;
/**
 * Fetches and displays the user's initials in the topbar.
 * Shows "G" if guest is logged in.
 */
export function showUserInitials() {
  onAuthStateChanged(auth, user => {
    if (!user && localStorage.getItem('unregistered') != 'true') return window.location.href = 'index.html';
    if (localStorage.getItem('unregistered') == 'true') return;
    if (user.email === 'guest@example.com') return insertInitials('G');
    insertInitials(user.photoURL);
    userId = user.uid;
  });
}

/**
 * Inserts the given initials text into the topbar user icon.
 * @param {string} initials - The initials to display.
 */
function insertInitials(initials) {
  const el = document.querySelector('.topbar-user');
  if (el) el.textContent = initials;
}
