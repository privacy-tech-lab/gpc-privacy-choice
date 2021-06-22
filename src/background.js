// background.js is the main background script handling OptMeowt's main opt-out functionality

// Initializers
let tabs = {}; /// Store all active tab id's, domain, requests, and response
let sendSignal = false;
let optout_headers = {};
let global_domains = {};
let activeTabId = undefined;
let currentHostname = undefined;

// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.local.set({ENABLED: true});
  chrome.storage.local.set({DOMAINLIST_ENABLED: true});
  chrome.storage.local.set({DOMAINS: {}});
  chrome.storage.local.get(["ENABLED"], function (result) {
    // console.log("enabled status: " + result.ENABLED);
    if (result.ENABLED === false) disable();
    else enable();
  });
});

// Listener for runtime messages
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.ENABLED != null) {
    if (request.ENABLED) {
      enable();
      sendResponse("DONE");
    } else {
      disable();
      sendResponse("DONE");
    }
  }
  if (request.msg === "LOADED") global_domains = {};
  // listen to the "ENABLE" messeage from the contentScript
  if (request.greeting == "ENABLE") {
    // console.log("message received!");
    sendResponse({farewell: "goodbye"});
  }
  if (request.message == "DISABLE_ALL") disable();
});

// Send message "GET_DOMAIN" to contentscript to retrive current domain
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {          
  if (changeInfo.status == 'complete') {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
      chrome.tabs.sendMessage(tabs[0].id, {message: "GET_DOMAIN"}, function(response) {
          // console.log("response is: " + response);
          currentHostname = response.hostName;
          // console.log("current hostname is: " + currentHostname);
      });
    })
  }
});

// Add current bool flag accordingly
const updateDomainsAndSignal = (details) => {
  // Assume that global domain keep tracks of all the domain that we have ever seen
  global_domains[currentHostname] = true;

  chrome.storage.local.get(["DOMAINLIST_ENABLED", "DOMAINS"], function (result) {
    let domains = result.DOMAINS;
    for (let domain in global_domains) {
      if (domains[domain] === undefined) domains[domain] = null;
    }

    chrome.storage.local.set({ DOMAINS: domains }, function(){});

    /// Set to true if domainlist is off, or if domainlist is on AND domain is in domainlist
    if (result.DOMAINLIST_ENABLED) {
      if (domains[currentHostname] === true) sendSignal = true;
      else sendSignal = false;
    } else {
      sendSignal = true; 
    }
  });
}

// Updates HTTP headers with Do Not Sell headers according to whether or not a site should recieve them
const updateHeaders = (details) => {
  if (sendSignal) {
    for (let signal in optout_headers) {
      let s = optout_headers[signal];
      details.requestHeaders.push({ name: s.name, value: s.value });
    }
    return { requestHeaders: details.requestHeaders };
  } else {
    return { requestHeaders: details.requestHeaders };
  }
}

// Manipulates Headers and adds Do Not Sell signal
const addHeaders = (details) => {
  updateDomainsAndSignal(details);
  updateUI(details);
  return updateHeaders(details);
};

// Initializes the GPC dom signal functionality in dom.js [checked]
const initDomJS = (details) => {
  chrome.tabs.executeScript(details.tabId, {
    file: "dom.js",
    frameId: details.frameId, 
    runAt: "document_start",
  });
}

// Checks to see if DOM signal should be set, then inits DOM signal set [checked]
const addDomSignal = (details) => {
  updateDomainsAndSignal(details);
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
  } catch (e) {
  }
    initDomJS(details);
  }
}

// Updates OptMeowt icon to reflect a Do Not Sell signal sent status [checked]
const updateUI = (details) => {
  let iconPath = sendSignal ? "assets/face-icons/optmeow-face-circle-green-ring-128.png" : "assets/face-icons/optmeow-face-circle-red-128.png";
  chrome.browserAction.setIcon(
    {tabId: details.tabId, path: iconPath},
    function () { }
  );
}

// Enable Opt-Meowt on Chrome
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      // this needs to be confirmed
      chrome.webNavigation.onCommitted.addListener(addDomSignal, {urls: ["<all_urls>"],}
      );
      chrome.webRequest.onBeforeSendHeaders.addListener(addHeaders,
          {urls: ["<all_urls>"],}, ["requestHeaders", "extraHeaders", "blocking"]
      );
      chrome.storage.local.set({ ENABLED: true });
    })
    .catch((e) =>
      console.log(
        `Failed to intialize OptMeowt (JSON load process) (ContentScript): ${e}`
      )
    );
  sendSignal = true;
}

// Disable Functionality
const disable = () => {
  optout_headers = {};
  chrome.webRequest.onBeforeSendHeaders.removeListener(addHeaders);
  chrome.webNavigation.onCommitted.removeListener(addDomSignal);
  chrome.storage.local.set({ ENABLED: false });
  sendSignal = false;
}