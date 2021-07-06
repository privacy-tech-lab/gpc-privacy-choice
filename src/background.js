// background.js is the main background script handling OptMeowt's main opt-out functionality

// Initializers
let sendSignal = false;
let optout_headers = {};
let currentHostname = undefined;

// Store DOMAIN_LIST, ENABLED, and DOMAINLIST_ENABLED variables in cache for synchronous access
// Make sure these are always in sync!
let enabledCache=true;
let domainsCache= {};
let domainlistEnabledCache=true;

// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.local.set({ENABLED: true});
  chrome.storage.local.set({APPLY_ALL: false});
  chrome.storage.local.set({DOMAINLIST_ENABLED: true});
  chrome.storage.local.set({DOMAINS: {}});
  enable();
});

// Sets cache value to locally stored values after chrome booting up
chrome.storage.local.get(["DOMAINS", "ENABLED", 'DOMAINLIST_ENABLED'], function (result){
  enabledCache=result.ENABLED;
  domainsCache=result.DOMAINS;
  domainlistEnabledCache=result.DOMAINLIST_ENABLED;
})

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting == "ENABLE") sendResponse({farewell: "goodbye"});
  if (request.message == "DISABLE_ALL") disable();
  //update cache from contentScript.js
  if (request.greeting == "UPDATE CACHE") setCache(request.newEnabled, request.newDomains, request.newDomainlistEnabled)
});

// Enable the extenstion
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      chrome.webRequest.onBeforeRequest.addListener(updateSendSignalandDomain, {urls: ["<all_urls>"]});
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
function setCache(enabled='dontSet', domains='dontSet', domainlistEnabled='dontSet'){
  if(enabled!='dontSet') enabledCache=enabled;
  if(domains!='dontSet') domainsCache=domains;
  if(domainlistEnabled!='dontSet') domainlistEnabledCache=domainlistEnabled;
}

// Update the sendSignal boolean for the current page
function updateSendSignalandDomain(){

  // update current domain
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
    let url = tabs[0].url
    let url_object = new URL(url)
    let domain=url_object.hostname
    currentHostname = domain;
  });

  // update send signal for the current domain
  if(enabledCache){
    if(domainlistEnabledCache){
      if (!(domainsCache[currentHostname])===true) sendSignal = false;
      else sendSignal = true;
    }else sendSignal = true;
  }else sendSignal = false;

  // updateDomainList()
}

// Update the domains of the domains list in the local stroage
// function updateDomainList(){
//   chrome.storage.local.get(["ENABLED", "DOMAINS", "APPLY_ALL"], function (result){
//     if (result.APPLY_ALL && result.DOMAINS[currentHostname]===undefined){
//       let domains = result.DOMAINS;
//       let value = result.ENABLED;
//       domains[currentHostname] = value;
//       chrome.storage.local.set({DOMAINS: domains});
//       setCache(domains=domains)    
//     }
//   })
// }


// Add headers if the sendSignal to true
function addHeaders (details)  {

  updateSendSignalandDomain()
  console.log("sent headers" + sendSignal +currentHostname);
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
  console.log("sent DOM" + sendSignal +currentHostname);
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
