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
        <div id="privacy-res-popup-container" style="-webkit-font-smoothing: unset;">
            <div style="
                line-height: 1.5;
                font-family:unset !important;
                font-size: unset !important;
                color: unset !important;">
                Your Privacy Choice
            </div>
            <hr style="
                    height: .01px; 
                    padding:0;
                    margin:0px 0px;
                    display: block;
                    unicode-bidi: isolate;
                    margin-block-start: 0.5em;
                    margin-block-end: 0.5em;
                    margin-inline-start: auto;
                    margin-inline-end: auto;
                    line-height: 1px;
                    border: 0;
                    border-top: 1px solid;
                    font-weight:300;">
            <div style="
                    margin-block-start: 0.5em;
                    margin-block-end: 0.5em;
                    margin-inline-start: auto;
                    margin-inline-end: auto;
                    font: 16px/1.231 arial,helvetica,clean,sans-serif;
                    font-weight:300;
                    padding-bottom:7px;
                    color: black;">
                        You have a right to make your privacy choice under the law.
                        This website is sharing your personal information for advertising purposes.
            </div>
            <input value="Empty" id="apply-all" type="checkbox" style="-webkit-appearance:checkbox;">
            <label for="apply-all" style="
                margin-block-start: 0.5em;
                margin-block-end: 0.5em;
                display:unset;
                font-weight:300;
                color:black !important;
                font-size:16px;
                font:16px/1.231 arial,helvetica,clean,sans-serif;
                font-weight: 300;
                padding-right:20px;
                font-family: unset;">
                    Apply to all websites you visit
            </label>
            <div style="
                padding: unset;
                padding-top: 3px;
                width: 10px;
                display: inline;
                font-family:unset !important;
                font-size: unset !important;
                color: unset !important;">
                    <div id="allow-btn" style="
                        font-size:16px;
                        border:none;
                        background-color:
                        rgb(51, 153, 255);
                        color:white;
                        padding:0.5em;
                        border-radius:3.5px;
                        font-weight:300;
                        width: fit-content;
                        display:inline;
                        margin:3px;
                        font-family: unset;
                        cursor:pointer;">
                            Allow
                    </div>
                    <div id="dont-allow-btn" style="
                        font-size:16px;
                        border:none;
                        background-color:rgb(51, 153, 255);
                        color:white;
                        padding:0.5em;
                        border-radius:3.5px;
                        font-weight:300;
                        width: fit-content;
                        display:inline;
                        margin:3px;
                        font-family: unset;
                        cursor:pointer;">
                            Don't Allow
                    </div>
            <div/>
        </div> 
    `

// add overlayDiv to the DOM
body.appendChild(overlayDiv);

// buttons change color when the cursor hovers over them
body.addEventListener('mouseover', event => {
    let button_preb = event.target;
    if(button_preb.id === 'allow-btn' || button_preb.id === 'dont-allow-btn') {
        button_preb.style.backgroundColor = 'rgb(0, 102, 204)';
        setTimeout( () => {
            button_preb.style.backgroundColor = 'rgb(51, 153, 255)';
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
  const contentContainer = document.querySelector('#privacy-res-popup-container');
  
  contentContainer.style.textAlign = 'center';   
  contentContainer.style.marginTop = '27vh'; 
  contentContainer.style.backgroundColor = 'white'; 
  contentContainer.style.padding = '1em';
  contentContainer.style.width = '500px';
  contentContainer.style.height = 'max-content';
  contentContainer.style.border = 'solid rgba(51, 153, 255, 1)';
  contentContainer.style.color = 'Black';
  contentContainer.style.borderRadius = '10px';
  contentContainer.style.fontFamily='Arial';
  contentContainer.style.fontSize='20px';
  contentContainer.style.lineSpacing='1px';
  contentContainer.style.boxSizing='unset';

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
