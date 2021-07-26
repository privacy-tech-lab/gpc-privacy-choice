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
        console.log(userChoices); 
    })
})

// Storage the user's choice in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    console.log(e.target);
    console.log("Submit Button was clicked");
    chrome.storage.local.set({USER_CHOICES: userChoices}, function(){
        window.close();
    });
}