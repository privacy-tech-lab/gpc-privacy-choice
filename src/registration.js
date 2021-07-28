import {userResgistration} from "./firebase.js"

let userProfile = null;

// Storage the user's profile in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    let prolificID = document.getElementById("prolific-id").value;
    let html = `<div class="uk-alert-danger" uk-alert>
                <a class="uk-alert-close" uk-close></a>`
    if (!prolificID) html += `<p class="uk-text-default">User Prolific ID Required</p>`; 
    if (prolificID && !validateID(prolificID)) html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
    
    if (prolificID && validateID(prolificID)){
            chrome.storage.local.set({USER_PROFILE: userProfile}, function(){
                submit(prolificID);
            });
    } 
    else {
        html += `</div>`
        let warnings = document.querySelector(".form-validation");
        warnings.innerHTML = html; 
    } 
}

// Add user information into the database
function submit(prolificID){
    chrome.storage.local.set({USER_CHOICES: userProfile, MADE_DECISION: null}, async function(){
        await userResgistration(prolificID, userProfile);
        document.querySelector(".main").style.display = "none";
        document.querySelector(".loading").style.display = "block";
        setTimeout(function(){
            document.querySelector(".loading").style.display = "none";
            let modal = UIkit.modal("#welcome-modal");
            modal.show();
            document.getElementById("welcome-modal-button").onclick = function () {
              modal.hide();
              window.close();
            } 
        }, 2000);
    });
}

// Helper function to validate prolific ID
function validateID(id) {
    const re = /^([a-zA-Z0-9_-]){24,24}$/;
    return re.test(id);
}