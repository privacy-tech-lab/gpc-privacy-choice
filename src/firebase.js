
//browser extension's Firebase configuration, connects to Firebase project
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





var currentUserID;
export async function createUser(){
    var db=firebase.firestore();
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


export function addHistory(site, GPC, applyALLBool, enabledBool, currentUserID){
    let db=firebase.firestore();
    // chrome.storage.local.get(["USER_ID"], function(result){
        // let currentUserID=result.USER_ID
        let docID;
        let date=new Date()
        console.log(currentUserID)
        console.log(db.collection("users").where("User ID", "==", currentUserID))
        db.collection("users").where("User ID", "==", currentUserID).get()
            .then((docArray)=>{
                docArray.forEach((doc)=>{
                    docID=doc.id
                    console.log(docID)
                })})     
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
    // })
}


function getGPCGlobalStatus(applyALLBool, enabledBool){
        if(applyALLBool) return enabledBool;
        else return "unset"
      }

function getTabID(){
    return null
}

function getHistoryEntryID(){
    return null
}

function getBrowser(){
    return null
}

function getBrowserEngine(){
    return null
}

function getOS(){
    return null
}

function getPlugins(){
    return null;
}

function getLanguage(){
    return null;
}

function getTimeZone(){
    return null;
}

function getJSEnabled(){
    return null;
}

function getFirstPartyCookiesEnabled(){
    return null;
}

function getThirdPartyCookiesEnabled(){
    return null;
}

function getDomainList(){
    return null;
}

function getUIscheme(){
    return currentUserID%5;
}