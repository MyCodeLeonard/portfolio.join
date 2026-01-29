import { db } from "../firebase/firebase-init.js";
import { ref, onValue, push, set, off, update, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { setupContactClickEvents, handleContactRef } from "./open-contact.js";
import { checkInput } from "../multiple-application/error-message.js";
import { closeAddContactOverlay } from "./create-contact.js";
import { showMessage } from "../multiple-application/confirmation-window.js";
import { closeEditLightbox, hideContactCard } from "./edit-contact.js"
import { userId } from "../help/user-initials.js";

const contactsRef = ref(db, "contacts");
let handleContactsRef;
let dataContactIds;

/**
 * This Funktion initializes and starts the creation of the contact list in the DOM.
 */
export function init(){
  handleContactsRef = (snapshot) => {
    if (!snapshot.exists()) return [];
    let contactsList = Object.entries(snapshot.val()).map(([id, data]) => ({ id, ...data })).sort((selected, compare)=> selected.name.localeCompare(compare.name));
    let contactListIds = Object.keys(snapshot.val());

    checkValueChangeAndSet(contactsList, contactListIds)
  }
  onValue(contactsRef, handleContactsRef);
}
/**
 * This function checks the current values, applies any necessary changes, and sets the updated values.
 * @param {object[]} contactsList -The contact objects.
 * @param {string[]} contactListIds -The contact ids.
 */
function checkValueChangeAndSet(contactsList, contactListIds){
  contactsList.forEach(contact => {
    if(document.getElementById(`contact-${contact.id}`)){
      valueChange(contactListIds);
      return;
    }
    
    generateList(contact);
    setupContactClickEvents();
  });
  
  const elements = document.querySelectorAll('.list-contact-wrapper');
  dataContactIds = Array.from(elements).map(el => el.getAttribute('data-contact-id'));
}

/**
 * This function checks the current values and updates them only if changes are detected.
 * @param {object} contact -The contact object.
 * @param {string} contactListIds -The contact id.
 */
function valueChange(contactListIds){
  const contactNoAvailable = dataContactIds.filter(x => !contactListIds.includes(x));
  if(contactNoAvailable.length == 1) document.getElementById(`contact-${contactNoAvailable[0]}`)?.remove();
}

/**
 * This function creates the contact list elements and inserts them into the DOM.
 * @param {object} contact -The contact object to render.
 */
function generateList(contact){
  const html = createContactHTML(contact);
  const wrapper = document.querySelector("#contacts-list-wrapper");
  wrapper.append(html);
}

/**
 * Creates a contact list entry as a DOM element.
 * @param {Object} contact -The contact object.
 * @returns {HTMLDivElement} The DOM element for the contact.
 */
export function createContactHTML(contact) {
  const div = document.createElement("div");
  div.className = "list-contact-wrapper";
  div.innerHTML = getContactHtml(contact);
  div.dataset.contactId = contact.id;
  div.id = `contact-${contact.id}`;
  div.classList.add("contact-entry");
  return div;
}

/**
 * Returns the HTML for a contact list entry (as string).
 * @param {Object} contact - The contact object.
 * @returns {string} HTML string for the contact.
 */
function getContactHtml(contact) {
  let highlight = "";
  if(contact.id == userId) highlight = " (you)";

  return `
    <div class="initial-icon" style="background-color: ${contact.iconBackgroundColor? contact.iconBackgroundColor : 'black'};">${contact.initials}</div>
    <div class="list-contact-information">
      <span class="list-name">${contact.name + highlight}</span>
      <span class="list-email">${contact.email}</span>
    </div>`;
}

/**
 * This function checks the entered values and shows an error message if they are invalid.
 * Execution is stopped with retuns in case of an error.
 * @returns nothing
 */
export function createNewContact(){
  let hasError = checkInput("new-name", "new-email", "new-phone", null, null, null, null);
  if (hasError) return;
  off(contactsRef, 'value', handleContactsRef);
  settingNewValue();
}

/**
 * This function collects the entered values and returns them.
 * @returns {Object} An object containing the collected input values.
 */
function setFieldValue(){
  const name = getValue("new-name");
  const email = getValue("new-email");
  const phone = getValue("new-phone");

  return {name: name, email: email, phone: phone, initials: createInitials(name),iconBackgroundColor: randomColor()}
}

/**
 * This function creates a new contact.
 */
function settingNewValue(){
  const newUserRef = push(contactsRef);
  set(newUserRef, setFieldValue())
  .then(() => {
    document.getElementById('contacts-list-wrapper').replaceChildren();
    onValue(contactsRef, handleContactsRef);
    closeAddContactOverlay();
    showMessage("Contact successfully saved", "successful");
  })
  .catch((error) => {
    showMessage("An error occurred while saving.", "error");
    console.error("An error occurred while saving:", error);
  });
}

/**
 * Gets the value of an input field by ID.
 * @param {string} id - The input element ID.
 * @returns {string|undefined} The input value.
 */
function getValue(id) {
  return document.getElementById(id)?.value.trim();
}

/**
 * Generates a random color and returns it.
 * @returns {string} A randomly generated color value.
 */
function randomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 30;
  const lightness = 45 + Math.random() * 15;

  const ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  return ctx.fillStyle;
}

/**
 * This function creates initials from name
 * @param {string} name - The name used to generate the initials.
 * @returns {string} The generated initials.
 */
function createInitials(name){
  return name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("");
}

/**
 * This funktion updates the edited data on the Database.
 * @param {string} id -The contact ID.
 * @returns nothing
 */
export function editContact(id){
  const fields = getEditFields();
  let hasError = checkInput("edit-name", "edit-email", "edit-phone", null, null, null, null);
  if (hasError) return;
  off(contactsRef, 'value', handleContactsRef);
  off(ref(db, `contacts/${id}`), 'value', handleContactRef);
  update(ref(db, `contacts/${id}`), fields)
  .then(() => afterUpdate(id))
  .catch(error => {
    showMessage("An Error updating contact.", "error");
    console.error("Error updating contact:", error);
  });
}

/**
 * This function is called by the editContact function once the update is complete
 * @param {string} id -The contact ID.
 */
function afterUpdate(id){
  document.getElementById('contacts-list-wrapper').replaceChildren();
  onValue(contactsRef, handleContactsRef);
  onValue(ref(db, `contacts/${id}`), handleContactRef);
  closeEditLightbox();
  showMessage("Contact has been successfully updated", "successful");
}

/**
 * Collects the edited fields from the edit form.
 * @returns {Object} -The edited contact fields.
 */
function getEditFields() {
  let name = document.getElementById("edit-name")?.value;
  return {
    name: name,
    email: document.getElementById("edit-email")?.value,
    phone: document.getElementById("edit-phone")?.value ? document.getElementById("edit-phone")?.value : "",
    initials: createInitials(name)
  };
}

/**
 * Deletes a contact by id.
 * @param {string} id - The contact ID.
 */
export function deleteContact(id){
  off(ref(db, `contacts/${id}`), 'value', handleContactRef);
  off(contactsRef, 'value', handleContactsRef);
  remove(ref(db, `contacts/${id}`)).then(() => {
    onValue(contactsRef, handleContactsRef);
    hideContactCard();
    showMessage("Contact deleted!", "successful");
    toggleResponsiveAddBtn();
  })
  .catch(error => {
    showMessage("An error occurred while deleting the contact", "error");
    console.error("An error occurred while deleting the contact:", error);
  });
}

/**
 * Shows the responsive add button after deleting a contact.
 * @param {boolean} isDelete - Always true for delete.
 */
function toggleResponsiveAddBtn() {
  document.getElementById('responsive-small-edit')?.classList.add('d-none');
  document.getElementById('responsive-small-add')?.classList.remove('d-none');
}
