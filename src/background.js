/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

import { firebaseConfig } from "./config.js";
import { initializeApp } from "./firebase/firebase-app.js";
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, Timestamp, query, where, limit, orderBy, getDocs} from "./firebase/firebase-firestore.js";
import { getBrowser, getFirstPartyCookiesEnabled, getGPCGlobalStatus, getOS, getLocation, getPlugins, getLanguage, getLocalStorageEnabled, getSessionStorageEnabled, getTimeZone} from "./util.js";

// Connect with Database
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);



// Function used to create a user in the database
export async function createUser(prolificID, schemeNumber){
    let crd = await getLocation();
    let longitude = crd.longitude ? crd.longitude : "unknown longitude";
    let latitude = crd.latitude ? crd.latitude : "unknown latitude";
    let date = new Date();
    // generate unique user document and storage the id into local storage
    const newUserRef = doc(collection(db, "users"));
    console.log("new user reference created: ", newUserRef);
    chrome.storage.local.set({"USER_DOC_ID": newUserRef.id, "UI_SCHEME": schemeNumber}, function(){
      chrome.contentSettings.javascript.get({primaryUrl:"http:*"},function(details){
        const userData = {  "User Agent": navigator.userAgent ? navigator.userAgent : "undefined",
                            "DNT": navigator.doNotTrack ? 1 : 0,
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
                            "Timestamp" : Timestamp.fromDate(date), 
                            "JS Enabled" : details.setting, 
                            "Prolific ID" : prolificID
                          }
        setDoc(newUserRef, userData);})
})}

// Add users' browsing entries to firestore
export function addHistory(transitionType, site, GPC, applyALLBool, enabledBool, currentUserDocID, tabId, uiScheme, time, referer){
    console.log("addHistory function is triggered!")
    let date = new Date()
    if(referer!=site || referer===undefined){
        if(transitionType!="link"){
            referer="N/A"
        }
        if(referer===undefined){
            referer="not found"
        }
        if(GPC===undefined) {
            GPC="unset"
        }
        const newBrowserRef = doc(collection(db, "users", currentUserDocID, "Browser History"));
        const userData = { "Timestamp": Timestamp.fromDate(date),
                           "Referer": referer,
                           "TabID": tabId,
                           "Transition Type/Referer": transitionType,
                           "CurrentSite":  site,
                           "GPC Current Site Status": GPC,
                           "GPC Global Status": getGPCGlobalStatus(applyALLBool, enabledBool, uiScheme)
                          }
        setDoc(newBrowserRef, userData).then(() => {new ThirdPartyData(tabId, site, newBrowserRef.id, currentUserDocID)})
      }
}

// Adds users' setting interaction history to firestore
export function addSettingInteractionHistory(domain, originSite, currentUserDocID, setting, prevSetting, newSetting, universalSetting, location, subcollection){
    let date = new Date()
    const intDoc = doc(collection(db,"users", currentUserDocID, "Domain Interaction History"));
    if (subcollection === "Domain") {
        const intData = { "Timestamp": Timestamp.fromDate(date),
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
                        }
        setDoc(intDoc, intData)
    }
    else if (subcollection === "Privacy Choice") {
        const intData = { "Timestamp": Timestamp.fromDate(date), 
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
                        }
        setDoc(intDoc, intData)
    }
    else if(subcollection=="Choice Banner Mute"){
        const intData = { "Timestamp": Timestamp.fromDate(date),
                          "Domain": domain,
                          "Recorded Change": setting
                        }
        setDoc(intDoc, intData)
    }
}

// Add new domains to the domain list field of the user document
export function updateDomains(domainsList){
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
        if (result.USER_DOC_ID){
          const userRef = doc(db, "users", result.USER_DOC_ID);
          updateDoc(userRef, {
            "Domain List": domainsList
          });
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
        // console.log(disconnect)
        // console.log(disconnect, "good")
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
        // console.log(disconnectList)
      })

// Check if domain is in list of ad networks
function isInDisconnect(domain){
        if(Object.keys(disconnectList).includes(domain)){
            // console.log(true, disconnectList[domain])
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

//map tab and url to object containing third party request data for live sites
let allThirdPartyData={}

//class to locally store info on third party requests when a site is live
class ThirdPartyData{
    constructor(tabId, url, docId, userDocId){
        this.count=0
        this.sCollection = collection(db, "users", userDocId, "Browser History",
        docId, "Third Party Requests Summary")
        this.eCollection=collection(db, "users", userDocId, "Browser History",
        docId, "Third Party Requests (first 50)")
        if(allThirdPartyData[tabId]===undefined) allThirdPartyData[tabId]={}
        allThirdPartyData[tabId][url]= this
        this.thirdPartyDomains ={}
        for(let site of  Object.keys(allThirdPartyData[tabId])){
            if(site!=url){
                writeThirdPartyDataToDb(allThirdPartyData[tabId][site])
                delete allThirdPartyData[tabId][site]
            }
        }
    }

}

//write locally stored third party request summary data to db
function writeThirdPartyDataToDb(data){

    for(let d in Object.values(data.thirdPartyDomains)){
        let info = Object.values(data.thirdPartyDomains)[d]
        setDoc(doc(data.sCollection), info)
    }
}

//write info on a specific request to db
function writeRequestToDb(data, collection){
  console.log(data)
    setDoc(doc(collection),data)
}

// Attach addThirdPartyRequest function to record all the request made to the the thirdy party websites
chrome.webRequest.onSendHeaders.addListener(addThirdPartyRequests, {urls: ["<all_urls>"]},["requestHeaders"]);

// updates/create locally stored info on third party requests
function addThirdPartyRequests(details){
    console.log("add third party requests triggered!", details)
    if(details.tabId>=0){
        chrome.tabs.get(details.tabId, (tab)=>{ 
            if(tab!=undefined){
                let tabId =details.tabId
                let url
                if(details.frameId>0) url = frames[tabId][details.frameId]
                else url=tab.url
                let initiator_object = new URL(details.initiator)
                let initiator_host = getDomain(initiator_object.href)
                let url_object = new URL(url);
                let domain=getDomain(url_object.href)
                let request_url_object = new URL(details.url)
                let url_host = getDomain(request_url_object.href)
                if(isInDisconnect(initiator_host) && url_host!="firestore.googleapis.com" && initiator_host!=domain){
                    let network =disconnectList[initiator_host][1]
                    let networkCategory = disconnectList[initiator_host][0]
                    if(allThirdPartyData[tabId][url].count <50){
                        let data = {
                            Type: details.type,
                            URL: details.url,
                            RequestHeaders: details.requestHeaders,
                            Initiator: details.initiator,
                            FrameID: details.frameId,
                            Timestamp: details.timeStamp,
                            Site: url,
                            Domain: initiator_host,
                            Network: network,
                            NetworkCategory: networkCategory

                        }
                        writeRequestToDb(data, allThirdPartyData[tabId][url].eCollection)
                        allThirdPartyData[tabId][url].count+=1
                    }
                    let domainInfo = allThirdPartyData[tabId][url].thirdPartyDomains[initiator_host]
                    if(domainInfo==undefined) {
                        domainInfo ={
                            Domain: initiator_host,
                            RequestCount: 1,
                            Network: network,
                            NetworkCategory: networkCategory
                        }
                    }
                    else domainInfo["RequestCount"]+=1
                    allThirdPartyData[tabId][url].thirdPartyDomains[initiator_host]=domainInfo
                }
            }
        })
        
    }
}

// Add ad interaction entry to database
function addAd(adEvent){
    console.log(adEvent)
    // Create a query against the collection.
    chrome.storage.local.get(["USER_DOC_ID"], function(result){
      const historyRef = collection(db, "users", result.USER_DOC_ID, "Browser History");
      const q = query(historyRef, where("TabID",'==', adEvent.tabId), orderBy("Timestamp", "desc"), limit(1));
     getDocs(q).then((querySnapshot)=>
      querySnapshot.forEach((d) => {
                const newBrowserRef =collection(db, "users", result.USER_DOC_ID, "Browser History", d.id, "Ad Interactions");
                const userData = { 
                                  AdTabId: adEvent.targetTabId,
                                  Timestamp: adEvent.timestamp,
                                  AdSource: adEvent.adSource,
                                  AdFrameId: adEvent.adFrameId,
                                  "Initial Navigation to": adEvent.redirectionTo,
                                  "Evidence of Ad Interaction":adEvent.reasoning
                                  }
                addDoc(newBrowserRef, userData)
                  .then((adDoc)=>{
                      // console.log(adEvent.targetTabId)
                      const docRef = doc(db, "users", result.USER_DOC_ID, "Browser History", d.id, "Ad Interactions", adDoc.id);
                      const data = { "Timestamp": Timestamp.fromDate(date),
                                        "Referer": referer,
                                        "TabID": tabId,
                                        "Transition Type/Referer": transitionType,
                                        "CurrentSite":  site,
                                        "GPC Current Site Status": GPC,
                                        "GPC Global Status": getGPCGlobalStatus(applyALLBool, enabledBool, uiScheme)
                                        }
                      updateDoc(docRef, data);
                      adEvent.removeAdEvent()
                  })
              })
     )
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
      this.timestamp= date;
    //   firebase.firestore.Timestamp.fromDate(date)
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
        if(isInDisconnect(origin) && details.sourceFrameId!=0|| isInDisconnect(initialLoad) && (details.sourceFrameId!=0 || initialLoad!=origin)){
            liveAdEvents[targetTabID].adBool=true;
            liveAdEvents[targetTabID].reasoning="navigation via ad network (highest confidence)"
        }
        else{
            chrome.tabs.sendMessage(tabId, {greeting: "GET HTML TAG"}, function(response) {
                // console.log(response);
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
        // console.log(liveAdEvents[e.tabId])
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
        })   
    }
})

//function to remove information on frames that no longer exist
export function cleanFrames(tabId) {
    chrome.tabs.get(tabId, (tab)=>{
        if(tab!=undefined){
            let toRemove=[];
            let url = tab.url
            if (frames[tabId]!=undefined){
                for(let frame of  Object.keys(frames[tabId])){
                    // console.log(frame)
                    if(frames[tabId][frame] != url){
                        toRemove.push(frame)
                    }
                }
                sleep(1000).then(() => {
                    for(let frame in toRemove){
                        delete frames[tabId][toRemove[frame]]
                    }
                })
            }
        }  
    })
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
  }

chrome.tabs.onRemoved.addListener((tabId, removeInfo)=>{
  console.log(allThirdPartyData, tabId)
    for(let site of  Object.keys(allThirdPartyData[tabId])){
        writeThirdPartyDataToDb(allThirdPartyData[tabId][site])
        delete allThirdPartyData[tabId][site]
    }
    sleep(1000).then(() => {
        delete frames[tabId]
        delete referer[tabId]
      })
})


// original background.js section
// Initializers
let sendSignal = true;
let optout_headers = {};
let currentDomain = null;

// Fetching the networks dictionary
let networks;
let checkList = [];
let npsList = [];

// Store DOMAIN_LIST, ENABLED, and DOMAINLIST_ENABLED variables in cache for synchronous access: Make sure these are always in sync!
let enabledCache=true;
let domainsCache= {};
let domainlistEnabledCache=true;
let applyAllCache=false;


// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(async function (object) {
  // let userScheme = Math.floor(Math.random() * 7);
  let userScheme = 1;
  chrome.storage.local.set({MUTED: [false,undefined], ENABLED: true, APPLY_ALL: false, UV_SETTING: "Off", DOMAINLIST_ENABLED: true, DOMAINS: {},"UI_SCHEME": userScheme, "USER_DOC_ID": null}, function(){
    enable();
    if (userScheme == 0 || userScheme == 1 || userScheme == 2) {
      openPage("registration/registration.html");
    } else if (userScheme == 3){
      // parse the checklist needed for updating the sendSignals based on user's choice
      fetch("json/services.json")
      .then((response) => response.text())
      .then((result) => {
          networks = (JSON.parse(result))["categories"]
          for(let cat of ["Cryptomining", "FingerprintingInvasive", "FingerprintingGeneral"]) {
            for (let n of networks[cat]){
              for (let c of Object.values(n)){
                for (let list of Object.values(c)){
                  npsList = npsList.concat(list);
                }
              }
            }
          }
          for (let category of ["Advertising", "Analytics", "FingerprintingInvasive", "FingerprintingGeneral", "Cryptomining"]){
            for (let n of networks[category]){
              for (let c of Object.values(n)){
                for (let list of Object.values(c)){
                  checkList = checkList.concat(list);
                }
              }
            }
          }
          chrome.storage.local.set({CHECKLIST: checkList});
          chrome.storage.local.set({NPSLIST: npsList});})
      .then(openPage("registration/profile.html"));
    } else if (userScheme == 4) {
      openPage("registration/questionnaire.html");
    } else if (userScheme == 5) {
      fetch("json/services.json")
        .then((response) => response.text())
        .then((result) => {
          networks = (JSON.parse(result))["categories"]
          for(let cat of ["Cryptomining", "FingerprintingInvasive", "FingerprintingGeneral"]) {
            for (let n of networks[cat]){
              for (let c of Object.values(n)){
                for (let list of Object.values(c)){
                  npsList = npsList.concat(list);
                }
              }
            }
          }
          for (let category of ["Advertising", "Analytics", "FingerprintingInvasive", "FingerprintingGeneral", "Cryptomining"]){
            for (let n of networks[category]){
              for (let c of Object.values(n)){
                for (let list of Object.values(c)){
                  checkList = checkList.concat(list);
                }
              }
            }
          }
          chrome.storage.local.set({NPSLIST: npsList, CHECKLIST: checkList, SEND_SIGNAL_BANNER: 0, DO_NOT_SEND_SIGNAL_BANNER: 0, LEARNING: "In Progress"});
        })
        .then(openPage("registration/registration.html"))
    } else if (userScheme == 6) {
      openPage("registration/oneQuestion.html");
    } else {
      console.log("ERROR: Unknown scheme number!")
    }
  })
});

// Sets cache value to locally stored values after chrome booting up
chrome.storage.local.get(["DOMAINS", "ENABLED", 'DOMAINLIST_ENABLED', 'APPLY_ALL'], function (result){
  enabledCache=result.ENABLED;
  domainsCache=result.DOMAINS;
  domainlistEnabledCache=result.DOMAINLIST_ENABLED;
  applyAllCache=result.APPLY_ALL;
})

//dictionary that maps a TabId to the current url of the tab
//used to get the previous url (referer) when navigation occurs
let referer={}

// add user's browsing history to the database
chrome.webNavigation.onCommitted.addListener(function(details){
  chrome.tabs.get(details.tabId, (tab)=>{
    // console.log("details.frameId:", details.frameId)
    // console.log("tab: ", tab)
    // console.log("details.transitionType: ", details.transitionType)
    if(details.frameId==0 && tab!=undefined && details.transitionType!="reload"){
      cleanFrames(details.tabId)
      chrome.storage.local.get(["APPLY_ALL", "ENABLED", "USER_DOC_ID", "UI_SCHEME"], function(result){
        if (result.USER_DOC_ID){
          // console.log("Writting into the Browser History")
          addHistory(details.transitionType, details.url, domainsCache[getDomain(details.url)], result.APPLY_ALL, result.ENABLED, result.USER_DOC_ID, details.tabId, result.UI_SCHEME, details.timeStamp, referer[details.tabId]);
          referer[details.tabId]=details.url
        } else {
          console.log("Unregistered user: not connected to the database");
        }
      });
    }
    else {
      // console.log("Not writing browser history to the database!");
    }
  })
})

function addRule (domain, id){
  chrome.declarativeNetRequest.updateDynamicRules({addRules:[{
    "id" : id,
    "action" : { "type" : "modifyHeaders",
      "requestHeaders": [
          { "header": "Sec-GPC", "operation": "set", "value": "1" },
          { "header": "DNT", "operation": "set", "value": "1" }
        ]},
    "condition" : {
      "urlFilter" : "||^"+domain+"*"
    }
  }]
  })
  chrome.declarativeNetRequest.getDynamicRules((rules)=>console.log(rules))
  console.log("New Rule")
}
function rmRule (id){
  chrome.declarativeNetRequest.updateDynamicRules({removeRuleIds:[id]})
}

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "openOptions") { 
    chrome.runtime.openOptionsPage(() => {}) 
  }
  //create dynamic rule for domain
  if (request.greeting=="NEW RULE") addRule(result.d, result.id)
  //remove dynamic rule
  if (request.greeting=="RM RULE") rmRule(result.id)
  // update cache from contentScript.js
  if (request.greeting == "UPDATE CACHE") setCache(request.newEnabled, request.newDomains, request.newDomainlistEnabled, request.newApplyAll);
  // updates Setting Interaction History from contentScript.js and domainlist-view.js
  if (request.greeting == "INTERACTION") {
    chrome.storage.local.get( ["USER_DOC_ID", "ORIGIN_SITE"], function(result){
      let userDocID = result.USER_DOC_ID;
      let originSite = result.ORIGIN_SITE;
      if (result.USER_DOC_ID){
        // console.log("Adding into Doamin Interaction History")
        addSettingInteractionHistory(request.domain, originSite, userDocID, request.setting, request.prevSetting, request.newSetting, request.universalSetting, request.location, request.subcollection);
      } else {
        console.log("Unregistered user: not connected to the database");
      }
    })
  }
  if (request.greeting == "LEARNING COMPLETED"){
    chrome.storage.local.set({"LEARNING": "Just Finished"}, function(){
      let alreadyOpen = false;
      let extensionID = chrome.runtime.id;
      chrome.tabs.query({}, function(tabs) {
        for (let i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url===("chrome-extension://"+ extensionID + "/options/options.html")) {
              chrome.tabs.reload(tab.id, {}, function(){});
              chrome.tabs.update(tab.id, {active: true});
              alreadyOpen = true;
            }
        }
      });
      if (!alreadyOpen){
        chrome.runtime.openOptionsPage();
      }
    })
  }
});



// Enable the extenstion with default sendSignal set to true
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      // chrome.webRequest.onBeforeSendHeaders.addListener(addHeaders, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders", "blocking"]);
      chrome.storage.local.set({ ENABLED: true });
      // setCache(enabled=true)
    })
    .catch((e) => console.log(`Failed to intialize OptMeowt (JSON load process) (ContentScript): ${e}`));
}


// Function used to set the locally stored values in the cache upon change
function setCache(enabled='dontSet', domains='dontSet', domainlistEnabled='dontSet', applyAll='dontSet'){
  if(enabled!='dontSet') enabledCache=enabled;
  if(domains!='dontSet') {
    domainsCache=domains;
    updateDomains(Object.keys(domains));
  }
  if(domainlistEnabled!='dontSet') domainlistEnabledCache=domainlistEnabled;
  if(applyAll!='dontSet') applyAllCache=applyAll;
}


// Update the sendSignal boolean for the current page
async function updateSendSignal(tab){
  await chrome.storage.local.get(["UI_SCHEME"], async function (result) {
    let userScheme = result.UI_SCHEME;
    if (userScheme == 0 || userScheme == 1 || userScheme==2) updateSendSignalScheme1(tab);
    else if (userScheme == 3) updateSendSignalScheme3();
    else if (userScheme == 4) updateSendSignalScheme4();
    else if (userScheme == 5) updateSendSignalScheme5();
    else updateSendSignalScheme6();
  })
}

// SCHEME 0/1/2 : Banner
function updateSendSignalScheme1(tabId){
  if(domainlistEnabledCache){
      if(tabId<0) sendSignal=false
      else chrome.tabs.get(tabId, (tab)=>{ 
        let siteDomain=getDomain(tab.url)
        if (!(domainsCache[siteDomain]===undefined)) sendSignal=domainsCache[siteDomain]
        else{
          if (applyAllCache) sendSignal=enabledCache
          else sendSignal=false
        }
      })
  }else sendSignal = enabledCache
}

// SCHEME 4: Questionnaire
async function updateSendSignalScheme4(){
  if (currentDomain in domainsCache) sendSignal = domainsCache[currentDomain];
  else {
    await chrome.storage.local.get(["CHECKLIST", "CHECKNOTLIST", "USER_CHOICES"], function(result){
      if (result.CHECKLIST.includes(currentDomain)) sendSignal = true;
      else{
        if (result.USER_CHOICES["Others"] == true && (!(result.CHECKNOTLIST.includes(currentDomain)))) {
          sendSignal = true;
        }
      }
    })
  }
  // console.log("updated signal for " + currentDomain + " is " + sendSignal);
}

// SCHEME 3: Privacy Profile
async function updateSendSignalScheme3(){
  if (currentDomain in domainsCache) sendSignal = domainsCache[currentDomain];
  else {
    await chrome.storage.local.get(["CHECKLIST", "NPSLIST", "USER_CHOICES"], function(result){
      if (result.USER_CHOICES == "Low Privacy-Sensitivity"){
        if (result.NPSLIST.includes(currentDomain)) sendSignal = true;
      } else if (result.USER_CHOICES == "Medium Privacy-Sensitivity"){
        if (result.CHECKLIST.includes(currentDomain)) sendSignal = true;
      } else {
        sendSignal = true;
      }
    })
  }
  // console.log("updated signal for " + currentDomain + " is " + sendSignal);
}

// SCHEME 5: Machine Learning
async function updateSendSignalScheme5(){
  if(domainlistEnabledCache){
    if (!(domainsCache[currentDomain]===undefined)) sendSignal=domainsCache[currentDomain]
    else{
      if (applyAllCache) sendSignal=enabledCache
      else sendSignal=false
    }
  } else sendSignal = enabledCache

  await chrome.storage.local.get(["SEND_SIGNAL_BANNER", "DO_NOT_SEND_SIGNAL_BANNER"], function (result){
    let sendSignalBanner = result.SEND_SIGNAL_BANNER;
    let doNotSendSignalBanner = result.DO_NOT_SEND_SIGNAL_BANNER;
    if (sendSignalBanner + doNotSendSignalBanner == 5){
      chrome.storage.local.set({UI_SCHEME: 3, USER_CHOICES: "Low Privacy-Sensitivity"});
    }
  })
}

// SCHEME 6: Plain YES/NO to Privacy
async function updateSendSignalScheme6(){
  await chrome.storage.local.get(["USER_CHOICES"], function (result){
    if (result.USER_CHOICES == "Enable GPC") sendSignal = true;
    else sendSignal = false;
  })
}

// Add headers if the sendSignal to true
function addHeaders (details)  {
  currentDomain = getDomain(details.url);
  updateSendSignal(details.tabId);
  if (sendSignal) {
    console.log("adding GPC headers to " + currentDomain);
    for (let signal in optout_headers) {
      let s = optout_headers[signal];
      details.requestHeaders.push({ name: s.name, value: s.value });
    }
    return { requestHeaders: details.requestHeaders };
  } else {
    // console.log("not adding GPC headers to " + currentDomain);
    return { requestHeaders: details.requestHeaders };
  }
};

// Add dom signal if sendSignal to true
function addDomSignal (details)  {
  currentDomain = getDomain(details.url);
  updateSendSignal(details.tabId);
  if (sendSignal) {
    // console.log("addding GPC dom signals");
    // From DDG, regarding `Injection into non-html pages` on issue-128
    try { 
      const contentType = document.documentElement.ownerDocument.contentType
      // don't inject into xml or json pages
      if (contentType === 'application/xml' ||
          contentType === 'application/json' ||
          contentType === 'text/xml' ||
          contentType === 'text/json' ||
          contentType === 'text/rss+xml' || 
          contentType === 'application/rss+xml'
      ) return
    } catch (e) {}
    chrome.tabs.executeScript(details.tabId, {
      file: "dom.js",
      frameId: details.frameId, 
      runAt: "document_start",
    });
  }
  // console.log("Not adding GPC dom signals");
}

// Open the relevant page based on the schemes
function openPage(url){
    chrome.tabs.create({
      url: url,
      active: true
    });
}

// Set the ORIGIN_SITE property in local storage as current site url for option page
chrome.action.onClicked.addListener(function(tab) {
  let url = tab.url;
  chrome.storage.local.set({"ORIGIN_SITE": url}, ()=>{
    chrome.runtime.openOptionsPage(() => {
      openPage("options/options.html");
    });
  });
});





// Create Persistent Service Worker
// code from https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension/66618269#66618269
let lifeline;

keepAlive();

chrome.runtime.onConnect.addListener(port => {
  if (port.name === 'keepAlive') {
    lifeline = port;
    setTimeout(keepAliveForced, 295e3); // 5 minutes minus 5 seconds
    port.onDisconnect.addListener(keepAliveForced);
  }
});

function keepAliveForced() {
  lifeline?.disconnect();
  lifeline = null;
  keepAlive();
}

async function keepAlive() {
  if (lifeline) return;
  for (const tab of await chrome.tabs.query({ url: '*://*/*' })) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => chrome.runtime.connect({ name: 'keepAlive' }),
        // `function` will become `func` in Chrome 93+
      });
      chrome.tabs.onUpdated.removeListener(retryOnTabUpdate);
      return;
    } catch (e) {}
  }
  chrome.tabs.onUpdated.addListener(retryOnTabUpdate);
}

async function retryOnTabUpdate(tabId, info, tab) {
  if (info.url && /^(file|https?):/.test(info.url)) {
    keepAlive();
  }
}