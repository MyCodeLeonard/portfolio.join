import { auth, db } from '../firebase/firebase-init.js';
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { checkInput } from "../multiple-application/error-message.js";

/**
 * Initializes registration form (e.g. sets up button event).
 */
export function initRegister() {
  setupSignUpBtn();
}

/**
 * Adds click event listener to the sign-up button.
 */
function setupSignUpBtn() {
  const btn = document.getElementById('sign-up-btn');
  if (btn) btn.addEventListener('click', signup);
}

/**
 * Handles sign-up process: validation, user creation, notification, redirect.
 */
async function signup() {
  const name = getVal('name-input');
  const email = getVal('email-input');
  const password = getVal('password-input');
  let hasError = checkInput("name-input", "email-input", null, "password-input", "password-repeat-input", "privacy-checkbox");
  if(hasError) return
  try {
    await registerUser(name, email, password);
    showNotification("registration successfuly!", "success", null);
    setTimeout(startTransitionToSummary, 1000);
  } 
  catch (e) {
    showNotification("An unknown error has occurred "+ e.message, "error", e.code);
  }
}

/**
 * Registers user in Firebase Auth and adds user/contact to the database.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 */
async function registerUser(name, email, password) {
  let iconBackgroundColor = randomColor();
  let initials = getInitials(name);
  let phone = "";

  await createUserWithEmailAndPassword(auth, email, password)
  .then(async (userCredential) => {
    await updateProfile(userCredential.user, {
      displayName: name,
      photoURL: initials
    })
    await set(ref(db, `contacts/${userCredential.user.uid}`), { name, email, initials, phone, iconBackgroundColor });
  });
}

/**
 * Generates a random color and returns it.
 * @returns {string} A randomly generated color value.
 */
export function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 30;
  const lightness = 45 + Math.random() * 15;

  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return ctx.fillStyle;
}

/**
 * Returns initials (first two uppercase letters) from the full name.
 * @param {string} name - The user's full name.
 * @returns {string} - The initials.
 */
function getInitials(name) {
  return name.split(" ").map(n => n[0]?.toUpperCase()).join("").slice(0, 2);
}

/**
 * Returns the value of an input field by id.
 * @param {string} id - The input field's id.
 * @returns {string} - The input's value.
 */
function getVal(id) {
  return document.getElementById(id).value;
}

/**
 * Shows notification box with a message and style (success/error).
 * @param {string} message - The notification message.
 * @param {string} [type="success"] - Notification type (success or error).
 * @param {string} - The Firebase error code.
 */
function showNotification(message, type = "success", error) {
  const box = document.getElementById("notification");
  let timeout = 4000;
  if(error == 'auth/network-request-failed'){
    box.textContent = "An error has occurred, probably this e-mail is already registered, if not please contact customer support";
    timeout = 5000;
  }
  else{
    box.textContent = message;
  }

  box.className = `notification ${type} show`;
  setTimeout(() => hideNotification(box), timeout);
}

/**
 * Hides the notification box (after a delay).
 * @param {HTMLElement} box - The notification box element.
 */
function hideNotification(box) {
  box.classList.remove("show");
  box.style.bottom = "-100px";
  box.style.opacity = "0";
}

/**
 * Starts the summary page transition after registration.
 */
function startTransitionToSummary() {
  const overlay = document.getElementById("page-transition");
  if (overlay) overlay.classList.remove("hidden");
  setTimeout(() => window.location.href = "summary.html", 500);
}
