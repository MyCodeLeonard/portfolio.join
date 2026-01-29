import { openEditContactLightbox } from "./edit-contact.js";
import { db } from "../firebase/firebase-init.js";
import { ref, onValue, off } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { closeAllContactOverlays } from "./create-contact.js";
import { setResponsiveState } from "./contact-responsive.js";
import { deleteContact } from "./contacts-live-update.js";

let oldId;
let currentId;
export let handleContactRef;

/**
 * Sets up the event listeners required to delete the Contact.
 */
function init(){
  document.getElementById('current-delete').addEventListener("click", openQueryDeleteOverlay);
  document.getElementById('current-delete-responsive').addEventListener("click", openQueryDeleteOverlay);
  document.getElementById('cancel-delete-button').addEventListener("click", closeQueryDeleteOverlay)
  document.getElementById('query-window').addEventListener("click", closeQueryDeleteOverlay);
  document.getElementById('overlay-window').addEventListener("click", (event) => event.stopPropagation());
  document.getElementById('yes-delete-button').addEventListener("click", ()=> {
    deleteContact(currentId);
    closeQueryDeleteOverlay();
  });
}

/**
 * This function opens the delete query overlay
 */
function openQueryDeleteOverlay(){
  document.getElementById('query-window').classList.remove('d-none');
}

/**
 * This function closes the delete query overlay
 */
function closeQueryDeleteOverlay(){
  document.getElementById('query-window').classList.add('d-none');
}

/**
 * Sets up all click events for contact list, edit and delete buttons.
 */
export function setupContactClickEvents() {
  setupContactListEvents();
}

/**
 * Sets up the event listener to open the contact details.
 */
function setupContactListEvents() {
  document.querySelectorAll(".contact-entry").forEach(el => {
    el.onclick = null;
    el.addEventListener("click", () => openContactDetails(el.dataset.contactId));
  });
}

/**
 * Opens the contact detail card, fills all fields and animates it.
 * @param {string} id - Contact ID.
 */
async function openContactDetails(id) {
  currentId = id;
  closeAllContactOverlays();
  let contact;
  off(ref(db, `contacts/${oldId}`));
  oldId = id;
  const contactsRef = ref(db, `contacts/${id}`);
  handleContactRef = (snapshot) => {
    if (!snapshot.exists()) return [];
    contact = {id, ...snapshot.val() };

    if (!contact) return;
    setContactCardData(id, contact);
  };
  onValue(contactsRef, handleContactRef)

  showContactCard();
  setResponsiveState();
  setupEditOverlayEvents(id);
}

/**
 * Adds click events for edit buttons (desktop & responsive).
 */
function setupEditOverlayEvents(id) {
  document.getElementById('current-edit').addEventListener("click", ()=> openEditContactLightbox(id));
  document.getElementById('current-edit-responsive').addEventListener("click", ()=> openEditContactLightbox(id));
}

/**
 * Sets contact card dataset and fills details.
 * @param {string} id - Contact ID.
 * @param {Object} contact - Contact data object.
 */
function setContactCardData(id, contact) {
  const card = document.getElementById("showed-current-contact");
  if (!card) return;
  card.dataset.contactId = id;
  fillContactDetails(contact);
}

/**
 * Fills all fields in the contact detail card.
 * @param {Object} contact - Contact data object.
 */
function fillContactDetails(contact) {
  setInitials("current-icon", contact.initials, contact.iconBackgroundColor);
  setContactField("current-name", contact.name);
  setContactLink("current-mail", contact.email, "mailto");
  setContactLink("current-phone", contact.phone, "tel");
}

/**
 * Sets the initials circle with a color.
 * @param {string} name - Contact name.
 */
export function setInitials(id, initials, iconBackgroundColor) {
  const icon = document.getElementById(id);
  if (icon) {
    icon.textContent = initials;
    icon.style.backgroundColor = iconBackgroundColor? iconBackgroundColor: 'black';
  }
}

/**
 * Sets the text of a contact detail field.
 * @param {string} id - Field element ID.
 * @param {string} text - Field text.
 */
function setContactField(id, name) {
  const el = document.getElementById(id);
  if (el) el.textContent = name;
}

/**
 * Sets a link field (mail or phone) in the contact card.
 * @param {string} id - Element ID.
 * @param {string} value - Link value (email/phone).
 * @param {string} prefix - Link prefix ("mailto"/"tel").
 */
function setContactLink(id, value, prefix) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = value;
    el.href = `${prefix}:${value}`;
  }
}

/**
 * Shows the contact card and plays the slide-in animation.
 */
function showContactCard() {
  const rightSection = document.getElementById("right-section");
  const card = document.getElementById("showed-current-contact");
  if (rightSection && card) {
    rightSection.classList.remove("d-none");
    card.classList.remove("d-none");
    card.classList.add("show");
    rightSection.classList.remove("slide-in");
    void rightSection.offsetWidth;
    rightSection.classList.add("slide-in");
  }
}

init();