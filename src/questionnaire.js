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


// TODO: Add in form validation to ensure that the Email, User Names, Choices of Categories are Made
// TODO: Add the user info, email and choices into the database
// Storage the user's choice in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    let userChoiceMade = false; 
    let firstName = document.getElementById("first-name").value;
    let lastName = document.getElementById("last-name").value;
    let email = document.getElementById("email").value;

    let warnings = document.querySelector(".form-validation");
    if (!firstName){
        warnings.innerHTML += 
        `<div class="uk-alert-danger" uk-alert>
            <a class="uk-alert-close" uk-close></a>
            <p>User First Name Required</p>
        </div>`;
    } 
    if (!lastName){
        warnings.innerHTML += 
        `<div class="uk-alert-danger" uk-alert>
            <a class="uk-alert-close" uk-close></a>
            <p>User Last Name Required</p>
        </div>`;
    }
    if (!email){
        warnings.innerHTML += 
        `<div class="uk-alert-danger" uk-alert>
            <a class="uk-alert-close" uk-close></a>
            <p>User E-mail Required</p>
        </div>`;
    }  
    
    if (firstName && lastName && email){
        Object.values(userChoices).forEach(userChoice => {
            if (userChoice){userChoiceMade = true;}
        })
        if (!userChoiceMade){alert("You Didnt Choose Any Networks, are you sure")}
        chrome.storage.local.set({USER_CHOICES: userChoices, MADE_DECISION: true}, function(){
            window.close();
        });
    }
}