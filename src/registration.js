import {userResgistration, createUser} from "./firebase.js"

let userProfile = null;
const PASSWORD = 12345;

// Storage the user's profile in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    let prolificID = document.getElementById("prolific-id").value;
    let password = document.getElementById("password").value;
    let html = `<div class="uk-alert-danger" uk-alert><a class="uk-alert-close" uk-close></a>`
    if (prolificID && password && validateID(prolificID) && password == PASSWORD) {
        let thirdPartyCookieHtml = document.getElementById('3rd_party_cookie_test_results').innerHTML; 
        let thirdPartyCookiesEnabled = (thirdPartyCookieHtml=="Third party cookies are <b>functioning</b> in your browser.") ? true : false;
        submit(prolificID, userProfile, thirdPartyCookiesEnabled);
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

// Add user information into the database
function submit(prolificID, userProfile, thirdPartyCookiesEnabled){
    chrome.storage.local.get(["UI_SCHEME"], function(result){
        let schemeNumber = result.UI_SCHEME;
        chrome.storage.local.set({USER_CHOICES: userProfile}, async function(){
            document.querySelector(".main").style.display = "none";
            document.querySelector(".loading").style.display = "block";
            await createUser(prolificID, schemeNumber, thirdPartyCookiesEnabled);
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