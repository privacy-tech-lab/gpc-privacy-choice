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
overlayDiv.style.zIndex = '999999999999999';
overlayDiv.style.textAlign = '-webkit-center';
overlayDiv.style.display = "none";

// adding HTML to the modal
overlayDiv.innerHTML = `
        <div id="container1">
            <h1
                style="font-weight:200;font-size:4em;font:caption;"
                >Your Privacy Choice
            </h1>
            <hr>
            <p
                style="font-weight:200;font-size:1.2em;font:caption;"
                >You have a right to make your privacy choice under the law.
                This website is sharing your personal information for advertising purposes.
            </p>
            <button 
                id="allow-btn" 
                style="border:none;background-color:rgb(51, 153, 255);color:white;padding:0.5em;border-radius:3.5px;"
                >Allow
            </button>
            <button 
                id="dont-allow-btn" 
                style="border:none;background-color:rgb(51, 153, 255);color:white;padding:0.5em;border-radius:3.5px;"
                >Don't Allow
            </button>
            <br>
            <input 
                value="Empty" 
                id="apply-all" 
                type="checkbox"
                style="position:relative;right:50px;padding:0.5em;"
                >
            <label
                for="apply-all"
                style="position:relative;right:50px;"
                >
                Apply to all websites you visit
                </label>
            <br>
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
  const contentContainer = document.querySelector('#container1');
  contentContainer.style.textAlign = 'center';   
  contentContainer.style.marginTop = '27vh'; 
  contentContainer.style.backgroundColor = 'white'; 
  contentContainer.style.padding = '1em';
  contentContainer.style.width = '25em';
  contentContainer.style.height = '13em';
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

// currently just showing the modal. todo: need to check the 
displayOverlay();
