import {userResgistration} from "./firebase.js"

let userProfile = null;

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
    let html = `<div class="uk-alert-danger" uk-alert>
                <a class="uk-alert-close" uk-close></a>`
    if (!prolificID) html += `<p class="uk-text-default">User Prolific ID Required</p>`; 
    if (prolificID && !validateID(prolificID)) html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
    
    if (prolificID && validateID(prolificID)){
        try {
            userProfile = document.querySelector(".uk-card-primary").children[2].innerText;
        } catch (e){
        }
        if (userProfile){
            chrome.storage.local.set({USER_PROFILE: userProfile}, function(){
                submit(prolificID, userProfile);
            });
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
function submit(prolificID, userProfile){
    chrome.storage.local.set({USER_CHOICES: userProfile, MADE_DECISION: true}, async function(){
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
        if (userProfile === "Extremely Privacy-Sensitive") {
            //Enable GPC for all domains
            chrome.storage.local.set({UV_SETTING: "Don't allow all"});
            chrome.storage.local.set({DOMAINLIST_ENABLED: false});
            chrome.storage.local.set({APPLY_ALL: true});
            chrome.storage.local.get(["DOMAINS"], function (result) {
                new_domains = result.DOMAINS;
                for (let d in new_domains){
                    new_domains[d] = true;
                }
                new_domains[currentDomain] = true;
                chrome.storage.local.set({ DOMAINS: new_domains });
                chrome.runtime.sendMessage
                    ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains:new_domains , newDomainlistEnabled: false, newApplyAll: true })
            });
            // Sends data to Setting Interaction History
            chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Preference not set" , newSetting: "Don't allow tracking", universalSetting: "Don't allow all"})
            })
        }
        else if (userProfile === "Not Privacy-Sensitive") {
            //Disable GPC for all domains
            chrome.storage.local.set({UV_SETTING: "Allow all"});
            chrome.storage.local.set({DOMAINLIST_ENABLED: false});
            chrome.storage.local.set({APPLY_ALL: true});
            chrome.storage.local.get(["DOMAINS", "ENABLED"], function (result) {
                new_domains = result.DOMAINS;
                for (let d in new_domains){
                    new_domains[d] = false;
                }
                new_domains[currentDomain] = false;
                chrome.storage.local.set({ DOMAINS: new_domains });
                chrome.storage.local.set({ ENABLED: false });
                chrome.runtime.sendMessage({greeting:"UPDATE CACHE", newEnabled:false , newDomains:new_domains , newDomainlistEnabled: false, newApplyAll: true });
            });
            // Sends data to Setting Interaction History
            chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Preference not set" , newSetting: "Allow tracking", universalSetting: "Allow all"})
            })    
        }
        else {
            //TODO -> what does moderately privacy sensitive mean?
        }
    });
}

// Helper function to validate prolific ID
function validateID(id) {
    const re = /^([a-zA-Z0-9_-]){24,24}$/;
    return re.test(id);
}