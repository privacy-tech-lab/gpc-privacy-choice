import { createUser } from "./firebase/firebase.js"
import { PASSWORD } from "./config.js"

let userProfile = null;

// Form validation when the user submits their prolific id and password
document.querySelector('.submit-choice').onclick = () => {
    let prolificID = document.getElementById("prolific-id").value;
    let password = document.getElementById("password").value;
    let html = `<div class="uk-alert-danger" uk-alert><a class="uk-alert-close" uk-close></a>`
    if (prolificID && password && validateID(prolificID) && password == PASSWORD) {
        submit(prolificID, userProfile);
    }  
    else {
        if (!prolificID) html += `<p class="uk-text-default">User Prolific ID Required</p>`; 
        if (!password) html += `<p class="uk-text-default">Password is Required</p>`; 
        if (prolificID && !validateID(prolificID)) html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
        if (password && (password != PASSWORD)) html += `<p class="uk-text-default">Invalid Password</p>`;
        html += `</div>`
        let warnings = document.querySelector(".form-validation");
        warnings.innerHTML = html; 
    } 
}

// Create user on the data base
function submit(prolificID, userProfile){
    chrome.storage.local.get(["UI_SCHEME"], function(result){
        let schemeNumber = result.UI_SCHEME;
        chrome.storage.local.set({USER_CHOICES: userProfile}, async function(){
            document.querySelector(".main").style.display = "none";
            document.querySelector(".loading").style.display = "block";
            await createUser(prolificID, schemeNumber);
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
    })
}

// Helper function to validate prolific ID
function validateID(id) {
    const re = /^([a-zA-Z0-9_-]){24,24}$/;
    return re.test(id);
}