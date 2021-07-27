import {userResgistration} from "./firebase.js"

let userChoices = {
    "Advertising": false,
    "Content": false,
    "Analytics": false, 
    "Fingerprinting": false,
    "Social": false,
    "Cryptomining": false
};

// Add event listeners for toggling user choice
document.querySelectorAll('.choice').forEach(item => {
    item.addEventListener('click', event => {
        let category = event.target.nextElementSibling.nextElementSibling.innerText;
        userChoices[category] = !userChoices[category];
    })
})


// TODO: Add the user info, email and choices into the database
document.querySelector('.submit-choice').onclick = (e) => {
    let userChoiceMade = false; 
    let firstName = document.getElementById("first-name").value;
    let lastName = document.getElementById("last-name").value;
    let email = document.getElementById("email").value;

    // Form Validation
    let warnings = document.querySelector(".form-validation");
    let html = `<div class="uk-alert-danger" uk-alert>
                <a class="uk-alert-close" uk-close></a>`
    if (!firstName) html += `<p class="uk-text-default">User First Name Required</p>`;
    if (!lastName) html += `<p class="uk-text-default">User Last Name Required</p>`;
    if (!email) html += `<p class="uk-text-default">User Email Required</p>`; 
    if (email && !validateEmail(email)) html += `<p class="uk-text-default">Invalid Email Address</p>`;
    html += `</div>` 
    warnings.innerHTML = html; 
    

    if (firstName && lastName && email && validateEmail(email)){
        Object.values(userChoices).forEach(userChoice => {
            if (userChoice){userChoiceMade = true;}
        })
        if (!userChoiceMade){alert("You Didnt Choose Any Networks, are you sure")}
        chrome.storage.local.set({USER_CHOICES: userChoices, MADE_DECISION: true}, async function(){
            await userResgistration(firstName, lastName, email);
            document.querySelector(".main").style.display = "none";
            document.querySelector(".loading").style.display = "block";
            setTimeout(function(){
                document.querySelector(".loading").style.display = "none";
                let modal = UIkit.modal("#welcome-modal");
                modal.show();
                document.getElementById("modal-button").onclick = function () {
                  modal.hide();
                  window.close();
                } 
            }, 2000);
        });
    }
}


function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}