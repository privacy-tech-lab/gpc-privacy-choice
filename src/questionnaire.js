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

// Storage the user's choice in the local storage for future reference, close the tab
document.querySelector('.submit-choice').onclick = (e) => {
    chrome.storage.local.set({USER_CHOICES: userChoices, MADE_DECISION: true}, function(){
        window.close();
    });
}