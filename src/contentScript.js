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
            <hr>
            <p>You have a right to make your privacy choice under the law.
            This website is sharing your personal information for advertising purposes.</p>
            <br>
            <button id="allow-btn">Allow</button>
            <button id="dont-allow-btn">Don't Allow</button>
            <br>
            Apply to all websites you visit: <input value="Empty" id="apply-all" type="checkbox">
        </div> 
    `

// add overlayDiv to the DOM
body.appendChild(overlayDiv);

// add event listener to close the modal
body.addEventListener('click', event => {
    if(event.target.id === 'allow-btn') {
        removeOverlay();
    }
    else if(event.target.id === 'dont-allow-btn') {
        removeOverlay();
    }
})

// function used to add extra style the modal
function styleOverlay() {
  const contentContainer = document.querySelector('#container');
  contentContainer.style.textAlign = 'center';   
  contentContainer.style.marginTop = '27vh'; 
  contentContainer.style.backgroundColor = 'white'; 
  contentContainer.style.width = '53%'; 
  contentContainer.style.height = '30vh';
  contentContainer.style.border = 'solid rgba(0, 140, 255, 1)';
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