import { editContact, deleteContact } from "./contacts-live-update.js"

/**
 * Open and Shows the edit contact lightbox with contact data 
 * and removes errors/messages.
 */
export async function openEditContactLightbox() {
  removeInputErrors();
  removeAllErrorMessages();
  showLightboxElements();
  setupLightboxButtons();
}

/**
 * Removes error styling from all input fields.
 */
function removeInputErrors() {
  Array.from(document.getElementsByTagName('input')).forEach(e => e.classList.remove("input-error"));
}

/**
 * Removes all error messages from the edit form.
 */
function removeAllErrorMessages() {
  document.querySelectorAll(".error-message").forEach(d => d.textContent = "");
}

/**
 * Makes the lightbox and overlay visible.
 */
function showLightboxElements() {
  const overlay = document.getElementById("lightbox-overlay");
  const lightbox = document.getElementById("lightbox");
  if (overlay && lightbox) {
    lightbox.addEventListener("click", (event) => event.stopPropagation());
    overlay.classList.remove("d-none");
    overlay.classList.add("d-flex");
    lightbox.classList.add("show");

    setExistingData();
  }
}

/**
 * This function inserts the existing data into the contact edit overlay.
 */
function setExistingData(){
  document.getElementById("edit-name").value = document.getElementById("current-name").textContent;
  document.getElementById("edit-email").value = document.getElementById("current-mail").textContent;
  document.getElementById("edit-phone").value = document.getElementById("current-phone").textContent;
  document.getElementById("edit-initial-circle").textContent = document.getElementById("current-icon").textContent;
  document.getElementById("edit-initial-circle").style.backgroundColor = document.getElementById("current-icon").style.backgroundColor;
}

/**
 * Sets up all buttons inside the lightbox with their handlers.
 * @param {string} id - The contact ID.
 */
function setupLightboxButtons() {
  let id = document.getElementById('showed-current-contact').attributes[2].value;
  setupBtn("saveBtn", () => editContact(id));
  setupBtn("deleteBtn", () => {
    deleteContact(id);
    closeEditLightbox();
  });
  setupBtn("cancelBtn", closeEditLightbox);
  setupBtn("close-btn-edit-lightbox", closeEditLightbox);
  setupBtn("lightbox-overlay", closeEditLightbox);
}

/**
 * Assigns a function to a button (by ID or class).
 * @param {string} id - The element ID or selector.
 * @param {Function} fn - The function to assign.
 */
function setupBtn(id, fn) {
  const btn = document.getElementById(id);
  if (btn) btn.onclick = fn;
  
}

/**
 * Closes the edit lightbox and overlay.
 */
export function closeEditLightbox() {
  const overlay = document.getElementById("lightbox-overlay");
  const lightbox = document.getElementById("lightbox");
  if (overlay && lightbox) {
    overlay.classList.add("d-none");
    overlay.classList.remove("d-flex");
    lightbox.classList.remove("show");
  }
}

/**
 * Hides the contact card and right section panel.
 */
export function hideContactCard() {
  const rightSection = document.getElementById("right-section");
  const contactCard = document.getElementById("showed-current-contact");
  if (rightSection && contactCard) {
    rightSection.classList.add("d-none");
    contactCard.classList.add("d-none");
    contactCard.classList.remove("show");
  }
}