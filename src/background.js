/*
OptMeowt-Research is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

import {createUser, addHistory, updateDomains, addSettingInteractionHistory, addThirdPartyRequests} from "./firebase.js"

// Initializers
let sendSignal = false;
let optout_headers = {};
let currentHostname = null;

// Fetching the networks dictionary
let networks;
let checkList = [];

console.log(typeof networks);

// Store DOMAIN_LIST, ENABLED, and DOMAINLIST_ENABLED variables in cache for synchronous access: Make sure these are always in sync!
let enabledCache=true;
let domainsCache= {};
let domainlistEnabledCache=true;
let applyAllCache=false;

// Attach addThirdPartyRequest function to record all the request made to the the thirdy party websites
chrome.webRequest.onSendHeaders.addListener(addThirdPartyRequests, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders"]);

// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(async function (object) {
  chrome.storage.local.set({ENABLED: true});
  chrome.storage.local.set({APPLY_ALL: false});
  chrome.storage.local.set({UV_SETTING: "Off"});
  chrome.storage.local.set({DOMAINLIST_ENABLED: true});
  chrome.storage.local.set({FIRST_INSTALLED: true});
  chrome.storage.local.set({DOMAINS: {}});
  enable();
  let min = 1; 
  let max = 4;
  //let userScheme = Math.floor(Math.random() * (max - min + 1)) + min;
  let userScheme = 2;
  if (userScheme == 1){
    openPage("registration.html");
    // this scheme will be the core scheme, nothing should happen here with the current implementation
  } else if (userScheme == 2){
    // this scheme will show the user a questionnaire at the beginning of implementation
    fetch("json/services.json")
      .then((response) => response.text())
      .then((result) => {
        networks = (JSON.parse(result))["categories"]
      })
      .then(openPage("questionnaire.html"));
  } else if (userScheme == 3){
    // this scheme will show the user a profile page which they would identify themselves with
    fetch("json/services.json")
      .then((response) => response.text())
      .then((result) => {
        networks = (JSON.parse(result))["categories"]
        for (let n of networks["Advertising"]){
          for (let c of Object.values(n)){
            for (let list of Object.values(c)){
              checkList = checkList.concat(list);
            }
          }
        }
      })
      .then(openPage("profile.html"));
  } else {
    openPage("registration.html");
    // this scheme is not implemented at the moment, behaving exactly like the first scheme 
  }
  await createUser(userScheme); 
});

// Sets cache value to locally stored values after chrome booting up
chrome.storage.local.get(["DOMAINS", "ENABLED", 'DOMAINLIST_ENABLED', 'APPLY_ALL'], function (result){
  enabledCache=result.ENABLED;
  domainsCache=result.DOMAINS;
  domainlistEnabledCache=result.DOMAINLIST_ENABLED;
  applyAllCache=result.APPLY_ALL;
})

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  // disable the extension if get message DISABLE_ALL
  if (request.message == "DISABLE_ALL") disable();
  // add user's browsing history to the database
  if (request.greeting == "NEW PAGE"){
    let jsEnabled = null;
    chrome.contentSettings.javascript.get({primaryUrl:"http:*"},function(details){
      jsEnabled = details.setting; 
      chrome.storage.local.get(["APPLY_ALL", "ENABLED", "USER_DOC_ID"], function(result){
        addHistory(request.referrer, request.site, sendSignal, result.APPLY_ALL, result.ENABLED, result.USER_DOC_ID, jsEnabled, sender.tab.id);
      })
    });
  }
  // update cache from contentScript.js
  if (request.greeting == "OPEN OPTIONS") chrome.runtime.openOptionsPage(() => {});
  if (request.greeting == "UPDATE CACHE") setCache(request.newEnabled, request.newDomains, request.newDomainlistEnabled, request.newApplyAll);
  //updates Setting Interaction History from contentScript.js and domainlist-view.js
  if (request.greeting == "INTERACTION") {
    chrome.storage.local.get( ["USER_DOC_ID", "ORIGIN_SITE"], function(result){
      let userDocID = result.USER_DOC_ID;
      let originSite = result.ORIGIN_SITE;
      addSettingInteractionHistory(request.domain, originSite, userDocID, request.setting, request.prevSetting, request.newSetting, request.universalSetting);
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

// Enable the extenstion
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      chrome.webRequest.onBeforeRequest.addListener(addDomSignal, {urls: ["<all_urls>"]});
      chrome.webRequest.onBeforeSendHeaders.addListener(addHeaders, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders", "blocking"]);
      chrome.storage.local.set({ ENABLED: true });
      setCache(enabled=true)
    })
    .catch((e) => console.log(`Failed to intialize OptMeowt (JSON load process) (ContentScript): ${e}`));
  sendSignal = true;
}

// Disable the extension
const disable = () => {
  optout_headers = {};
  chrome.webRequest.onBeforeRequest.removeListener(addDomSignal);
  chrome.webRequest.onBeforeSendHeaders.removeListener(addHeaders);
  chrome.storage.local.set({ ENABLED: false });
  setCache(enabled=false)
  sendSignal = false;
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
function updateSendSignalandDomain(){
  // update current domain
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    let url = tabs[0].url;
    let domain = getDomain(url);
    currentHostname = domain;
  });
  
  // Update the sendSignal boolean based on the UI Scheme we are using
  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    let userScheme = result.UI_SCHEME;
    if (userScheme == 1){
      updateSendSignalScheme1();
    } else if (userScheme == 2){
      updateSendSignalScheme2();
    } else if (userScheme == 3){
      updateSendSignalScheme3();
    } else {
      updateSendSignalScheme4();
    }
  })
}

// UI Scheme 1 
function updateSendSignalScheme1(){
  if(domainlistEnabledCache){
    if (!(domainsCache[currentHostname]===undefined)) sendSignal=domainsCache[currentHostname]
    else{
      if (applyAllCache) sendSignal=enabledCache
      else sendSignal=false
    }
  } else sendSignal = enabledCache
}

// TODO
function updateSendSignalScheme2(){
  chrome.storage.local.get(["USER_CHOICES"], function (result) {
    //If Others is chosen, start by opting in for all then check each category and change as needed
    if ("Others" in result.USER_CHOICES) {
      sendSignal = true;
      if (domainsCache[currentHostname] == false) sendSignal = false;
      if ("Advertising" in result.USER_CHOICES) {

      }
      if ("Crypto-Mining" in result.USER_CHOICES) {
        
      }
      if ("Analytics" in result.USER_CHOICES) {
        
      }
      if ("Fingerprinting" in result.USER_CHOICES) {
        
      }
      if ("Social" in result.USER_CHOICES) {
        
      }
    }
    else {
          //If Others is chosen, start by opting out for all then check each category and change as needed
      sendSignal = false;
      if (domainsCache[currentHostname] == true) sendSignal = true;
      if ("Advertising" in result.USER_CHOICES) {

      }
      if ("Crypto-Mining" in result.USER_CHOICES) {
        
      }
      if ("Analytics" in result.USER_CHOICES) {
        
      }
      if ("Fingerprinting" in result.USER_CHOICES) {
        
      }
      if ("Social" in result.USER_CHOICES) {
        
      }
    }
  })
}

// TODO
function updateSendSignalScheme3(){
  chrome.storage.local.get(["USER_PROFILE"], function (result) {
    let userProfile = result.USER_PROFILE;
    if (userProfile === "Extremely Privacy-Sensitive") {
      // send GPC to all domains unless the domain is in the domain list and it is set to false
      sendSignal = true;
      if (domainsCache[currentHostname] == false) sendSignal = false;
    }
    else if (userProfile === "Not Privacy-Sensitive") {
      // do not send GPC to any domains unless the domain is in the domain list and it is set to true
      sendSignal = false;
      if (domainsCache[currentHostname] == true) sendSignal = true;
    }
    else {
      sendSignal = false;
      if (checkList.includes(currentHostname)) {
        console.log("Found Ads Network");
        sendSignal = true;
      }
      if (domainsCache[currentHostname] == false) sendSignal = false;
    }
  })
}


// TODO
function updateSendSignalScheme4(){}

// Add headers if the sendSignal to true
function addHeaders (details)  {
  updateSendSignalandDomain()
  if (sendSignal) {
    for (let signal in optout_headers) {
      let s = optout_headers[signal];
      details.requestHeaders.push({ name: s.name, value: s.value });
    }
    return { requestHeaders: details.requestHeaders };
  } else {
    return { requestHeaders: details.requestHeaders };
  }
};

// Add dom signal if sendSignal to true
function addDomSignal (details)  {
  updateSendSignalandDomain();
  if (sendSignal) {
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