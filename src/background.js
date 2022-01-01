/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

import { firebaseConfig } from "./config.js";
import {addHistory, updateDomains, addSettingInteractionHistory, cleanFrames} from "./firebase.js"

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
  //let userScheme = Math.floor(Math.random() * 4);
  let userScheme = 1;
  chrome.storage.local.set({MUTED: [false,undefined], ENABLED: true, APPLY_ALL: false, UV_SETTING: "Off", DOMAINLIST_ENABLED: true, DOMAINS: {},"UI_SCHEME": userScheme, "USER_DOC_ID": null}, function(){
    enable();
    if (userScheme == 0 || userScheme == 1 || userScheme == 2) {
      openPage("registration.html");
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
      .then(openPage("profile.html"));
    } else if (userScheme == 4) {
      openPage("questionnaire.html");
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
        .then(openPage("registration.html"))
    } else {
      openPage("oneQuestion.html");
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

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request === "openOptions") { 
    chrome.runtime.openOptionsPage(() => {}) 
  }
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

// Set the ORIGIN_SITE property in local storage as current site url for option page
chrome.browserAction.onClicked.addListener(function(tab) {
  let url = tab.url;
  chrome.storage.local.set({"ORIGIN_SITE": url}, ()=>{
    chrome.runtime.openOptionsPage(() => {});
  });
});

// Enable the extenstion with default sendSignal set to true
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      chrome.webRequest.onBeforeRequest.addListener(addDomSignal, {urls: ["<all_urls>"]}, ["blocking"]);
      chrome.webRequest.onBeforeSendHeaders.addListener(addHeaders, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders", "blocking"]);
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
    // console.log("adding GPC headers to " + currentDomain);
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

// Function used to get the hostname from the current url
function getHostName(url) {
  let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) return match[2];
  else return null;
}

// Function used to get the top level domain for the current url
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

// Open the relevant page based on the schemes
function openPage(url){
    chrome.tabs.create({
      url: url,
      active: true
    });
}