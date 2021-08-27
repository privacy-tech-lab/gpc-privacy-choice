/*
OptMeowt-Research is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

const body = document.querySelector('body');
const banner = document.createElement('div');
const head=document.querySelector('head');
const imbedStyle=document.createElement('style');
const popupDiv = document.createElement('div');

// function used to add extra style the modal
function styleBanner() {
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
    // adding css styles to the modal
    banner.style.position = 'fixed';
    banner.style.width = '100%';
    banner.style.height = '100%';
    banner.style.top = '0';
    banner.style.left = '0';
    banner.style.right = '0';
    banner.style.bottom = '0';
    banner.style.backgroundColor = 'rgba(0,0,0,0.5)';
    banner.style.zIndex = '999999999999999';
    banner.style.textAlign = '-webkit-center';
    banner.style.display = "none";
    //adding class used to hide pseudo elements
    imbedStyle.innerHTML=`.hide_pseudo:before, .hide_pseudo:after {content: none !important;}`
}

// Buttons of banner change color when user hovers over them
function bannerMouseOverEvent() {
    body.addEventListener('mouseover', event => {
        let button_preb = event.target;
        if(button_preb.id === 'send-button' || button_preb.id === 'dont-send-button') {
            button_preb.style.backgroundColor = 'rgb(0, 102, 204)';
        }
        else if(button_preb.id === 'open-options') {
            button_preb.style.color = 'rgb(0, 102, 204)';
            button_preb.style.textDecoration = 'underline';
        }
        let cursor_spot = event.target;
        let but1 = document.getElementById('send-button');
        let but2 = document.getElementById('dont-send-button');
        let openOptions = document.getElementById('open-options');
        if(cursor_spot.id !== 'send-button' && cursor_spot.id !== 'dont-send-button') {
            but1.style.backgroundColor = 'rgb(51, 153, 255)';
            but2.style.backgroundColor = 'rgb(51, 153, 255)';
        }
        if(cursor_spot.id !== 'open-options') {
            console.log("What's up")
            openOptions.style.color = 'rgb(51, 153, 255)';
            openOptions.style.textDecoration = 'none';
        }
    })
}

//User interacts with banner
function bannerClickEvent() {
    body.addEventListener('click', event => {
        console.log(event.target.id);
        let currentDomain = getDomain(window.location.href);
        let applyAllBool = document.getElementById("apply-all").checked;
        if(event.target.id === 'send-button' && !applyAllBool) { 
            addSendEventListener(currentDomain);
        }
        else if(event.target.id === 'dont-send-button' && !applyAllBool) { 
            addDontSendEventListener(currentDomain);
        } 
        else if(event.target.id === 'send-button' && applyAllBool) { 
            addSendAllEventListener(currentDomain);
        } 
        else if(event.target.id === 'dont-send-button' && applyAllBool) { 
            addDontSendAllEventListener(currentDomain);
        }
        else if(event.target.id === 'open-options') {
            addOpenOptionsEventListener(currentDomain);
        }
    })
}

//Go to options page
function addOpenOptionsEventListener(currentDomain) {
    chrome.runtime.sendMessage("openOptions");
    chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: currentDomain, setting: "Open Options Page", prevSetting: null, newSetting: null, universalSetting: "Off", location: "Banner", subcollection: "Domain"})
    })    
}

//Enable GPC for the current domain
function addSendEventListener(currentDomain) {
    removeBanner();
    chrome.storage.local.set({DOMAINLIST_ENABLED: true});
    chrome.storage.local.get(["DOMAINS", "SEND_SIGNAL_BANNER"], function (result) {
        let new_domains = result.DOMAINS;
        new_domains[currentDomain] = true;
        sendSignalBanner = result.SEND_SIGNAL_BANNER; 
        if (sendSignalBanner !== undefined) chrome.storage.local.set({ DOMAINS: new_domains, SEND_SIGNAL_BANNER: sendSignalBanner+1});
        else chrome.storage.local.set({ DOMAINS: new_domains });
        chrome.runtime.sendMessage({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: true, newApplyAll: 'dontSet' });
        // Sends data to Setting Interaction History
        chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: currentDomain, setting: "GPC signal", prevSetting: "Preference not set" , newSetting: "Send signal", universalSetting: "Off", location: "Banner", subcollection: "Domain"})
        })    
    })
}

// Enable GPC for all future domains
function addSendAllEventListener(currentDomain) {
    removeBanner();
    chrome.storage.local.set({UV_SETTING: "Send signal to all", DOMAINLIST_ENABLED: false, APPLY_ALL: true});
    chrome.storage.local.get(["DOMAINS"], function (result) {
        let new_domains = result.DOMAINS;
        // todo: check if this is really what we want?
        for (let d in new_domains){new_domains[d] = true;}
        new_domains[currentDomain] = true;
        chrome.storage.local.set({ DOMAINS: new_domains });
        chrome.runtime.sendMessage({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains:new_domains , newDomainlistEnabled: false, newApplyAll: true });
    })
    // Sends data to Setting Interaction History
    chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Preference not set" , newSetting: "Send signal", universalSetting: "Send signal to all", location: "Banner", subcollection: "Domain"})
    })
}

// Disable GPC for the current domain
function addDontSendEventListener(currentDomain) {
    removeBanner();
    chrome.storage.local.set({DOMAINLIST_ENABLED: true});
    chrome.storage.local.get(["DOMAINS", "DO_NOT_SEND_SIGNAL_BANNER"], function (result) {
        let new_domains = result.DOMAINS;
        new_domains[currentDomain] = false;
        notSendSignalBanner = result.DO_NOT_SEND_SIGNAL_BANNER;
        if (notSendSignalBanner !== undefined) chrome.storage.local.set({ DOMAINS: new_domains, DO_NOT_SEND_SIGNAL_BANNER: notSendSignalBanner+1});
        else chrome.storage.local.set({ DOMAINS: new_domains });
        chrome.runtime.sendMessage({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains:new_domains , newDomainlistEnabled: true, newApplyAll: 'dontSet' })
        // Sends data to Setting Interaction History
        chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
            chrome.runtime.sendMessage({greeting:"INTERACTION", domain: currentDomain, setting: "GPC signal", prevSetting: "Preference not set" , newSetting: "Don't send signal", universalSetting: "Off", location: "Banner", subcollection: "Domain"})
        })
    })
}

// Disable GPC for all future domains
function addDontSendAllEventListener(currentDomain) {
    removeBanner();
    chrome.storage.local.set({UV_SETTING: "Don't send signal to all", DOMAINLIST_ENABLED: false, APPLY_ALL: true});
    chrome.storage.local.get(["DOMAINS", "ENABLED"], function (result) {
        new_domains = result.DOMAINS;
        // todo: check if this is really what we want?
        for (let d in new_domains){ new_domains[d] = false;}
        new_domains[currentDomain] = false;
        chrome.storage.local.set({ DOMAINS: new_domains, ENABLED: false });
        chrome.runtime.sendMessage({greeting:"UPDATE CACHE", newEnabled:false , newDomains:new_domains , newDomainlistEnabled: false, newApplyAll: true });
    })
    // Sends data to Setting Interaction History
    chrome.storage.local.set({ORIGIN_SITE: "Banner Decision"}, ()=>{
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing and future domains", setting: "GPC Signal", prevSetting: "Preference not set" , newSetting: "Don't send signal", universalSetting: "Don't send signal to all", location: "Banner", subcollection: "Domain"})
    }) 
}

// function used to show the modal
function showBanner(checkbox) {
    let bannerinnerHTML = `
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
                    color: black;">
                        You have a right to make your privacy choice under the law.
            </div>
            <div style="
                    margin-block-start: unset;
                    margin-inline-start: auto;
                    margin-inline-end: auto;
                    font: 16px/1.231 arial,helvetica,clean,sans-serif;
                    font-weight:600;
                    padding-bottom:3px;
                    margin-bottom: 7px;
                    color: black;">
                        Would you like to send Do Not Sell signals to this domain?
            </div>
            <div style="
                padding: unset;
                margin-top: 7px;
                margin-bottom: 7px;
                width: 10px;
                display: inline;
                width: unset;
                font-family:unset !important;
                font-size: unset !important;
                color: unset !important;">
                    <div id="send-button" style="
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
                            Yes
                    </div>
                    <div id="dont-send-button" style="
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
                           No
                    </div>
            <div/>
            <div style="
                margin-top:10px;
                display:inline-block;
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
                    font-size:13px;
                    font:13px/1.231 arial,helvetica,clean,sans-serif !important;
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
            <div>
                <a 
                    id="open-options" 
                    style="
                        line-height: 50%;
                        margin-block-start: 0.5em;
                        margin-inline-start: auto;
                        margin-inline-end: auto;
                        font: 13px/1.231 arial,helvetica,clean,sans-serif;
                        font-weight:300;
                        padding-bottom:3px;
                        margin-bottom: 7px;
                        text-decoration: none;
                        color: rgb(51, 153, 255);"
                    href=""
                    >Review or modify the choices you have made
                </a>
            </div>
        </div> 
    `
    let bannerNoApplyAllInnerHTML = `
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
            </div>
            <br>
            <div style="
                margin-block-start: 0.5em;
                margin-inline-start: auto;
                margin-inline-end: auto;
                font: 16px/1.231 arial,helvetica,clean,sans-serif;
                font-weight:300;
                padding-bottom:3px;
                margin-bottom: 7px;
                color: black;">
                    Would you like to send do not sell signals to this domain?
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
                    <div id="send-button" style="
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
                            Yes
                    </div>
                    <div id="dont-send-button" style="
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
                        No
                    </div>
            <div/>
            <br>
            <div>
                <a 
                    id="open-options" 
                    style="
                        line-height: 50%;
                        margin-block-start: 0.5em;
                        margin-inline-start: auto;
                        margin-inline-end: auto;
                        font: 13px/1.231 arial,helvetica,clean,sans-serif;
                        font-weight:300;
                        padding-bottom:3px;
                        text-decoration: none;
                        color: rgb(51, 153, 255);"
                    href=""
                    >Review or modify the choices I have made
                </a>
            </div>
        </div> 
    `
    head.appendChild(imbedStyle);
    if (checkbox) banner.innerHTML = bannerinnerHTML;
    else banner.innerHTML = bannerNoApplyAllInnerHTML;
    body.appendChild(banner);
    styleBanner();
    banner.style.display = "block";
    if (checkbox)document.getElementById('apply-all').classList.add('hide_pseudo');
    // buttons change color when the cursor hovers over them
    bannerMouseOverEvent();
    // add event listener to close the modal
    bannerClickEvent();
}

// function used to remove the modal
function removeBanner(){
    if (banner.style) banner.style.display = 'none';
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

// SCHEME 1: add new domains to the domainlist after apply all option is chosen
function addToDomainListScheme1(){
    chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result){
        let currentDomain = getDomain(window.location.href);
        let domains = result.DOMAINS;
        let value; 
        if (!(currentDomain in domains)){
            if (result.UV_SETTING == "Send signal to all") value = true;
            else value = false;
            // add the currentDomain and store it in the local storage
            domains[currentDomain] = value;
            chrome.storage.local.set({DOMAINS: domains});
            // notify background to update the cache used for look up
            chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet'})
        }
    })
}

// SCHEME 2: add new domains to the domainlist in local storage based on the user's questionnaire response
function addToDomainListScheme2(){
    chrome.storage.local.get(["DOMAINS", "CHECKLIST", "CHECKNOTLIST", "USER_CHOICES"], function (result){
        let currentDomain = getDomain(window.location.href);
        let domains = result.DOMAINS;
        // by default, do not send GPC signals
        let value = false;
        if (!(currentDomain in domains)){
            // send GPC signals if the currentDomain is in the checkList
            if (result.CHECKLIST.includes(currentDomain)) value = true;
            else {
                // send GPC is the currentDomain is not on the checkList, but the user has chosen Others and the currentDomain is not on the checknotlist
                if ((result.USER_CHOICES["Others"] == true)){
                    if (!(result.CHECKNOTLIST.includes(currentDomain))) value = true;
                }
            }
            // add the currentDomain and store it in the local storage
            domains[currentDomain] = value;
            chrome.storage.local.set({DOMAINS: domains});
            // notify background to update the cache used for look up
            chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet'})
        }
    })
}

// SCHEME 3: add new domains to the domainlist in local storage based on the user's choice of privacy profile
function addToDomainListScheme3(){
    chrome.storage.local.get(["DOMAINS", "CHECKLIST", "USER_CHOICES", "NPSLIST"], function (result){
        let currentDomain = getDomain(window.location.href);
        let domains = result.DOMAINS;
        // by default, do not send GPC signals
        let value = false;
        if (!(currentDomain in domains)){
            // if user chose extremely privacy sensitive: send GPC signals
            if (result.USER_CHOICES == "Extremely Privacy-Sensitive") value = true;
            // if user chose not privacy sensitive: do not send GPC signals
            else if (result.USER_CHOICES == "Not Privacy-Sensitive")  {
                value = false;
                if (result.NPSLIST.includes(currentDomain)) value = true;
            }
            // if the user chose moderately gpc signals
            else if (result.USER_CHOICES == "Moderately Privacy-Sensitive"){
                // by default, the GPC signals are not sent unless the currentDomain is the the checkList
                value = false;
                if (result.CHECKLIST.includes(currentDomain)) value = true;
            }
            // add the currentDomain and store it in the local storage
            domains[currentDomain] = value;
            chrome.storage.local.set({DOMAINS: domains});
            // notify background to update the cache used for look up
            chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet' })
      }
    })
}

// logic for the banner pop up: only when DOMAINLIST_ENABLED == true && the current domain is a new domain 
chrome.storage.local.get(["APPLY_ALL", "DOMAINS", "UI_SCHEME"], function (result) {
    let domains = result.DOMAINS;
    let currentDomain = getDomain(window.location.href);
    if (result.UI_SCHEME == 1){
        if (!result.APPLY_ALL && (domains[currentDomain] === undefined || domains[currentDomain] == null)) showBanner(true);
        else addToDomainListScheme1();
    } else if (result.UI_SCHEME == 4){
        let random = Math.floor(Math.random() * 3);
        if (random == 1 && !(currentDomain in domains)) {showBanner(false);} 
        else {
            chrome.storage.local.get(["DOMAINS", "CHECKLIST"], function (result){
                let currentDomain = getDomain(window.location.href);
                let domains = result.DOMAINS;
                let value = false;
                if (!(currentDomain in domains)){
                    if (result.CHECKLIST.includes(currentDomain)) value = true;
                    domains[currentDomain] = value;
                    chrome.storage.local.set({DOMAINS: domains});
                    chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet'});
                }
            })
        }
    } else {
        if (result.UI_SCHEME == 2) addToDomainListScheme2();
        else addToDomainListScheme3();
    }
});

// send information to background regarding the source  of a potential ad interaction
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.greeting == "GET HTML TAG"){
            sendResponse(document.activeElement.tagName);
        }
    }
);

// watcher function to switch from scheme 4 to scheme 3
chrome.storage.local.get(["DOMAINS", "SEND_SIGNAL_BANNER", "DO_NOT_SEND_SIGNAL_BANNER", "LEARNING"], function (result){
    let sendSignalBanner = result.SEND_SIGNAL_BANNER;
    let doNotSendSignalBanner = result.DO_NOT_SEND_SIGNAL_BANNER;
    if (result.LEARNING == "In Progress"){
        if (sendSignalBanner + doNotSendSignalBanner == 5){
            let userProfile;
            if (sendSignalBanner <= 1){
                userProfile = "Not Privacy-Sensitive"
            } else if (sendSignalBanner >= 4){
                userProfile = "Extremely Privacy-Sensitive"
            } else {
                userProfile = "Moderately Privacy-Sensitive"
            }
            chrome.storage.local.set({UI_SCHEME: 3, USER_CHOICES: userProfile})
            chrome.runtime.sendMessage({greeting:"LEARNING COMPLETED"})
        }
    }  
})