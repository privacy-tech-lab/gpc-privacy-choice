/*
OptMeowt is licensed under the MIT License
Copyright (c) 2020 Kuba Alicki, Daniel Knopf, Abdallah Salia, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

// background.js is the main background script handling OptMeowt's main opt-out functionality

// Initializers
var tabs = {}; /// Store all active tab id's, domain, requests, and response
var wellknown = {} /// Store information about `well-known/gpc` files per tabs
var signalPerTab = {} /// Store information on a signal being sent for updateUI
var activeTabID = 0;
var sendSignal = false;
var optout_headers = {};
var userAgent = window.navigator.userAgent.indexOf("Firefox") > -1 ? "moz" : "chrome"
var global_domains = {};

// Generates ENABLED, DOMAINLIST_ENABLED, and DOMAINS keys in local storage [checked]
chrome.storage.local.get(
  ["ENABLED", "DOMAINLIST_ENABLED", "DOMAINS", "DOMAINLIST_PRESSED"],
  function (result) {
    if (result.ENABLED == undefined) chrome.storage.local.set({ ENABLED: true });
    if (result.DOMAINLIST_ENABLED == undefined) chrome.storage.local.set({ DOMAINLIST_ENABLED: false });
    if (result.DOMAINS == undefined) chrome.storage.local.set({ DOMAINS: {} });
    if (result.DOMAINLIST_PRESSED == undefined) chrome.storage.local.set({ DOMAINLIST_PRESSED: false });
  }
);

// Runs on startup to query current tab [checked]
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs.id !== undefined) {
    activeTabID = tab.id;
  }
});

// Runs on startup to enable/disable extension [checked]
chrome.storage.local.get(["ENABLED"], function (result) {
  if (result.ENABLED === false) {
    disable();
  } else {
    enable();
  }
});

// Directs users to the options page upon installing the extension
chrome.runtime.onInstalled.addListener(function (object) {
  chrome.storage.local.set(
    { FIRSTINSTALL: true, FIRSTINSTALL_POPUP: true },
    function () {
      chrome.runtime.openOptionsPage(() => 
      {});
    }
  );
});

// Listener for runtime messages: in partuclar "TAB" from contentScript.js
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
  if (request.msg === "TAB") {
    let url = new URL(sender.origin);
    let parsed = psl.parse(url.hostname);
    let domain = parsed.domain;
    let tabID = sender.tab.id;
    if (tabs[tabID] === undefined) {
      tabs[tabID] = {
        DOMAIN: domain,
        REQUEST_DOMAINS: {},
        TIMESTAMP: request.data,
      };
    } else if (tabs[tabID].DOMAIN !== domain) {
      tabs[tabID].DOMAIN = domain;
      let urls = tabs[tabID]["REQUEST_DOMAINS"];
      for (var key in urls) {
        if (urls[key]["TIMESTAMP"] >= request.data) {
          tabs[tabID]["REQUEST_DOMAINS"][key] = urls[key];
        } else {
          delete tabs[tabID]["REQUEST_DOMAINS"][key];
        }
      }
      tabs[tabID]["TIMESTAMP"] = request.data;
    }
  } 
});


// Add current bool flag accordingly. [checked]
const updateDomainsAndSignal = (details) => {
  /// Add current domain to list of domains to send headers to on current tab
  let url = new URL(details.url);
  let parsed = psl.parse(url.hostname);
  let d = parsed.domain;
  global_domains[d] = true;

  chrome.storage.local.get(["DOMAINLIST_ENABLED", "DOMAINS"], function (result) {
    let domains = result.DOMAINS;
    for (let domain in global_domains) {
      if (domains[domain] === undefined) {
        domains[domain] = true;
      }
    }

    chrome.storage.local.set({ DOMAINS: domains }, function(){});

    /// Set to true if domainlist is off, or if domainlist is on AND domain is in domainlist
    if (result.DOMAINLIST_ENABLED) {
      if (domains[d] === true) sendSignal = true;
      else sendSignal = false;
    } else {
      sendSignal = true; 
    }
  });
}

// Updates HTTP headers with Do Not Sell headers according to whether or not a site should recieve them. [checked]
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
  // what is the details.type === TEST?
  if (!(details.type === "TEST")) {

    updateDomainsAndSignal(details);
    if (sendSignal) {
      signalPerTab[details.tabId] = true
      // initUSP();
      updateUI(details);
      return updateHeaders(details);
    }
  } 
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
      ) {
          return
      }
  } catch (e) {
  }
    initDomJS(details);
  }
}

// Updates OptMeowt icon to reflect a Do Not Sell signal sent status [checked]
const updateUI = (details) => {
  if (wellknown[details.tabId] === undefined) {
    wellknown[details.tabId] = null
  }
  if (wellknown[details.tabId] === null) {
    chrome.browserAction.setIcon(
      {
        tabId: details.tabId,
        path: "assets/face-icons/optmeow-face-circle-green-ring-128.png",
      },
      function () {
        // console.log("Updated OptMeowt icon to GREEN RING");
      }
    );
  }
}

// Manipulates received headers if need be. Logs data and updates popup badge [???]
const receivedHeaders = (details) => {
  logData(details);
  // incrementBadge(details);
};


// Allows for all background page resets necessary on a page navigate. Mainly to reset the well-known boolean check for a specific tab. [???]
const beforeNavigate = (details) => {
  if (details.frameId === 0) {
    wellknown[details.tabId] = null
    signalPerTab[details.tabId] = false
  }
}

// Logs all urls of a domain with response headers to local `tabs` object [???]
const logData = (details) => {
  var url = new URL(details.url);
  var parsed = psl.parse(url.hostname);

  if (tabs[details.tabId] === undefined) {
    tabs[details.tabId] = { DOMAIN: null, REQUEST_DOMAINS: {}, TIMESTAMP: 0 };
    tabs[details.tabId].REQUEST_DOMAINS[parsed.domain] = {
      URLS: {},
      RESPONSE: details.responseHeaders,
      TIMESTAMP: details.timeStamp,
    };
    tabs[details.tabId].REQUEST_DOMAINS[parsed.domain].URLS = {
      URL: details.url,
      RESPONSE: details.responseHeaders,
    };
  } else {
    if (tabs[details.tabId].REQUEST_DOMAINS[parsed.domain] === undefined) {
      tabs[details.tabId].REQUEST_DOMAINS[parsed.domain] = {
        URLS: {},
        RESPONSE: details.responseHeaders,
        TIMESTAMP: details.timeStamp,
      };
      tabs[details.tabId].REQUEST_DOMAINS[parsed.domain].URLS[details.url] = {
        RESPONSE: details.responseHeaders,
      };
    } else {
      tabs[details.tabId].REQUEST_DOMAINS[parsed.domain].URLS[details.url] = {
        RESPONSE: details.responseHeaders,
      };
    }
  }
}

// Enable Opt-Meowt [checked]
const enable = () => {
  fetch("json/headers.json")
    .then((response) => response.text())
    .then((value) => {
      optout_headers = JSON.parse(value);
      if (userAgent === "moz") {
        chrome.webRequest.onBeforeSendHeaders.addListener(
          addHeaders,
          {
            urls: ["<all_urls>"],
          },
          ["requestHeaders", "blocking"]
        );
        chrome.storage.local.set({ ENABLED: true });
        chrome.webNavigation.onCommitted.addListener(addDomSignal);
        chrome.webNavigation.onBeforeNavigate.addListener(beforeNavigate);
        chrome.webRequest.onHeadersReceived.addListener(
          receivedHeaders,
          {
            urls: ["<all_urls>"],
          },
          ["responseHeaders", "blocking"]
        );
        chrome.storage.local.set({ ENABLED: true });
      } else {
        chrome.webRequest.onBeforeSendHeaders.addListener(
          addHeaders,
          {
            urls: ["<all_urls>"],
          },
          ["requestHeaders", "extraHeaders", "blocking"]
        );
        chrome.storage.local.set({ ENABLED: true });
        chrome.webNavigation.onCommitted.addListener(
          addDomSignal,
          {
            urls: ["<all_urls>"],
          }
        )
        chrome.webNavigation.onBeforeNavigate.addListener(
          beforeNavigate,
          {
            urls: ["<all_urls>"],
          }
        )
        chrome.webRequest.onHeadersReceived.addListener(
          receivedHeaders,
          {
            urls: ["<all_urls>"],
          },
          ["responseHeaders", "extraHeaders", "blocking"]
        );
        chrome.storage.local.set({ ENABLED: true });
      }
    })
    .catch((e) =>
      console.log(
        `Failed to intialize OptMeowt (JSON load process) (ContentScript): ${e}`
      )
    );
}

// Disable Functionality [checked]
const disable = () => {
  optout_headers = {};
  chrome.webRequest.onBeforeSendHeaders.removeListener(addHeaders);
  chrome.webRequest.onBeforeSendHeaders.removeListener(receivedHeaders);
  chrome.webNavigation.onCommitted.removeListener(addDomSignal);
  chrome.webNavigation.onBeforeNavigate.removeListener(beforeNavigate);
  chrome.storage.local.set({ ENABLED: false });
  var counter = 0;
}