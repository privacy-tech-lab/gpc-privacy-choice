const body = document.querySelector('body');
const overlayDiv = document.createElement('div');


// adding css styles to the modal
overlayDiv.style.position = 'fixed';
overlayDiv.style.width = '100%';
overlayDiv.style.height = '100%';
overlayDiv.style.top = '0';
overlayDiv.style.left = '0';
overlayDiv.style.right = '0';
overlayDiv.style.bottom = '0';
overlayDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
overlayDiv.style.zIndex = '2';
overlayDiv.style.textAlign = '-webkit-center';
overlayDiv.style.display = "none";

// adding HTML to the modal
overlayDiv.innerHTML = `
        <div id="container">
            <h2> Your Privacy Choice</h2>
            <hr style="background-color:rgb(51, 153, 255);"</hr>
            <p>You have a right to make your privacy choice under the law.
            This website is sharing your personal information for advertising purposes.</p>
            <br>
            <button 
                id="allow-btn" 
                style="border:none;background-color:rgb(51, 153, 255);color:white;padding:0.5em;border-radius:3.5px;"
                >Allow</button>
            <button 
                id="dont-allow-btn" 
                style="border:none;background-color:rgb(51, 153, 255);color:white;padding:0.5em;border-radius:3.5px;"
                >Don't Allow</button>
            <br>
            Apply to all websites you visit: <input value="Empty" id="apply-all" type="checkbox">
        </div> 
    `

// add overlayDiv to the DOM
body.appendChild(overlayDiv);

// buttons change color when the cursor hovers over them
body.addEventListener('mouseover', event => {
    let button = event.target;
    if(button.id === 'allow-btn' || button.id === 'dont-allow-btn') {
        button.style.backgroundColor = 'rgb(0, 102, 204)';
        setTimeout( () => {
            button.style.backgroundColor = 'rgb(51, 153, 255)';
        }, 500); 
    }
}
)

// add event listener to close the modal
body.addEventListener('click', event => {
    if(event.target.id === 'allow-btn' || event.target.id === 'dont-allow-btn') { 
        removeOverlay();
        }
    }
)

// function used to add extra style the modal
function styleOverlay() {
  const contentContainer = document.querySelector('#container');
  contentContainer.style.textAlign = 'center';   
  contentContainer.style.marginTop = '27vh'; 
  contentContainer.style.backgroundColor = 'white'; 
  contentContainer.style.padding = '1em';
  contentContainer.style.width = '75%';
  contentContainer.style.border = 'solid rgba(51, 153, 255, 1)';
  contentContainer.style.color = 'Black';
  contentContainer.style.borderRadius = '10px';
}

// function used to show the modal
function displayOverlay() {
    styleOverlay();
    overlayDiv.style.display = 'block';
}

// function used to remove the modal
function removeOverlay(){
    overlayDiv.style.display = 'none';
}

// logic that handles whether the banner will pop up or not
// banner only pops up in the two situations below:
// - the user has GPC off 
// - the user has GPC on and domain list option on but the current domain is not included in the domain lists
chrome.storage.local.get(["ENABLED", "DOMAINLIST_ENABLED"], function (result) {
    // if GPC is turned off for all domains
    if (result.ENABLED == false){ 
        displayOverlay();
    } else { 
        // GPC signal is turned on in this condition
        // if domain_list option is on, check if the current domain is enabling GPC
        if (result.DOMAINLIST_ENABLED == true) {
            chrome.storage.local.get(["DOMAINS"], function (d) {
            let domains = d.DOMAINS;
            let currentDomain = window.location.hostname

            // console.log(domains[currentDomain])
            // if the GPC is currently turned off for the current domain, ask the user
            if (!(domains[currentDomain]== true)){
                displayOverlay();
                }
            })
        }  
    }
});

// starter code for interaction between the button and the background.js
chrome.runtime.sendMessage({greeting: "ENABLE"}, function(response) {
    console.log(response.farewell);
});

// Listener for runtime messages from background js
// this code should return the domain name of the current tab to background.js
// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       if (request.message == "GET DOMAIN"){ // Filter out other messages
//         alert("background wants domain");
//         sendResponse({hostName: window.location.hostname});
//       }
//   });