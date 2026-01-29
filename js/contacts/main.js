import { setupContactClickEvents } from "./open-contact.js";
import { initContactResponsive } from "./contact-responsive.js";
import { init } from "./contacts-live-update.js"
import { initAddContactOverlay } from "./create-contact.js"

/**
 * Loads all contacts, sets up events and responsive handlers.
 * @returns {Promise<void>}
 */
function onDomLoaded() {
  setupContactClickEvents();
  initAddContactOverlay();
  init();
  initContactResponsive()
}

/**
 * Initializes the app once the DOM is fully loaded.
 */
window.addEventListener("DOMContentLoaded", onDomLoaded);

