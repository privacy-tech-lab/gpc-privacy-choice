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
export async function createUser(prolificID, schemeNumber){
    let userIP = await getIP();
    let crd = await getLocation();
    let longitude = crd.longitude ? crd.longitude : "unknown longitude";
    let latitude = crd.latitude ? crd.latitude : "unknown latitude";
    let date = new Date();
    let jsEnabled = null;
    // generate unique user document and storage the id into local storage
    const userDocument = db.collection("users").doc(); 
    chrome.storage.local.set({"USER_DOC_ID": userDocument.id, "UI_SCHEME": schemeNumber}, function(){
        // create the uers in the database
        chrome.contentSettings.javascript.get({primaryUrl:"http:*"},function(details){
            jsEnabled = details.setting; 
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
                "Cookies Enabled": getFirstPartyCookiesEnabled(),
                "Local Storage Enabled": getLocalStorageEnabled(),
                "Session Storage Enabled": getSessionStorageEnabled(),
                "Domain List": [],
                "UI Scheme" : schemeNumber,
                "Timestamp" : firebase.firestore.Timestamp.fromDate(date), 
                "JS Enabled" : jsEnabled, 
                "Prolific ID" : prolificID
            })
        })
    });
}

// Add user entries into the Firebase
export function addHistory(transitionType, site, GPC, applyALLBool, enabledBool, currentUserDocID, tabId, time){
    let date = new Date();
    db.collection("users").doc(currentUserDocID).collection("Browser History").add({
        "Timestamp": time,
        "TabID": tabId,
        "Transition Type": transitionType,
        "CurrentSite":  site,
        "GPC Current Site Status": GPC,
        "GPC Global Status": getGPCGlobalStatus(applyALLBool, enabledBool)
    })
}


// Adds user's Setting Interaction History
export function addSettingInteractionHistory(domain, originSite, currentUserDocID, setting, prevSetting, newSetting, universalSetting, location, subcollection){
    let date = new Date()
    console.log(subcollection)
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
    else if(subcollection=="Choice Banner Mute"){
        db.collection("users").doc(currentUserDocID).collection("Mute Interaction History").add({
            "Timestamp": firebase.firestore.Timestamp.fromDate(date),
            "Domain": domain,
            "Recorded Change": setting
        })
    }
}

// Add new domains to the domain list field of the user document
export function updateDomains(domainsList){
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        if (result.USER_DOC_ID){
            db.collection("users").doc(result.USER_DOC_ID).update({"Domain List": domainsList})
        } else {
            console.log("Unregistered user: not connected to the database");
        }
    })
}

// Put list of disconnect domains into array

let disconnectList={};
let disconnect;
fetch("json/services.json")
      .then((response) => response.text())
      .then((result) => {
        disconnect = JSON.parse(result)
        console.log(disconnect)
console.log(disconnect, "good")
for(let c of Object.keys(disconnect['categories']))
    for(let network of Object.values(disconnect['categories'][c])){
        for(let domain of Object.values(network)){
            let domains=Object.values(domain)[0]
            for(let d of domains){
                if(Object.keys(disconnectList).includes(d)) disconnectList[d][0].push(c) 
                else disconnectList[d]=[[c], Object.keys(network)[0]]
            }
        }
    }
console.log(disconnectList)
      })
// Check if domain is in list of ad networks
function isInDisconnect(domain){
        if(Object.keys(disconnectList).includes(domain)){
            console.log(true, disconnectList[domain])
            return true;
        }
        else return false;
            // if(i.includes(domain))
            // console.log(Object.keys(c))
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

// TO DO: Structure for holding third party requests while they are live
let liveRequests={}

// TO DO Class for objects holding information on third party requests
class ThirdPartyRequest {
    constructor(details, url) {
      this.requestId=details.requestId;
      this.url= url;
      this.timestamp= details.timeStamp;
      liveRequests[this.requestId]=this
    }
    removeRequestEvent(){
        console.log("deleting", liveRequests[this.requestId])
        delete liveRequests[this.requestId]
        delete this
        console.log("deleted", liveRequests[this.requestId])
    }
  }

// Attach addThirdPartyRequest function to record all the request made to the the thirdy party websites
chrome.webRequest.onSendHeaders.addListener(addThirdPartyRequests, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(function (details){
    if(liveRequests[details.requestId]===undefined){
        chrome.tabs.get(details.tabId, (tab)=>{
        let url = tab.url;
        new ThirdPartyRequest(details, url);
        })
    } 
    
}, {urls: ["<all_urls>"]}
);

chrome.webRequest.onErrorOccurred.addListener((details)=>{
    liveRequests[details.requestId].removeRequestEvent()
}, {urls: ["<all_urls>"]}
);
chrome.webRequest.onCompleted.addListener((details)=>{
    liveRequests[details.requestId].removeRequestEvent()
}, {urls: ["<all_urls>"]}
);


// Add third party requests to browsing history document
export function addThirdPartyRequests(details){
    chrome.tabs.get(details.tabId, (tab)=>{
        console.log(liveRequests)
        let tabId=details.tabId
        let date = liveRequests[details.requestId].timestamp
        let url
        if(details.frameId>0) url = frames[tabId][details.frameId]
        else url=tab.url
        let url_object = new URL(url);
        let domain=getDomain(url_object.href)
        let request_url_object = new URL(details.url)
        let initiator_object = new URL(details.initiator)
        let url_host = getDomain(request_url_object.href)
        let initiator_host = getDomain(initiator_object.href)
        console.log(url_object.href)
        if(isInDisconnect(initiator_host) && url_host!="firestore.googleapis.com" && initiator_host!=domain){
            chrome.storage.local.get(["USER_DOC_ID"], function(result){
                if (result.USER_DOC_ID){
                    db.collection("users").doc(result.USER_DOC_ID).collection("Browser History")
                    .where("TabID",'==', tabId).where("CurrentSite",'==', url).where("Timestamp","<=",date).orderBy("Timestamp", "desc").limit(1)
                    .get().then((docArray)=>{
                            docArray.forEach((doc)=>{
                                db.collection("users").doc(result.USER_DOC_ID).collection("Browser History").
                                doc(doc.id).collection("Third Party Requests").add({
                                    "Domain": initiator_host,
                                    "Network": disconnectList[initiator_host][1],
                                    "NetworkCategory": disconnectList[initiator_host][0],
                                    "Type": details.type,
                                    "URL": details.url,
                                    "RequestHeaders": details.requestHeaders,
                                    "Initiator": details.initiator,
                                    "FrameID": details.frameId,
                                    "Timestamp": date,
                                    "Site": url
                                })
                            })
                    })
                } else {
                    console.log("Unregistered user: not connected to the database");
                }          
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
                    AdTabId: adEvent.targetTabId,
                    Timestamp: adEvent.timestamp,
                    AdSource: adEvent.adSource,
                    AdFrameId: adEvent.adFrameId,
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
        if(isInDisconnect(origin) || isInDisconnect(initialLoad)){
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

//structure to map frames to urls
let frames= {}

chrome.webNavigation.onCommitted.addListener((details)=>{
    if((details.transitionType=="auto_subframe" || details.transitionType=="manual_subframe") && details.frameId>0 && details.tabId>0){
        chrome.tabs.get(details.tabId, (tab)=>{
            if(frames[details.tabId]===undefined) frames[details.tabId]={}
            frames[details.tabId][details.frameId]= tab.url
            console.log(frames, details.frameId)
        })   
    }
})

//function to remove information on frames that no longer exist
export function cleanFrames(tabId) {
    chrome.tabs.get(tabId, (tab)=>{
        let toRemove=[];
        let url = tab.url
        for(let frame of  Object.keys(frames[tabId])){
            console.log(frame)
            if(frames[tabId][frame] != url){
                toRemove.push(frame)
            }
        }
        sleep(1000).then(() => {
            for(let frame in toRemove){
                delete frames[tabId][toRemove[frame]]
            }
          })
        })
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

chrome.tabs.onRemoved.addListener((tabId, removeInfo)=>{
    sleep(1000).then(() => {
        delete frames[tabId]
      })
})
