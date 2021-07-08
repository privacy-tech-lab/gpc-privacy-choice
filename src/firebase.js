// Firebase configuration, connects to Firebase project
const firebaseConfig = {
    apiKey: "AIzaSyDDaReuI_p2gS2e-4j6B_JdFk4Lf1gkN88",
    authDomain: "privacy-choice-research.firebaseapp.com",
    projectId: "privacy-choice-research",
    storageBucket: "privacy-choice-research.appspot.com",
    messagingSenderId: "23402940855",
    appId: "1:23402940855:web:1ee3c7bc69ffdb51b04032",
    measurementId: "G-L6EWBVR01J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let currentUserID;

// Function used to create a user in the database
export async function createUser(){
    let db=firebase.firestore();
    //get largest user ID being used
    let largestUserID;
    await db.collection("largestUserID").doc("largestID").get().then((doc)=>{
        if(doc.exists){
            largestUserID=doc.data().id
            currentUserID=largestUserID+1
            chrome.storage.local.set({"USER_ID":currentUserID })
            db.collection("largestUserID").doc("largestID").set({
                id: currentUserID
            })
        }
        else{
            currentUserID=1;
            chrome.storage.local.set({"USER_ID":currentUserID })
            db.collection("largestUserID").doc("largestID").set({
                id: 1
            })
        }
    })

    db.collection("users").add({
        "User ID": currentUserID,
        browser: getBrowser(),
        "Browser Engine": getBrowserEngine(),
        OS: getOS(),
        plugins: getPlugins(),
        language: getLanguage(),
        "Time Zone": getTimeZone(),
        "JS Enabled": getJSEnabled(),
        "First Party HTTP Cookies Enabled": getFirstPartyCookiesEnabled(),
        "Third Party HTTP Cookies Enabled": getThirdPartyCookiesEnabled(),
        "Domain List": getDomainList(),
        "UI Scheme": getUIscheme()
    })
}

// Add user entries into the Firebase
export function addHistory(site, GPC, applyALLBool, enabledBool, currentUserID){
    let db = firebase.firestore();
    let docID;
    let date = new Date()
    console.log(currentUserID)
    console.log(db.collection("users").where("User ID", "==", currentUserID))
    db.collection("users").where("User ID", "==", currentUserID).get()
        .then((docArray)=>{docArray.forEach((doc)=>{
                docID = doc.id
                console.log(docID)
            })
        })
        .then(()=>{
            db.collection("users").doc(docID).collection("Browser History").add({
                "User ID": currentUserID,
                date: date.toLocaleDateString(),
                time: date.toLocaleTimeString(),
                "Browsing History Entry ID": getHistoryEntryID(),
                "Tab ID": getTabID(),
                "Referer": null,
                "Current Site":  site,
                "GPC Current Site Status": GPC,
                "GPC Global Status": getGPCGlobalStatus(applyALLBool, enabledBool)
        })
    })
}

// Get GPC Global Status
function getGPCGlobalStatus(applyALLBool, enabledBool){
    if(applyALLBool) return enabledBool;
    else return "unset"
}

// Get the current tab ID
function getTabID(){
    return null
}

// 
function getHistoryEntryID(){
    return null
}

// Get the browser version
// Chrome broswer usually is in the format of Chrome: "Chrome/81.0.4044.138 Safari/537.36" in UserAgent
function getBrowser(){
    let browser = "Chrome/"; 
    let version;
    let ua = navigator.userAgent;
    if (!ua.includes('Chrome/')){
        return "N.A."
    } else {
        version = ua.split("Chrome/")[1];
    }
    return browser + version;
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
    console.log("plugins are: " + plugins);
    return plugins;
}

// Get the language setting of the user's browser
function getLanguage(){
    return navigator.language;
}

// Get the time zone of the user
function getTimeZone(){
    // let timeZone = new Date().toTimeString().slice(9);
    // return timeZone;
    return null;
}

// Get the JS enabled stats of the user
function getJSEnabled(){
    return null;
}

// Get the FirstPartyCookiesEnabled status of the user
function getFirstPartyCookiesEnabled(){
    return null;
}

// Get the ThirdPartyCookiesEnabled status of the user
function getThirdPartyCookiesEnabled(){
    return null;
}

// Get the domain list from the user browser local storage
function getDomainList(){
    return null;
}

// Get the scheme that the user is currently presented it
function getUIscheme(){
    return currentUserID%5;
}