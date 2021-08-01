/*
OptMeowt-Research is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

const body = document.querySelector('body');
const overlayDiv = document.createElement('div');
const head=document.querySelector('head');
const imbedStyle=document.createElement('style');
const popupDiv = document.createElement('div');

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

//adding class used to hide pseudo elements
imbedStyle.innerHTML=`
    .hide_pseudo:before, .hide_pseudo:after {content: none !important;}`
// adding HTML to the modal
overlayDiv.innerHTML = `
        <div id="privacy-res-popup-container" style="-webkit-font-smoothing: unset !important;">
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
                    border-top: 1px solid !important;
                    color:black;
                    font-weight:300;">
            <div style="
                    margin-block-start: 0.5em;
                    margin-inline-start: auto;
                    margin-inline-end: auto;
                    font: 16px/1.231 arial,helvetica,clean,sans-serif;
                    font-weight:300;
                    padding-bottom:3px;
                    margin-bottom: 7px;
                    color: black;">
                        You have a right to make your privacy choice under the law.
                        This website is sharing your personal information for advertising purposes.
            </div>
            <div style="
                padding: unset;
                margin-top: 7px;
                width: 10px;
                display: inline;
                width: unset;
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
            <div style="
                display:inline;
                align-tems: center;
                align: center;
                width: 100%">
                <input value="Empty" id="apply-all" type="checkbox" style="
                    content: none !important;
                    color-scheme: light !important;
                    float: unset;
                    cursor:pointer;
                    pointer-events: unset !important;
                    height: unset;
                    opacity: unset;
                    position: unset !important;
                    display:inline-flex;
                    color: unset !important;
                    width:unset;
                    -webkit-appearance:checkbox;
                    align-self: center;
                    margin:unset;">
                <div for="apply-all" style="
                    margin-block-start: 0.5em;
                    margin-block-end: 0.5em;
                    display: inline-flex;
                    color:black !important;
                    font-size:16px;
                    font:16px/1.231 arial,helvetica,clean,sans-serif !important;
                    font-weight: 300;
                    margin-bottom:10px;
                    margin-left: 5px;
                    font-family: unset;
                    position:unset !important;
                    padding:unset;
                    text-transform:unset;
                    top:unset;">
                        Apply to all websites you visit
                </div>
            </div>
        </div> 
    `

// buttons change color when the cursor hovers over them
body.addEventListener('mouseover', event => {
    let button_preb = event.target;
    if(button_preb.id === 'allow-btn' || button_preb.id === 'dont-allow-btn'|| button_preb.id === 'rbe-okay-btn') {
        button_preb.style.backgroundColor = 'rgb(0, 102, 204)';
    }
}
)

//otherwise, buttons remain the normal color
body.addEventListener('mouseover', event => {
    let cursor_spot = event.target;
    let but1 = document.getElementById('allow-btn');
    let but2 = document.getElementById('dont-allow-btn');
    let but3 = document.getElementById('rbe-okay-btn');
    if(cursor_spot.id !== 'allow-btn' && cursor_spot.id !== 'dont-allow-btn' && cursor_spot.id !== 'rbe-okay-btn' ) {
        if(but1) but1.style.backgroundColor = 'rgb(51, 153, 255)';
        if (but2) but2.style.backgroundColor = 'rgb(51, 153, 255)';
        if (but3) but3.style.backgroundColor = 'rgb(51, 153, 255)';
    }
}
)

// add event listener to close the modal
body.addEventListener('click', event => {
    let currentDomain = getDomain(window.location.href);
    let applyAllBool
    if(document.getElementById("apply-all")){
        applyAllBool = document.getElementById("apply-all").checked
    }
    else applyAllBool=false;
    if(event.target.id === 'dont-allow-btn' && !applyAllBool) { 
        // situation 1: enable GPC for the current domain
        removeOverlay();
        chrome.storage.local.set({DOMAINLIST_ENABLED: true});
        chrome.storage.local.get(["DOMAINS"], function (result) {
            new_domains = result.DOMAINS;
            new_domains[currentDomain] = true;
            chrome.storage.local.set({ DOMAINS: new_domains });
            chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: true, newApplyAll: 'dontSet' });
            // Sends data to Setting Interaction History
            chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
                chrome.runtime.sendMessage({greeting:"INTERACTION", domain: currentDomain, setting: "GPC signal", prevSetting: "Preference not set" , newSetting: "Don't allow tracking", universalSetting: "Off"})
            });       
        })
    }
    else if(event.target.id === 'allow-btn' && !applyAllBool) { 
        // situation 2: disable GPC for the current domain
        removeOverlay();
        chrome.storage.local.set({DOMAINLIST_ENABLED: true});
        chrome.storage.local.get(["DOMAINS"], function (result) {
        new_domains = result.DOMAINS;
        new_domains[currentDomain] = false;
        chrome.storage.local.set({ DOMAINS: new_domains });
        chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains:new_domains , newDomainlistEnabled: true, newApplyAll: 'dontSet' })
        });
        // Sends data to Setting Interaction History
        chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: currentDomain, setting: "GPC signal", prevSetting: "Preference not set" , newSetting: "Allow tracking", universalSetting: "Off"})
        })
        
    }
    else if(event.target.id === 'dont-allow-btn' && applyAllBool) { 
        // situation 3: enable GPC for all future domains
        removeOverlay();
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
    else if(event.target.id === 'allow-btn' && applyAllBool) { 
        // situation 4: disable GPC for all future domains
        removeOverlay();
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
    else if(event.target.id === 'rbe_open_options'){
        chrome.runtime.sendMessage({greeting:"OPEN OPTIONS"})
    }
    else if(event.target.id === 'rbe-okay-btn'){
        removeOverlay()
    }
})

// logic for the banner pop up: only when DOMAINLIST_ENABLED == true && the current domain is a new domain 
chrome.storage.local.get(["APPLY_ALL", "DOMAINS", "UI_SCHEME"], function (result) {
    let domains = result.DOMAINS;
    let currentDomain = getDomain(window.location.href);
    // only considered to show banner in scheme 1 and scheme 4
    if (result.UI_SCHEME == 1 || result.UI_SCHEME == 4){
        // if apply all is not selected and the user is on a new domain, display the banner
        if (!result.APPLY_ALL && (domains[currentDomain] === undefined || domains[currentDomain] == null)) displayOverlay();
    } else {
        // this is only needed when the ui_scheme is not 1 or 4
        updateDomainList();
    }
});

// function used to show notice of current tracking and selling preference -> not used for now
function displayPopup(){
    let count = 10;
    chrome.storage.local.get(["ENABLED"], function (result) {
        dontAllowBool=result.ENABLED;

    let changeButton;
    let currentDomainPerm;

    if(dontAllowBool){
        changeButton=
            `
            <div
            id="allow-btn"
            type="button" style="
            font-size:14px;
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
            Allow Tracking and Selling For This Domain
        </div>
        `
        currentDomainPerm=
            `
            <div style="text-align:center; margin-bottom:3px;">
            Given your privacy preferences, the current domain is not allowed to track and sell your data.
            </div>
        `

    }
    else{
        changeButton=
            `
            <div
            id="dont-allow-btn"
            type="button" style="
            font-size:14px;
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
            Don't Allow Tracking and Selling For This Domain
        </div>
            `
        currentDomainPerm=
            `
            <div>
            Given your privacy preferences, the current domain is allowed to track and sell your data.
            </div>
        `
    }
        

    let buttons =
    `
    <div    id="rbe-okay-btn"
            type="button" style="
                font-size:14px;
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
        Okay
      </div>
      ${changeButton}
    `

    popupDiv.innerHTML=
    `
    <div style="
        align-items: center;
        font-family: Arial;
        font-size:14px;
        text-align: center;
        padding: 1em;
        border-radius:10px;
        bottom:30px;
        left:5px;
        position: fixed;
        z-index:99999999999;
        background: white;
        width: 450px;

        height:fit-content;
        border: solid rgba(51, 153, 255, 1);
        ">
        ${currentDomainPerm}
        <div>
        <div style="margin-bottom: 5px;
        margin-top: 5px;">
        ${buttons}
        </div>
        <div id="rbe_open_options" style="
            cursor:pointer;
            color: rgba(51, 153, 255, 1);
            text-decoration: underline; ">
        click here to open ad tracking preferences
        </div>
        </div>
    <div style="display:inline;">
        Notice will automatically dissappear in
        <div style="display:inline;" id="rbePopupTimer"></div> seconds.
    </div>
    </div>

    `

    body.appendChild(popupDiv)



    timer();

    function timer() {
        document.getElementById("rbePopupTimer").innerText = count;
        count = count - 1;
        if(count==-1){
            removeOverlay();
            return;
        }
        oneSecond = setTimeout(timer, 1000);
    }
})}

// function used to add extra style the modal
function styleOverlay() {
  
  const contentContainer = document.querySelector('#privacy-res-popup-container');
  
  contentContainer.style.textAlign = 'center';   
  contentContainer.style.marginTop = '27vh'; 
  contentContainer.style.backgroundColor = 'white'; 
  contentContainer.style.padding = '1em';
  contentContainer.style.width = '250px';
  contentContainer.style.height = 'max-content';
  contentContainer.style.border = 'solid rgba(51, 153, 255, 1)';
  contentContainer.style.color = 'Black';
  contentContainer.style.borderRadius = '10px';
  contentContainer.style.fontFamily='Arial';
  contentContainer.style.fontSize='20px';
  contentContainer.style.lineSpacing='1px';
  contentContainer.style.boxSizing='unset';
  contentContainer.style.letterSpacing='0';

}

// function used to show the modal
function displayOverlay() {
    //add Overlay to the DOM
    head.appendChild(imbedStyle);
    body.appendChild(overlayDiv);
    styleOverlay();
    //add class that hides pseudo elements to apply-all button
    document.getElementById('apply-all').classList.add('hide_pseudo');
    overlayDiv.style.display = 'block';
}

// function used to remove the modal
function removeOverlay(){
    if (overlayDiv.style) overlayDiv.style.display = 'none';
    if (popupDiv.style) popupDiv.style.display = 'none';
}

// function used to get the hostname from the current url
function getHostName(url) {
    let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) return match[2];
    else return null;
}

// function used to get the top level domain for the current url
function getDomain(url) {
    let hostName = getHostName(url);
    let domain = hostName;
    
    if (hostName != null) {
        let parts = hostName.split('.').reverse();
        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];
            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
              domain = parts[2] + '.' + domain;
            }
        }
    }
    
    return domain;
}

// function used to update the domains of the domains list in the domain list 
function updateDomainList(){
    chrome.storage.local.get(["ENABLED", "DOMAINS", "CHECKLIST", "USER_CHOICES"], function (result){
        let currentDomain = getDomain(window.location.href);
        let domains = result.DOMAINS;
        let value = result.ENABLED;
        if (!(currentDomain in domains)){
            if (result.USER_CHOICES == "Moderately Privacy-Sensitive"){
                if (result.CHECKLIST.includes(currentDomain)) {
                    console.log("Found networks to exclude initially");
                    value = true;
                }
            }
            domains[currentDomain] = value;
            chrome.storage.local.set({DOMAINS: domains});
            chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet' })
      }
    })
}

//send information to background regarding the source  of a potential ad interaction
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "GET HTML TAG"){
            sendResponse(document.activeElement.tagName);
        }
    }
);