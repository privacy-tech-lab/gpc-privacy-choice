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

// Function used to create a user in the database
export async function createUser(){
    let db = firebase.firestore();
    let schemeNumber;
    let userIP = await getIP();
    let crd = await getLocation();
    let longitude = crd.longitude ? crd.longitude : "unknown longitude";
    let latitude = crd.latitude ? crd.latitude : "unknown latitude";
    let date = new Date();
    await db.collection("users").get().then(querySnapshot => schemeNumber = (querySnapshot.docs.length % 4) + 1);
    // generate unique user document and storage the id into local storage
    const userDocument = db.collection("users").doc(); 
    chrome.storage.local.set({"USER_DOC_ID": userDocument.id, "UI_SCHEME": schemeNumber}, function(){
        // create the uers in the database
        db.collection("users").doc(userDocument.id).set({
            "User Agent": navigator.userAgent ? navigator.userAgent : "undefined",
            "DNT": navigator.doNotTrack ? navigator.userAgent : "undefined",
            "IP Address": userIP,
            "Latitude": latitude, 
            "Longitude": longitude,
            "Browser": getBrowser(),
            "Browser Engine": getBrowserEngine(),
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

// Add user entries into the Firebase
export function addHistory(referrer, site, GPC, applyALLBool, enabledBool, currentUserDocID, jsEnabled, tabId){
    let db = firebase.firestore();
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
export function addSettingInteractionHistory(domain, orginSite, currentUserDocID, setting, prevSetting, newSetting, universalSetting){
    let db = firebase.firestore();
    let date = new Date()
    db.collection("users").doc(currentUserDocID).collection("Setting Interaction History").add({
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
        "Origin Site": orginSite
    })
}

// Add new domains to the domain list field of the user document
export function updateDomains(domainsList){
    let db = firebase.firestore();
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        db.collection("users").doc(result.USER_DOC_ID).update({"Domain List": domainsList})
    })
}

// Add third party requests to browsing history document
export function addThirdPartyRequests(details){
    function getHostName(url) {
        let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) return match[2];
        else return null;
    }

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

    chrome.tabs.get(details.tabId, (tab)=>{
        let tabId=tab.id
        let url = tab.url;
        let url_object = new URL(url);
        let domain=getDomain(url_object.href)
        let date = new Date()
        let db = firebase.firestore();
        let request_url_object = new URL(details.url)
        let initiator_object = new URL(details.initiator)
        let url_host = getDomain(request_url_object.href)
        let initiator_host = getDomain(initiator_object.href)
        console.log(domain)
        if(initiator_host!=url_host && initiator_host!=domain && url_host!="firestore.googleapis.com"){
            chrome.storage.local.get(["USER_DOC_ID"], function(result){
                db.collection("users").doc(result.USER_DOC_ID).collection("Browser History")
                .where("TabID",'==', tabId).orderBy("timestamp", "desc").limit(1)
                .get().then((docArray)=>{
                        docArray.forEach((doc)=>{
                            console.log(doc.id)
                            db.collection("users").doc(result.USER_DOC_ID).collection("Browser History").
                            doc(doc.id).collection("Third Party Requests").add({
                                "type": details.type,
                                "url": details.url,
                                "requestHeaders": details.requestHeaders,
                                "initiator": details.initiator,
                                "frameID": details.frameId,
                                "timestamp": firebase.firestore.Timestamp.fromDate(date)
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

// Get the browser engine version
function getBrowserEngine(){
    return null
}

// Get the operating system of the user device
// Used the navigator platform as user OS
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

// helper function for getting user IP 
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

// helper function for getting user location
function requestLocation(){
    return new Promise(function(resolve, reject) {
            navigator.geolocation.getCurrentPosition(
                pos => { resolve(pos); }, 
                err => { reject (err); });
    });
}