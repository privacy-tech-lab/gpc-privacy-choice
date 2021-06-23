// background.js is the main background script handling OptMeowt's main opt-out functionality

// Initializers
let tabs = {}; /// Store all active tab id's, domain, requests, and response
let sendSignal = false;
let optout_headers = {};
let global_domains = [];
let currentHostname = undefined;

// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.local.set({ENABLED: true});
  chrome.storage.local.set({DOMAINLIST_ENABLED: true});
  chrome.storage.local.set({DOMAINS: {}});
  chrome.storage.local.get(["ENABLED"], function (result) {
    if (result.ENABLED === true) enable();
    else disable();
  });
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.greeting == "ENABLE") sendResponse({farewell: "goodbye"});
  if (request.message == "DISABLE_ALL") disable();
});

// Send message "GET_DOMAIN" to contentscript to retrive current domain
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {          
  if (changeInfo.status == 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {message: "GET_DOMAIN"}, function(response) {
          currentHostname = response.hostName;
      });
    })
  }
});

// Enable the extenstion
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      // chrome.webNavigation.onCommitted.addListener(addDomSignal, {urls: ["<all_urls>"]});
      chrome.webRequest.onBeforeRequest.addListener(addDomSignal, {urls: ["<all_urls>"]});
      chrome.webRequest.onBeforeSendHeaders.addListener(addHeaders, {urls: ["<all_urls>"]}, ["requestHeaders", "extraHeaders", "blocking"]);
      chrome.storage.local.set({ ENABLED: true });
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
  sendSignal = false;
}

// Add the new domain into the domain list
const updateDomains = () => {
  global_domains.push(currentHostname);
  chrome.storage.local.get(["DOMAINS"], function (result) {
    let domains = result.DOMAINS;
    for (let domain in global_domains) {
      if (domains[domain] === undefined) domains[domain] = null;
    }
    chrome.storage.local.set({ DOMAINS: domains }, function(){});
  });
}

// Update the sendSignal boolean for the current page
const updateSendSignal = () => {
  chrome.storage.local.get(["DOMAINLIST_ENABLED", "DOMAINS"], function (result){
    let domains = result.DOMAINS;
    sendSignal = true;
    if (result.DOMAINLIST_ENABLED){
      if (!(domains[currentHostname] === true)) {
        sendSignal = false;
      }
    }
  })
}

// Add headers if the sendSignal to true
const addHeaders = (details) => {
  updateDomains();
  updateSendSignal();
  console.log("are headers added: " + sendSignal);
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
const addDomSignal = (details) => {
  updateDomains();
  updateSendSignal();
  console.log("is dom signal set: " + sendSignal);
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