let userProfile = null;

let profilesList = document.querySelectorAll('.choice');

// Add event listeners for toggling user choice of profile
profilesList.forEach(item => {
    item.addEventListener('click', event => {
        userProfile = event.target.nextElementSibling.nextElementSibling.innerText;
        let classList = event.target.classList;
        for (profile of profilesList){
            if (profile.children[0].firstElementChild.classList !== classList){
                let card = profile.children[0];
                card.classList.remove("uk-card-primary");
                card.setAttribute("aria-expanded", false);
            }
        }
    })
})


// Storage the user's profile in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    chrome.storage.local.set({USER_PROFILE: userProfile}, function(){
        window.close();
    });
}