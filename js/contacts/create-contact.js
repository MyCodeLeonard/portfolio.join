import { createNewContact } from "./contacts-live-update.js"

/**
 * Initializes all 'add contact' overlay buttons and events.
 */
export function initAddContactOverlay() {
  setupAddBtn("add-contact-btn-big");
  setupAddBtn("responsive-small-add");
}

/**
 * Sets up the 'Add Contact' buttons click event.
 */
function setupAddBtn(HTMLElementId) {
  const btn = document.getElementById(HTMLElementId);
  if (!btn) return;
  btn.addEventListener("click", init);
}

/**
 * Handles the click on the big add contact button: resets form, shows overlay, clears errors.
 */
function init() {
  resetContactForm();
  showAddContactOverlay();
  clearErrors();
  renderCreateForm();
  closeOverlayEventListener();
}

/**
 * Resets the add contact form input fields.
 */
function resetContactForm() {
  setInputValue("new-name", "");
  setInputValue("new-email", "");
  setInputValue("new-phone", "");
}

/**
 * Sets the value of an input by ID.
 * @param {string} id - The element ID.
 * @param {string} value - The value to set.
 */
function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

/**
 * Shows the add contact overlay.
 */
function showAddContactOverlay() {
  document.getElementById("add-contact-overlay")?.classList.remove("d-none");
  document.querySelector(".overlay-box").addEventListener("click", e => e.stopPropagation());
}

/**
 * Clears error styles and error messages from all input fields.
 */
function clearErrors() {
  Array.from(document.getElementsByTagName('input')).forEach(e => e.classList.remove("input-error"));
  document.querySelectorAll(".error-message").forEach(d => d.textContent = "");
}

/**
 * Hides the add contact overlay.
 */
export function closeAddContactOverlay() {
  document.getElementById("add-contact-overlay")?.classList.add("d-none");
}

/**
 * Renders the create contact form and sets up the save button.
 */
function renderCreateForm() {
  const saveBtn = document.getElementById("create-contact-btn");
  if (saveBtn) {
    saveBtn.onclick = createNewContact;
  }
}

/**
 * Sets up the event listeners required to close the overlay.
 */
function closeOverlayEventListener(){
  document.getElementById('overlay-bg-addContact').addEventListener('click', closeAddContactOverlay);
  document.getElementById('close-overlay-btn-addContact').addEventListener('click', closeAddContactOverlay);
  document.getElementById('cancel-btn').addEventListener('click', closeAddContactOverlay);
}

/**
 * Closes all contact-related overlays and hides the contact card.
 */
export function closeAllContactOverlays() {
  hideOverlay("add-contact-overlay");
  hideOverlay("lightbox-overlay");
  hideRightSection();
  hideContactCard();
}

/**
 * Adds "d-none" to the overlay element to hide it.
 * @param {string} id - The ID of the overlay element.
 */
function hideOverlay(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("d-none");
}

/**
 * Hides the right contact detail section.
 */
function hideRightSection() {
  const rightSection = document.getElementById("right-section");
  if (rightSection) rightSection.classList.add("d-none");
}

/**
 * Hides the currently shown contact card.
 */
function hideContactCard() {
  const contactCard = document.getElementById("showed-current-contact");
  if (!contactCard) return;
  contactCard.classList.add("d-none");
  contactCard.classList.remove("show");
}