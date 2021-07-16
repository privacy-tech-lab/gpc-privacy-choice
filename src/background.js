// background.js is the main background script handling OptMeowt's main opt-out functionality

import {createUser, addHistory, updateDomains, addSettingInteractionHistory, addThirdPartyRequests} from "./firebase.js"

chrome.webRequest.onSendHeaders.addListener(addThirdPartyRequests, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders"]);

// Initializers
let sendSignal = false;
let optout_headers = {};
let currentHostname = null;

// Store DOMAIN_LIST, ENABLED, and DOMAINLIST_ENABLED variables in cache for synchronous access
// Make sure these are always in sync!
let enabledCache=true;
let domainsCache= {};
let domainlistEnabledCache=true;
let applyAllCache=false;


// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.local.set({ENABLED: true});
  chrome.storage.local.set({APPLY_ALL: false});
  chrome.storage.local.set({DOMAINLIST_ENABLED: true});
  chrome.storage.local.set({FIRST_INSTALLED: true});
  chrome.storage.local.set({DOMAINS: {}});
  enable();
  createUser().then(
    chrome.storage.local.get(["UI_SCHEME"], function(result){

      //SCHEME B: automatically open up the pop up page + provide a tour
      if(result.UI_SCHEME==2){
        chrome.runtime.openOptionsPage(() => {
        })
      } else {
        // Other schemes: disable the tour setting
        chrome.storage.local.set({FIRST_INSTALLED: false});
      }
    })
  );
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
  if (request.greeting == "ENABLE") sendResponse({farewell: "goodbye"});
  if (request.message == "DISABLE_ALL") disable();
  if (request.greeting == "NEW PAGE"){
    let jsEnabled = null;
    let tabId = null;
    chrome.contentSettings.javascript.get({primaryUrl:"http:*"},function(details){
      jsEnabled = details.setting; 
      chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
        tabId = tabs[0].id;
        chrome.storage.local.get(["APPLY_ALL", "ENABLED", "USER_DOC_ID"], function(result){
          addHistory(request.referrer, request.site, sendSignal, result.APPLY_ALL, result.ENABLED, result.USER_DOC_ID, jsEnabled, tabId);
        })
      });
    });
  }
  //update cache from contentScript.js
  if (request.greeting == "OPEN OPTIONS") openOptions();
  if (request.greeting == "UPDATE CACHE") setCache(request.newEnabled, request.newDomains, request.newDomainlistEnabled, request.newApplyAll);
  //updates Setting Interaction History from contentScript.js and domainlist-view.js
  if (request.greeting == "INTERACTION") {
    chrome.storage.local.get( ["USER_DOC_ID", "ORIGIN_SITE"], function(result){
      let userDocID = result.USER_DOC_ID;
      let originSite = result.ORIGIN_SITE ? result.ORIGIN_SITE : "";
      addSettingInteractionHistory(request.domain, originSite, userDocID, request.setting, request.prevSetting, request.newSetting, request.universalSetting);
    })
  }

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


// function used to set the locally stored values in the cache upon change
function setCache(enabled='dontSet', domains='dontSet', domainlistEnabled='dontSet', applyAll='dontSet'){
  if(enabled!='dontSet') enabledCache=enabled;
  if(domains!='dontSet') {
    domainsCache=domains;
    updateDomains(Object.keys(domains));
  }
  if(domainlistEnabled!='dontSet') domainlistEnabledCache=domainlistEnabled;
  if(applyAll!='dontSet') applyAllCache=applyAll;
}

function openOptions(){
  chrome.tabs.create({
    url: '../options/options.html',
    active: true
  })
}
// Update the sendSignal boolean for the current page
function updateSendSignalandDomain(){

  // update current domain
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    let url = tabs[0].url;
    let url_object = new URL(url);
    let domain=url_object.hostname;
    currentHostname = domain;
  });

  // update send signal for the current domain
  if(domainlistEnabledCache){
    if (!(domainsCache[currentHostname]===undefined)) sendSignal=domainsCache[currentHostname]
    else{
      if (applyAllCache) sendSignal=enabledCache
      else sendSignal=false
    }
  }else sendSignal=enabledCache

}


// Add headers if the sendSignal to true
function addHeaders (details)  {

  updateSendSignalandDomain()
  // console.log("sent headers" + sendSignal +currentHostname);
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
  // console.log("sent DOM" + sendSignal +currentHostname);
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

// Set the ORIGIN_SITE property in local storage for option page
chrome.browserAction.onClicked.addListener(function(tab) {
  let url = tab.url;
  chrome.storage.local.set({"ORIGIN_SITE": url}, ()=>{
    chrome.runtime.openOptionsPage(() => {});
  });
});