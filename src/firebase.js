import { turnOnGPC } from "./domainlist.js";

// Firebase configuration, connects to Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyAhhtuwr4YOK_F0ZkULkKkFpyMC_5ZIaT4",
    authDomain: "gpc-privacy-choice.firebaseapp.com",
    projectId: "gpc-privacy-choice",
    storageBucket: "gpc-privacy-choice.appspot.com",
    messagingSenderId: "784749626516",
    appId: "1:784749626516:web:2c5a847289caab81d36081"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let db = firebase.firestore();

// Function used to create a user in the database
export async function createUser(schemeNumber){
    let userIP = await getIP();
    let crd = await getLocation();
    let longitude = crd.longitude ? crd.longitude : "unknown longitude";
    let latitude = crd.latitude ? crd.latitude : "unknown latitude";
    let date = new Date();
    // generate unique user document and storage the id into local storage
    const userDocument = db.collection("users").doc(); 
    chrome.storage.local.set({"USER_DOC_ID": userDocument.id, "UI_SCHEME": schemeNumber}, function(){
        // create the uers in the database
        db.collection("users").doc(userDocument.id).set({
            "User Agent": navigator.userAgent ? navigator.userAgent : "undefined",
            "DNT": navigator.doNotTrack ? 1 : 0,
            "IP Address": userIP,
            "Latitude": latitude, 
            "Longitude": longitude,
            "Browser": getBrowser(),
            "Rendering Engine": navigator.appVersion.includes("WebKit") ? "WebKit Engine" : "Other Rendering Engine",
            "OS": getOS(),
            "Plugins": getPlugins(),
            "Language": getLanguage(),
            "Time Zone": getTimeZone(),
            "First Party HTTP Cookies Enabled": getFirstPartyCookiesEnabled(),
            // "Third Party HTTP Cookies Enabled": getThirdPartyCookiesEnabled(),
            "Local Storage Enabled": getLocalStorageEnabled(),
            "Session Storage Enabled": getSessionStorageEnabled(),
            "Domain List": [],
            "UI Scheme" : schemeNumber,
            "Timestamp" : firebase.firestore.Timestamp.fromDate(date) 
        })
    });
}

// Function used to add user name, user email and user choices to the database
export async function userResgistration(prolificID, privacyChoice){
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        console.log("user id is: " + result.USER_DOC_ID)
        db.collection("users").doc(result.USER_DOC_ID).update({"Prolific ID":prolificID, "Privacy Choices": privacyChoice});
    })
}

// Add user entries into the Firebase
export function addHistory(referrer, site, GPC, applyALLBool, enabledBool, currentUserDocID, jsEnabled, tabId){
    let date = new Date()
    let url = new URL(site)
    db.collection("users").doc(currentUserDocID).collection("Browser History").add({
        "Timestamp": firebase.firestore.Timestamp.fromDate(date),
        "TabID": tabId,
        "Referer": referrer,
        "Current Site":  site,
        "GPC Current Site Status": GPC,
        "GPC Global Status": getGPCGlobalStatus(applyALLBool, enabledBool),
        "JS Enabled": jsEnabled
    })
}

// Adds user's Setting Interaction History
export function addSettingInteractionHistory(domain, originSite, currentUserDocID, setting, prevSetting, newSetting, universalSetting, location, subcollection){
    let date = new Date()
    if (subcollection === "Domain") {
        db.collection("users").doc(currentUserDocID).collection("Domain Interaction History").add({
            "Timestamp": firebase.firestore.Timestamp.fromDate(date),
            "Domain": domain,
            "Recorded Change": {
                "a) Title": setting,
                "b) Interaction": {
                    "i) Before": prevSetting,
                    "ii) After": newSetting
                }
            },
            "Universal Setting": universalSetting, 
            "Origin Site": originSite,
            "Location": location
        })
    }
    else if (subcollection === "Privacy Choice") {
        db.collection("users").doc(currentUserDocID).collection("Privacy Configuration Interaction History").add({
            "Timestamp": firebase.firestore.Timestamp.fromDate(date),
            "Domain": domain,
            "Recorded Change": {
                "a) Title": setting,
                "b) Interaction": {
                    "i) Before": prevSetting,
                    "ii) After": newSetting
                }
            },
            "Origin Site": originSite,
            "Location": location
        })
    }
}

// Add new domains to the domain list field of the user document
export function updateDomains(domainsList){
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        db.collection("users").doc(result.USER_DOC_ID).update({"Domain List": domainsList})
    })
}

// Put list of ad metwork domains into array
let adDomains;
const adDomainsFile= chrome.runtime.getURL("./adDomains.txt")
let xmlreq = new XMLHttpRequest()
xmlreq.open("GET", adDomainsFile, false) 
xmlreq.send()
adDomains = xmlreq.responseText.split("\n")

// Check if domain is in list of ad networks
function isAdNetwork(domain){
    return adDomains.includes(domain)
}

// Auxiliary function for getDomain function
function getHostName(url) {
    let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) return match[2];
    else return null;
}

// Get the top level domain from the url
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

// Add third party requests to browsing history document
export function addThirdPartyRequests(details){

    chrome.tabs.get(details.tabId, (tab)=>{
        let tabId=tab.id
        let url = tab.url;
        let url_object = new URL(url);
        let domain=getDomain(url_object.href)
        let date = new Date()
        let request_url_object = new URL(details.url)
        let initiator_object = new URL(details.initiator)
        let url_host = getDomain(request_url_object.href)
        let initiator_host = getDomain(initiator_object.href)
        if(isAdNetwork(initiator_host) && url_host!="firestore.googleapis.com"){
            chrome.storage.local.get(["USER_DOC_ID"], function(result){
                db.collection("users").doc(result.USER_DOC_ID).collection("Browser History")
                .where("TabID",'==', tabId).orderBy("Timestamp", "desc").limit(1)
                .get().then((docArray)=>{
                        docArray.forEach((doc)=>{
                            console.log(doc.id)
                            db.collection("users").doc(result.USER_DOC_ID).collection("Browser History").
                            doc(doc.id).collection("Third Party Requests").add({
                                "ad network": initiator_host,
                                "type": details.type,
                                "url": details.url,
                                "requestHeaders": details.requestHeaders,
                                "initiator": details.initiator,
                                "frameID": details.frameId,
                                "Timestamp": firebase.firestore.Timestamp.fromDate(date)
                            })
                        })
                })
            })
        }
    })
}

// Get GPC Global Status
function getGPCGlobalStatus(applyALLBool, enabledBool){
    if(applyALLBool) return enabledBool;
    else return "unset"
}

// Get the Browser
function getBrowser() {
    let browser = 'unknown';
    let ua = navigator.userAgent;
    if (window.chrome) {
        if ((ua.indexOf("Opera") || ua.indexOf('OPR')) != -1) browser = 'Opera';
        else if (ua.indexOf("Edge") != -1) browser = 'Edge';
        else if (ua.indexOf("Chrome") != -1) {
            browser = 'Chrome';
            if (navigator.brave != undefined) browser = 'Brave';
        }
    }
    return browser;
}


// Get the operating system of the user device
function getOS(){
    let OSName = "Unknown";
    if (window.navigator.userAgent.indexOf("Windows NT 10.0")!= -1) OSName="Windows 10";
    if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1) OSName="Windows 8.1";
    if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName="Windows 8";
    if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName="Windows 7";
    if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName="Windows Vista";
    if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName="Windows XP";
    if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName="Windows 2000";
    if (window.navigator.userAgent.indexOf("Mac")            != -1) OSName="Mac/iOS";
    if (window.navigator.userAgent.indexOf("X11")            != -1) OSName="UNIX";
    if (window.navigator.userAgent.indexOf("Linux")          != -1) OSName="Linux";
    return OSName;
}

// Get the plugins on the user's browser [will this change?]
function getPlugins(){
    let pluginArray = navigator.plugins;
    let plugins = [];
    for (let i in pluginArray){
        if (typeof pluginArray[i] == 'object'){
            plugins.push(pluginArray[i].name);
        }
    }
    return plugins;
}

// Get the language setting of the user's browser
function getLanguage(){
    return navigator.language;
}

// Get the time zone of the user
function getTimeZone(){
    let timeZone = new Date().toTimeString().slice(9);
    return timeZone;
}

// Get the FirstPartyCookiesEnabled status of the user
function getFirstPartyCookiesEnabled(){
    return navigator.cookieEnabled;
}

// Get the ThirdPartyCookiesEnabled status of the user
// Not sure about the API
function getThirdPartyCookiesEnabled(){
    return null;
}

// Get the user's IP address
async function getIP() {
    let ip = "unknown";
    let ipRegex = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
    await fetchIP('https://www.cloudflare.com/cdn-cgi/trace').then(data => {
        ip = data.match(ipRegex)[0];
    });
    return ip;
}

// Helper function for getting user IP 
function fetchIP(url) {
    return fetch(url).then(res => res.text());
}

// Get the user's local storage enable status
function getLocalStorageEnabled(){
    let test = 'test';
    try {
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// Get the user's session storage enable status
function getSessionStorageEnabled(){
    let test = 'test';
    try {
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
    } catch(e) {
        return false;
    }
}

// Get the user's location
async function getLocation(){
    let crd = "unknown";
    await requestLocation()
        .then(pos => crd = pos.coords)
        .catch(err => console.log(err))
    return crd;
}

// Helper function for getting user location
function requestLocation(){
    return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(
                pos => { resolve(pos); }, 
                err => { reject (err); });
    });
}

// Add ad interaction entry to database
function addAd(adEvent){
    console.log(adEvent)
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        db.collection("users").doc(result.USER_DOC_ID).collection("Browser History")
        .where("TabID",'==', adEvent.tabId).orderBy("Timestamp", "desc").limit(1)
        .get().then((docArray)=>{
            docArray.forEach((doc)=>{
                console.log(doc.id)
                db.collection("users").doc(result.USER_DOC_ID).collection("Browser History").
                doc(doc.id).collection("Ad Interactions").add({
                    adTabId: adEvent.targetTabId,
                    Timestamp: adEvent.timestamp,
                    adSource: adEvent.adSource,
                    adFrameId: adEvent.adFrameId,
                    "Initial Navigation to": adEvent.redirectionTo,
                    "Evidence of Ad Interaction":adEvent.reasoning
                })
                .then((adDoc)=>{
                    console.log(adEvent.targetTabId)
                    chrome.tabs.get(adEvent.targetTabId, (tab)=>{
                        db.collection("users").doc(result.USER_DOC_ID).collection("Browser History").
                        doc(doc.id).collection("Ad Interactions").doc(adDoc.id).update({"Ad Link": tab.url})})
                    adEvent.removeAdEvent()
                })
            })
        })
    })
}

let liveAdEvents={}

// Class for objects holding information on a potential ad interaction
class AdEvent {
    constructor(originTabId, targetTabId) {
      let date=new Date()
      this.tabId=originTabId
      this.targetTabId=targetTabId
      this.adFrameId=null;
      this.reasoning=null;
      this.adBool=false;
      this.timestamp= firebase.firestore.Timestamp.fromDate(date)
      liveAdEvents[targetTabId]=this
    }
    removeAdEvent(){
        delete liveAdEvents[this.tabId]
        delete this
    }
  }

// Listen for user opening a potential ad in a new tab 
chrome.webNavigation.onCreatedNavigationTarget.addListener((details)=>{
    let tabId=details.sourceTabId
    let targetTabID=details.tabId
    new AdEvent(tabId, targetTabID)
    liveAdEvents[targetTabID].adFrameId=details.sourceFrameId;
    chrome.webNavigation.getFrame(
    {tabId: details.sourceTabId, processId: details.souceProcessId, frameId: details.sourceFrameId},
    function(frame){
        let origin = getDomain(frame.url)
        liveAdEvents[targetTabID].adSource=origin
        let initialLoad=getDomain(details.url)
        liveAdEvents[targetTabID].redirectionTo=initialLoad
        if(adDomains.includes(origin) || adDomains.includes(initialLoad)){
            liveAdEvents[targetTabID].adBool=true;
            liveAdEvents[targetTabID].reasoning="navigation via ad network (highest confidence)"
        }
        else{
            chrome.tabs.sendMessage(tabId, {greeting: "GET HTML TAG"}, function(response) {
                console.log(response);
                if(response=='IFRAME') liveAdEvents[targetTabID].adBool=true;
                liveAdEvents[targetTabID].reasoning="linked from iFrame";
            });
        }
        
    })

})

// Listen for when navigation occurs 
// in case ads are not pop ups (open new tabs) this code would need to be fleshed out
// filter out navigations that did not occur via link 
chrome.webNavigation.onCommitted.addListener((e)=>{
    if(liveAdEvents[e.tabId]===undefined) new AdEvent(e.tabId, e.tabId)
    if(e.transitionType=='link'){
        console.log(liveAdEvents[e.tabId])
        if(liveAdEvents[e.tabId].adBool===true) addAd(liveAdEvents[e.tabId])
    }
    delete liveAdEvents[e.tabId]
})
