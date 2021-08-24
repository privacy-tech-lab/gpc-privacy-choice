import {createUser} from "./firebase.js"

let userProfile = null;
const PASSWORD = 12345;

let profilesList = document.querySelectorAll('.choice');

// Add event listeners for toggling user choice of profile
profilesList.forEach(item => {
    item.addEventListener('click', event => {
        let classList = event.target.classList;
        for (let profile of profilesList){
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
    let prolificID = document.getElementById("prolific-id").value;
    let password = document.getElementById("password").value;
    let html = `<div class="uk-alert-danger" uk-alert><a class="uk-alert-close" uk-close></a>`;
    if (!prolificID) html += `<p class="uk-text-default">User Prolific ID Required</p>`; 
    if (!password) html += `<p class="uk-text-default">Password is Required</p>`; 
    if (prolificID && !validateID(prolificID)) html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
    if (password && (password != PASSWORD)) html += `<p class="uk-text-default">Invalid Password</p>`;
    if (prolificID && password && validateID(prolificID) && password == PASSWORD){
        try { userProfile = document.querySelector(".uk-card-primary").children[1].innerText;
        } catch (e){}
        if (userProfile){
            chrome.storage.local.set({USER_PROFILE: userProfile}, function(){submit(prolificID);});
        } else {
            html += `<p class="uk-text-default">Please Select Your Privacy Sensitivity Profile</p>`;
            html += `</div>`
            let warnings = document.querySelector(".form-validation");
            warnings.innerHTML = html;
        }
    } else {
        html += `</div>`
        let warnings = document.querySelector(".form-validation");
        warnings.innerHTML = html; 
    } 
}

// Add user information into the database
function submit(prolificID){
    chrome.storage.local.get(["UI_SCHEME"], function(result){
        let schemeNumber = result.UI_SCHEME;
        chrome.storage.local.set({USER_CHOICES: userProfile, MADE_DECISION: true}, async function(){
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
    });

    chrome.storage.local.get(["USER_CHOICES", "UV_SETTING"], function (result) {
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All future domains", setting: "Privacy Profile", prevSetting: "Preference not set", newSetting: result.USER_CHOICES, universalSetting: result.UV_SETTING, location: "Privacy Profile", subcollection: "Privacy Choice"})
    })
}

// Helper function to validate prolific ID
function validateID(id) {
    const re = /^([a-zA-Z0-9_-]){24,24}$/;
    return re.test(id);
}