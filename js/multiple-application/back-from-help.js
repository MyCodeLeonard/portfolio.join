export function initBackFromHelp(){
    document.addEventListener("click", (event) => {
        if(event.target.closest('#help-button')) findPageUrl();
        if(event.target.closest('#help-button-responsive')) findPageUrl();
        if(event.target.closest('#back-to-page')) document.getElementById('back-to-page').href = './'+ localStorage.getItem("page");
        if(event.target.closest('#back-to-page') || event.target.closest(".nav-link") ) localStorage.removeItem("page");
    });
}

function findPageUrl(){
    window.location.pathname.split('/').filter(Boolean).forEach(element => {
        if (element ?? 'add-task.html' | 'board.html' | "contacts.html" | "legal.html" | "privacy-policy.html" | "summary.html" ) {
            localStorage.setItem("page", element);
        }
    });
}