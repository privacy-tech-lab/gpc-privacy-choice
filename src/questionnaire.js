import {userResgistration} from "./firebase.js"

// Datastructure used to hold user choices of ad networks
let userChoices = {
    "Advertising": false,
    "Analytics": false, 
    "Fingerprinting": false,
    "Social": false,
    "Cryptomining": false,
    "Others": false
};

// Add event listeners for toggling user choice
document.querySelectorAll('.choice').forEach(item => {
    item.addEventListener('click', event => {
        let category = event.target.nextElementSibling.nextElementSibling.innerText;
        userChoices[category] = !userChoices[category];
    })
})

// Add event listeners to do form validations
document.querySelector('.submit-choice').onclick = (e) => {
    let userChoiceMade = false; 
    let prolificID = document.getElementById("prolific-id").value;
    let networks = []; 

    // Form Validation
    let html = `<div class="uk-alert-danger" uk-alert>
                <a class="uk-alert-close" uk-close></a>`
    if (!prolificID) html += `<p class="uk-text-default">User Prolific ID Required</p>`; 
    if (prolificID && !validateID(prolificID)) html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
    html += `</div>` 

    //5f473753tbf20b123d695213
    if (prolificID && validateID(prolificID)){
        Object.keys(userChoices).forEach(i => {
            if (userChoices[i]) {
                userChoiceMade = true;
                networks.push(i)
            }
        })
        if (!userChoiceMade){
            let confirmationModal = UIkit.modal("#confirmation-modal");
            confirmationModal.show();
            document.getElementById("confirmation-modal-button").onclick = function () {
                confirmationModal.hide();
                submit(prolificID, networks);
            }
        } else {
            submit(prolificID, networks);
        }
    } else {
        let warnings = document.querySelector(".form-validation");
        warnings.innerHTML = html; 
    }
}

// Add user information into the database
async function submit(prolificID, networks){
    let checkList = [];
    let checkNotList = [];

    // Parse the networks json file based on the user's response to JSON
    await fetch("json/services.json")
      .then((response) => response.text())
      .then((result) => {
        networks = (JSON.parse(result))["categories"]
        for (let category of Object.keys(userChoices)){
            if (userChoices[category] == true){
                if (category != "Others"){
                    if (category === "Fingerprinting") {
                        for (let cat of ["FingerprintingGeneral", "FingerprintingInvasive"]) {
                            for (let n of networks[cat]) {
                                for (let c of Object.values(n)){
                                    for (let list of Object.values(c)){
                                    checkList = checkList.concat(list);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        for (let n of networks[category]){
                            for (let c of Object.values(n)){
                            for (let list of Object.values(c)){
                                checkList = checkList.concat(list);
                            }
                            }
                        }
                    }
                }
            } else {
                if (category != "Others"){
                    if (category === "Fingerprinting") {
                        for (let cat of ["FingerprintingGeneral", "FingerprintingInvasive"]) {
                            for (let n of networks[cat]){
                                for (let c of Object.values(n)){
                                    for (let list of Object.values(c)){
                                        checkNotList = checkNotList.concat(list);
                                    }
                                }
                            }
                        }
                    }
                    else {
                        for (let n of networks[category]){
                            for (let c of Object.values(n)){
                                for (let list of Object.values(c)){
                                    checkNotList = checkNotList.concat(list);
                                }
                            }
                        }
                    }
                }   
            }
        }
      })
    
    chrome.storage.local.set({CHECKLIST: checkList, CHECKNOTLIST: checkNotList, USER_CHOICES: userChoices}, async function(){
        await userResgistration(prolificID, networks);
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