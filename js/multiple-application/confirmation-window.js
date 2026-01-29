/**
 * Shows a confirmation or error message for 2 seconds.
 * @param {string} message - The message text.
 * @param {boolean} isError - True if error, false if success.
 */
export function showMessage(message, kind = 'neutral') {
  const box = document.getElementById("confirmation-window");
  const span = box?.querySelector("span");
  if (!box || !span) return;
  span.textContent = message;
  box.classList.remove("d-none", "error-border", "successful-border", "neutral-border");
  if (kind == 'error') box.classList.add("error-border");
  else if(kind == 'successful') box.classList.add("successful-border");
  else box.classList.add("neutral-border"); 
  box.style.display = "block";

  setTimeout(() => box.style.removeProperty("display"), 2000);
}