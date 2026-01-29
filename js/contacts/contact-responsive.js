/**
 * Media query to check if the screen width is below 1100px.
 * @type {MediaQueryList}
 */
const mediaQuery = window.matchMedia("(max-width: 1100px)");

export function initContactResponsive(){
document.getElementById('responsive-small-edit').addEventListener("click", responsiveEditDeleteMenuOpen);
document.getElementById('contacts-main').addEventListener("click", responsiveEditDeleteMenuClose);
document.getElementById('back-icon')?.addEventListener('click', backToContactList);

handleMediaQueryChange();
}

/**
 * Handles responsive design changes when the media query state changes.
 * Shows or hides the responsive 'add contact' button.
 *
 */
function handleMediaQueryChange() {
  if (mediaQuery.matches) {
    showResponsiveAdd();
    hideIfSlideIn();
  } else {
    hideResponsiveAdd();
  }
}

/**
 * Shows the responsive 'add contact' button for small screens.
 */
function showResponsiveAdd() {
  const el = document.getElementById('responsive-small-add');
  if (el) el.classList.remove('d-none');
}

/**
 * Hides the responsive 'add contact' button if right-section is slided in.
 */
function hideIfSlideIn() {
  const rightSection = document.getElementById('right-section');
  if (!rightSection) return;
  rightSection.classList.forEach(cls => {
    if (cls === 'slide-in') hideResponsiveAdd();
  });
}

/**
 * Hides the responsive 'add contact' button.
 */
function hideResponsiveAdd() {
  const el = document.getElementById('responsive-small-add');
  if (el) el.classList.add('d-none');
}

/**
 * Closes the responsive edit/delete menu.
 */
function responsiveEditDeleteMenuClose() {
  document.getElementById('current-btns-responsive').classList.remove('show');
  setTimeout(() => {
    document.getElementById('current-btns-responsive').classList.add('d-none');
    document.getElementById('body').classList.remove('overflow-hidden');
  }, 450);
  document.getElementById('responsive-small-edit').classList.remove('d-none');
}

/**
 * Opens the responsive edit/delete menu.
 * @param {MouseEvent} event - The click event.
 */
function responsiveEditDeleteMenuOpen(event) {
  showResponsiveBtns();
  event.stopPropagation();
}

/**
 * Shows the responsive edit/delete buttons.
 * Hides the responsive edit button.
 */
function showResponsiveBtns() {
  document.getElementById('current-btns-responsive').classList.remove('d-none');
  document.getElementById('body').classList.add('overflow-hidden');
  setTimeout(() => {
    document.getElementById('current-btns-responsive').classList.add('show');
  }, 1);
  document.getElementById('responsive-small-edit').classList.add('d-none');
}

/**
 * Closes the contact card and shows the contact list.
 */
export function backToContactList() {
  document.getElementById('right-section')?.classList.replace('slide-in', 'd-none');
  handleMediaQueryChange(mediaQuery);
  document.getElementById('responsive-small-edit')?.classList.add('d-none');
}

/**
 * Handles responsive/mobile UI state after showing a contact.
 */
export function setResponsiveState() {
  handleMediaQueryChange(mediaQuery);
  document.getElementById('responsive-small-edit')?.classList.remove('d-none');
  if (window.innerWidth <= 1100)
    document.body.classList.add('no-scroll');
}