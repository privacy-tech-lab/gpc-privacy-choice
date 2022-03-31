/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

/*==========================================================================================================
This section imports all the necessary function
==========================================================================================================*/
import { firebaseConfig } from "./config.js";
import { initializeApp } from "./firebase/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  limit,
  orderBy,
  getDocs,
} from "./firebase/firebase-firestore.js";
import {
  getBrowser,
  getFirstPartyCookiesEnabled,
  getGPCGlobalStatus,
  getOS,
  getLocation,
  getPlugins,
  getLanguage,
  getLocalStorageEnabled,
  getSessionStorageEnabled,
  getTimeZone,
  getDomain,
  sleep,
  cleanFrames,
  enable,
  openPage,
} from "./util.js";

import {
  addDomainRule,
  addUrlRule,
  rmRuleId,
  rmRuleUrl,
  clearRules,
  removeDomainFromRule,
  globalRuleOn,
  globalRuleOff,
  rmDisableDomainRule,
  mediumRulesOn,
  updateCategories,
  addDisableDomainRule,
} from "./editRules.js";

// Connect with Database
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

// Put list of disconnect domains into array
let disconnectList = {};
let disconnect;
let liveAdEvents = {};
//structure to map frames to urls
let frames = {};

// Fetching the networks dictionary
let networks;
let checkList = [];
let npsList = [];

// Store DOMAIN_LIST, ENABLED, and DOMAINLIST_ENABLED variables in cache for synchronous access: Make sure these are always in sync!
let domainsCache = {};

//map tab and url to object containing third party request data for live sites
let allThirdPartyData = {};

//dictionary that maps a TabId to the current url of the tab
//used to get the previous url (referer) when navigation occurs
let referer = {};

// Attach addThirdPartyRequest function to record all the request made to the the thirdy party websites
chrome.webRequest.onSendHeaders.addListener(
  addThirdPartyRequests,
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
);

//check if domain is in disconnect list
function isInDisconnect(domain) {
  if (Object.keys(disconnectList).includes(domain)) {
    // console.log(true, disconnectList[domain])
    return true;
  } else return false;
  // if(i.includes(domain))
  // console.log(Object.keys(c))
}

//todo: maybe this should be moved into local storage
fetch("json/services.json")
  .then((response) => response.text())
  .then((result) => {
    disconnect = JSON.parse(result);
    for (let c of Object.keys(disconnect["categories"]))
      for (let network of Object.values(disconnect["categories"][c])) {
        for (let domain of Object.values(network)) {
          let domains = Object.values(domain)[0];
          for (let d of domains) {
            if (Object.keys(disconnectList).includes(d))
              disconnectList[d][0].push(c);
            else disconnectList[d] = [[c], Object.keys(network)[0]];
          }
        }
      }
    // console.log(disconnectList)
  });

//class to locally store info on third party requests when a site is live
class ThirdPartyData {
  constructor(tabId, url, docId, userDocId) {
    this.count = 0;
    this.sCollection = collection(
      db,
      "users",
      userDocId,
      "Browser History",
      docId,
      "Third Party Requests Summary"
    );
    this.eCollection = collection(
      db,
      "users",
      userDocId,
      "Browser History",
      docId,
      "Third Party Requests (first 50)"
    );
    if (allThirdPartyData[tabId] === undefined) allThirdPartyData[tabId] = {};
    allThirdPartyData[tabId][url] = this;
    this.thirdPartyDomains = {};
    for (let site of Object.keys(allThirdPartyData[tabId])) {
      if (site != url) {
        writeThirdPartyDataToDb(allThirdPartyData[tabId][site]);
        delete allThirdPartyData[tabId][site];
      }
    }
  }
}

// Class for objects holding information on a potential ad interaction
class AdEvent {
  constructor(originTabId, targetTabId) {
    let date = new Date();
    this.tabId = originTabId;
    this.targetTabId = targetTabId;
    this.adFrameId = null;
    this.reasoning = null;
    this.adBool = false;
    this.timestamp = date;
    //   firebase.firestore.Timestamp.fromDate(date)
    liveAdEvents[targetTabId] = this;
  }
  removeAdEvent() {
    delete liveAdEvents[this.tabId];
    delete this;
  }
}

/*====================================================================================================================
This contains firestore  function for interacting with the DB
======================================================================================================================*/
// Create user in the database
export async function createUser(prolificID, schemeNumber) {
  let crd = await getLocation();
  let longitude = crd.longitude ? crd.longitude : "unknown longitude";
  let latitude = crd.latitude ? crd.latitude : "unknown latitude";
  let date = new Date();
  // generate unique user document and storage the id into local storage
  const newUserRef = doc(collection(db, "users"));
  console.log("new user reference created: ", newUserRef);
  chrome.storage.local.set(
    { USER_DOC_ID: newUserRef.id, UI_SCHEME: schemeNumber },
    function () {
      chrome.contentSettings.javascript.get(
        { primaryUrl: "http:*" },
        function (details) {
          const userData = {
            "User Agent": navigator.userAgent
              ? navigator.userAgent
              : "undefined",
            DNT: navigator.doNotTrack ? 1 : 0,
            Latitude: latitude,
            Longitude: longitude,
            Browser: getBrowser(),
            "Rendering Engine": navigator.appVersion.includes("WebKit")
              ? "WebKit Engine"
              : "Other Rendering Engine",
            OS: getOS(),
            Plugins: getPlugins(),
            Language: getLanguage(),
            "Time Zone": getTimeZone(),
            "Cookies Enabled": getFirstPartyCookiesEnabled(),
            "Local Storage Enabled": getLocalStorageEnabled(),
            "Session Storage Enabled": getSessionStorageEnabled(),
            "Domain List": [],
            "UI Scheme": schemeNumber,
            Timestamp: Timestamp.fromDate(date),
            "JS Enabled": details.setting,
            "Prolific ID": prolificID,
          };
          setDoc(newUserRef, userData);
        }
      );
    }
  );
}

// Add users' browsing entries to firestore
export function addHistory(
  transitionType,
  site,
  GPC,
  applyALLBool,
  enabledBool,
  currentUserDocID,
  tabId,
  uiScheme,
  time,
  referer
) {
  console.log("addHistory function is triggered!");
  let date = new Date();
  if (referer != site || referer === undefined) {
    if (transitionType != "link") {
      referer = "N/A";
    }
    if (referer === undefined) {
      referer = "not found";
    }
    if (GPC === undefined) {
      GPC = "unset";
    }
    const newBrowserRef = doc(
      collection(db, "users", currentUserDocID, "Browser History")
    );
    const userData = {
      Timestamp: Timestamp.fromDate(date),
      Referer: referer,
      TabID: tabId,
      "Transition Type/Referer": transitionType,
      CurrentSite: site,
      "GPC Current Site Status": GPC,
      "GPC Global Status": getGPCGlobalStatus(
        applyALLBool,
        enabledBool,
        uiScheme
      ),
    };
    setDoc(newBrowserRef, userData).then(() => {
      new ThirdPartyData(tabId, site, newBrowserRef.id, currentUserDocID);
    });
  }
}

// Adds users' setting interaction history to firestore
export function addSettingInteractionHistory(
  domain,
  originSite,
  currentUserDocID,
  setting,
  prevSetting,
  newSetting,
  universalSetting,
  location,
  subcollection
) {
  let date = new Date();
  const intDoc = doc(
    collection(db, "users", currentUserDocID, "Domain Interaction History")
  );
  if (subcollection === "Domain") {
    const intData = {
      Timestamp: Timestamp.fromDate(date),
      Domain: domain,
      "Recorded Change": {
        "a) Title": setting,
        "b) Interaction": {
          "i) Before": prevSetting,
          "ii) After": newSetting,
        },
      },
      "Universal Setting": universalSetting,
      "Origin Site": originSite,
      Location: location,
    };
    setDoc(intDoc, intData);
  } else if (subcollection === "Privacy Choice") {
    const intData = {
      Timestamp: Timestamp.fromDate(date),
      Domain: domain,
      "Recorded Change": {
        "a) Title": setting,
        "b) Interaction": {
          "i) Before": prevSetting,
          "ii) After": newSetting,
        },
      },
      "Origin Site": originSite,
      Location: location,
    };
    setDoc(intDoc, intData);
  } else if (subcollection == "Choice Banner Mute") {
    const intData = {
      Timestamp: Timestamp.fromDate(date),
      Domain: domain,
      "Recorded Change": setting,
    };
    setDoc(intDoc, intData);
  }
}

// Add new domains to the domain list field of the user document
export function updateDomains(domainsList) {
  console.log("updating the domain list");
  chrome.storage.local.get(["USER_DOC_ID"], function (result) {
    if (result.USER_DOC_ID) {
      const userRef = doc(db, "users", result.USER_DOC_ID);
      updateDoc(userRef, {
        "Domain List": domainsList,
      });
    } else {
      console.log("Unregistered user: not connected to the database");
    }
  });
}

//write locally stored third party request summary data to db
export function writeThirdPartyDataToDb(data) {
  for (let d in Object.values(data.thirdPartyDomains)) {
    let info = Object.values(data.thirdPartyDomains)[d];
    setDoc(doc(data.sCollection), info);
  }
}

//write info on a specific request to db
export function writeRequestToDb(data, collection) {
  setDoc(doc(collection), data);
}

// updates/create locally stored info on third party requests
export function addThirdPartyRequests(details) {
  if (details.tabId >= 0) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (tab != undefined) {
        let tabId = details.tabId;
        let url;
        if (details.frameId > 0) url = frames[tabId][details.frameId];
        else url = tab.url;
        let initiator_object = new URL(details.initiator);
        let initiator_host = getDomain(initiator_object.href);
        let url_object = new URL(url);
        let domain = getDomain(url_object.href);
        let request_url_object = new URL(details.url);
        let url_host = getDomain(request_url_object.href);
        if (
          isInDisconnect(initiator_host) &&
          url_host != "firestore.googleapis.com" &&
          initiator_host != domain
        ) {
          let network = disconnectList[initiator_host][1];
          let networkCategory = disconnectList[initiator_host][0];
          if (allThirdPartyData[tabId][url].count < 50) {
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
              NetworkCategory: networkCategory,
            };
            writeRequestToDb(data, allThirdPartyData[tabId][url].eCollection);
            allThirdPartyData[tabId][url].count += 1;
          }
          let domainInfo =
            allThirdPartyData[tabId][url].thirdPartyDomains[initiator_host];
          if (domainInfo == undefined) {
            domainInfo = {
              Domain: initiator_host,
              RequestCount: 1,
              Network: network,
              NetworkCategory: networkCategory,
            };
          } else domainInfo["RequestCount"] += 1;
          allThirdPartyData[tabId][url].thirdPartyDomains[initiator_host] =
            domainInfo;
        }
      }
    });
  }
}

// Add ad interaction entry to database
export function addAd(adEvent) {
  console.log(adEvent);
  // Create a query against the collection.
  chrome.storage.local.get(["USER_DOC_ID"], function (result) {
    const historyRef = collection(
      db,
      "users",
      result.USER_DOC_ID,
      "Browser History"
    );
    const q = query(
      historyRef,
      where("TabID", "==", adEvent.tabId),
      orderBy("Timestamp", "desc"),
      limit(1)
    );
    getDocs(q).then((querySnapshot) =>
      querySnapshot.forEach((d) => {
        const newBrowserRef = collection(
          db,
          "users",
          result.USER_DOC_ID,
          "Browser History",
          d.id,
          "Ad Interactions"
        );
        const userData = {
          AdTabId: adEvent.targetTabId,
          Timestamp: adEvent.timestamp,
          AdSource: adEvent.adSource,
          AdFrameId: adEvent.adFrameId,
          "Initial Navigation to": adEvent.redirectionTo,
          "Evidence of Ad Interaction": adEvent.reasoning,
        };
        addDoc(newBrowserRef, userData).then((adDoc) => {
          // console.log(adEvent.targetTabId)
          const docRef = doc(
            db,
            "users",
            result.USER_DOC_ID,
            "Browser History",
            d.id,
            "Ad Interactions",
            adDoc.id
          );
          const data = {
            Timestamp: Timestamp.fromDate(date),
            Referer: referer,
            TabID: tabId,
            "Transition Type/Referer": transitionType,
            CurrentSite: site,
            "GPC Current Site Status": GPC,
            "GPC Global Status": getGPCGlobalStatus(
              applyALLBool,
              enabledBool,
              uiScheme
            ),
          };
          updateDoc(docRef, data);
          adEvent.removeAdEvent();
        });
      })
    );
  });
}

/*====================================================================================================================
This contains chrome api listeners for events
======================================================================================================================*/

// Main driver listening to the run time message
chrome.runtime.onMessage.addListener(async function (request) {
  // record setting interaction history from contentScript.js and domainlist-view.js (interaction with the DB API)
  if (request.greeting == "INTERACTION") {
    console.log("Recording interactions from the domain list page");
    chrome.storage.local.get(["USER_DOC_ID", "ORIGIN_SITE"], function (result) {
      let userDocID = result.USER_DOC_ID;
      let originSite = result.ORIGIN_SITE;
      if (result.USER_DOC_ID) {
        addSettingInteractionHistory(
          request.domain,
          originSite,
          userDocID,
          request.setting,
          request.prevSetting,
          request.newSetting,
          request.universalSetting,
          request.location,
          request.subcollection
        );
        if (request.setting === "Categories")
          updateCategories(request.newSetting);
      } else {
        console.log("Unregistered user: not connected to the database");
      }
    });
  }
  // user responds to the banner (enable GPC) (interaction with the Rule Set API)
  if (request.greeting == "BANNER ENABLE GPC") {
    console.log("Banner Reaction: enable GPC for domain: ", request.domain);
    addDomainRule(request.domain);
  }
  // user responds to the banner (disable GPC) (interaction with the Rule Set API)
  if (request.greeting == "BANNER DISABLE GPC") {
    await clearRules();
    globalRuleOff();
    console.log("Banner Reaction: disable GPC for domain: ", request.domain);
  }
  if (request.greeting == "BANNER ENABLE GPC ALL") {
    console.log("Banner Reaction: enable GPC for all");
    await clearRules();
    globalRuleOn();
  }
  if (request.greeting == "BANNER DISABLE GPC ALL") {
    console.log("Banner Reaction: disable GPC for all");
    await clearRules(request.ruleIds);
  }
  // user turns on the gpc for a domain from options page (interaction with the Rule Set API)
  if (request.greeting == "OPTION ENABLE GPC") {
    console.log(
      "Option Page Reaction: enable GPC for domain: ",
      request.domain
    );
    chrome.storage.local.get(["UI_SCHEME", "UV_SETTING"], function (result) {
      if (result.UI_SCHEME < 3) {
        if (result.UV_SETTING == "Send signal to all") {
          rmDisableDomainRule(request.domain);
        } else {
          addDomainRule(request.domain);
        }
      } else {
        addUrlRule(request.domain);
      }
    });
  }
  // user turns off the gpc for a domain from options page (interaction with the Rule Set API)
  if (request.greeting == "OPTION DISABLE GPC") {
    console.log(
      "Option Page Reaction: disable GPC for domain: ",
      request.domain
    );
    chrome.storage.local.get(["UI_SCHEME"], function (result) {
      if (result.UI_SCHEME < 3) {
        removeDomainFromRule(request.domain);
      } else {
        rmRuleUrl(request.domain);
      }
    });
  }
  // user deletes a domain from options page (interaction with the Rule Set API)
  if (request.greeting == "OPTION DELETE DOMAIN") {
    console.log("Option Page Reaction: delete domain: ", request.domain);
    chrome.storage.local.get(["UI_SCHEME"], function (result) {
      if (result.UI_SCHEME < 3) {
        removeDomainFromRule(request.domain);
      } else {
        rmRuleUrl(request.id);
      }
    });
  }
  // user deletes all the domains (interaction with the Rule Set API)
  if (request.greeting == "OPTION DELETE ALL DOMAINS") {
    console.log("Option Page Reaction: delete all domains");
    await clearRules();
  }
  // user changes profile (scheme 3) (interaction with the Rule Set API)
  if (request.greeting == "UPDATE PRIVACY PROFILE") {
    console.log("Updating the rule sets based on new profile");
    // first remove all the previous rules
    await clearRules(request.ruleIds);
    // if user toggle to high privacy sensitivity => add all domains
    if (request.scheme == "High Privacy-Sensitivity") await addUrlRule("*");
    // if user toggle to medium privacy sensitivity => add all domains from CHECKLIST
    // todo: I think we need to redesign this checklist to be a dictionary instead, with both id and gpc enabled status
    else if (request.scheme == "Medium Privacy-Sensitivity") {
      mediumRulesOn();
    }
    // if user toggle to low privacy sensitivity => don't do anything
  }
  // user changes categories (scheme 4) (interaction with the Rule Set API)
  if (request.greeting == "UPDATE CATEGORIES") {
    updateCategories(request.choices);
  }
  // learning phase completed (scheme 5) (interaction with the Rule Set API)
  if (request.greeting == "LEARNING COMPLETED") {
    console.log("Learning is finished. Automatically switching...");
    chrome.storage.local.set({ LEARNING: "Just Finished" }, function () {
      let alreadyOpen = false;
      let extensionID = chrome.runtime.id;
      chrome.tabs.query({}, function (tabs) {
        for (let i = 0, tab; (tab = tabs[i]); i++) {
          if (
            tab.url ===
            "chrome-extension://" + extensionID + "/options/options.html"
          ) {
            chrome.tabs.reload(tab.id, {}, function () {});
            chrome.tabs.update(tab.id, { active: true });
            alreadyOpen = true;
          }
        }
      });
      if (!alreadyOpen) {
        chrome.runtime.openOptionsPage();
      }
    });
  }
  // user changes global enable status (scheme 6) (interaction with the Rule Set API)
  if (request.greeting == "UPDATE FUTURE GLOBAL SETTING") {
    console.log("Updating the default setting");
    if (request.enable == true) {
      globalRuleOn();
      for (let d in request.domains) {
        if (request.domains[d].bool === false) addDisableDomainRule(d);
      }
    } else {
      globalRuleOff();
      rmRuleId(3);
    }
  }
  if (request.greeting == "DISABLE FUTURE GLOBAL SETTING") {
    console.log("Turning off default setting");
    rmRuleId(3);
    globalRuleOff();
    for (let d in request.domains) {
      if (request.domains[d].bool === true) addDomainRule(d);
    }
  }
});

// Listen for user opening a potential ad in a new tab
chrome.webNavigation.onCreatedNavigationTarget.addListener((details) => {
  let tabId = details.sourceTabId;
  let targetTabID = details.tabId;
  new AdEvent(tabId, targetTabID);
  liveAdEvents[targetTabID].adFrameId = details.sourceFrameId;
  chrome.webNavigation.getFrame(
    {
      tabId: details.sourceTabId,
      processId: details.souceProcessId,
      frameId: details.sourceFrameId,
    },
    function (frame) {
      let origin = getDomain(frame.url);
      liveAdEvents[targetTabID].adSource = origin;
      let initialLoad = getDomain(details.url);
      liveAdEvents[targetTabID].redirectionTo = initialLoad;
      if (
        (isInDisconnect(origin) && details.sourceFrameId != 0) ||
        (isInDisconnect(initialLoad) &&
          (details.sourceFrameId != 0 || initialLoad != origin))
      ) {
        liveAdEvents[targetTabID].adBool = true;
        liveAdEvents[targetTabID].reasoning =
          "navigation via ad network (highest confidence)";
      } else {
        chrome.tabs.sendMessage(
          tabId,
          { greeting: "GET HTML TAG" },
          function (response) {
            // console.log(response);
            if (response == "IFRAME") liveAdEvents[targetTabID].adBool = true;
            liveAdEvents[targetTabID].reasoning = "linked from iFrame";
          }
        );
      }
    }
  );
});

// Listen for when navigation occurs
// in case ads are not pop ups (open new tabs) this code would need to be fleshed out
// filter out navigations that did not occur via link
chrome.webNavigation.onCommitted.addListener((e) => {
  if (liveAdEvents[e.tabId] === undefined) new AdEvent(e.tabId, e.tabId);
  if (e.transitionType == "link") {
    // console.log(liveAdEvents[e.tabId])
    if (liveAdEvents[e.tabId].adBool === true) addAd(liveAdEvents[e.tabId]);
  }
  delete liveAdEvents[e.tabId];
});

chrome.webNavigation.onCommitted.addListener((details) => {
  if (
    (details.transitionType == "auto_subframe" ||
      details.transitionType == "manual_subframe") &&
    details.frameId > 0 &&
    details.tabId > 0
  ) {
    chrome.tabs.get(details.tabId, (tab) => {
      if (frames[details.tabId] === undefined) frames[details.tabId] = {};
      frames[details.tabId][details.frameId] = tab.url;
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(allThirdPartyData, tabId);
  for (let site of Object.keys(allThirdPartyData[tabId])) {
    writeThirdPartyDataToDb(allThirdPartyData[tabId][site]);
    delete allThirdPartyData[tabId][site];
  }
  sleep(1000).then(() => {
    delete frames[tabId];
    delete referer[tabId];
  });
});

// Set the initial configuration of the extension
chrome.runtime.onInstalled.addListener(async function (object) {
  // let userScheme = Math.floor(Math.random() * 7);
  let userScheme = 4;
  chrome.storage.local.set(
    {
      MUTED: [false, undefined],
      ENABLED: true,
      APPLY_ALL: false,
      UV_SETTING: "Off",
      DOMAINLIST_ENABLED: true,
      DOMAINS: {},
      UI_SCHEME: userScheme,
      USER_DOC_ID: null,
    },
    function () {
      enable();
      if (userScheme == 0 || userScheme == 1 || userScheme == 2) {
        openPage("registration/registration.html");
      } else if (userScheme == 3) {
        // parse the checklist needed for updating the sendSignals based on user's choice
        fetch("json/services.json")
          .then((response) => response.text())
          .then((result) => {
            networks = JSON.parse(result)["categories"];
            for (let cat of [
              "Cryptomining",
              "FingerprintingInvasive",
              "FingerprintingGeneral",
            ]) {
              for (let n of networks[cat]) {
                for (let c of Object.values(n)) {
                  for (let list of Object.values(c)) {
                    npsList = npsList.concat(list);
                  }
                }
              }
            }
            for (let category of [
              "Advertising",
              "Analytics",
              "FingerprintingInvasive",
              "FingerprintingGeneral",
              "Cryptomining",
            ]) {
              for (let n of networks[category]) {
                for (let c of Object.values(n)) {
                  for (let list of Object.values(c)) {
                    checkList = checkList.concat(list);
                  }
                }
              }
            }
            chrome.storage.local.set({ CHECKLIST: checkList });
            chrome.storage.local.set({ NPSLIST: npsList });
          })
          .then(openPage("registration/profile.html"));
      } else if (userScheme == 4) {
        openPage("registration/questionnaire.html");
      } else if (userScheme == 5) {
        fetch("json/services.json")
          .then((response) => response.text())
          .then((result) => {
            networks = JSON.parse(result)["categories"];
            for (let cat of [
              "Cryptomining",
              "FingerprintingInvasive",
              "FingerprintingGeneral",
            ]) {
              for (let n of networks[cat]) {
                for (let c of Object.values(n)) {
                  for (let list of Object.values(c)) {
                    npsList = npsList.concat(list);
                  }
                }
              }
            }
            for (let category of [
              "Advertising",
              "Analytics",
              "FingerprintingInvasive",
              "FingerprintingGeneral",
              "Cryptomining",
            ]) {
              for (let n of networks[category]) {
                for (let c of Object.values(n)) {
                  for (let list of Object.values(c)) {
                    checkList = checkList.concat(list);
                  }
                }
              }
            }
            chrome.storage.local.set({
              NPSLIST: npsList,
              CHECKLIST: checkList,
              SEND_SIGNAL_BANNER: 0,
              DO_NOT_SEND_SIGNAL_BANNER: 0,
              LEARNING: "In Progress",
            });
          })
          .then(openPage("registration/registration.html"));
      } else if (userScheme == 6) {
        openPage("registration/oneQuestion.html");
      } else {
        console.log("ERROR: Unknown scheme number!");
      }
    }
  );
});

// add user's browsing history to the database
chrome.webNavigation.onCommitted.addListener(function (details) {
  chrome.tabs.get(details.tabId, (tab) => {
    // console.log("details.frameId:", details.frameId)
    // console.log("tab: ", tab)
    // console.log("details.transitionType: ", details.transitionType)
    if (
      details.frameId == 0 &&
      tab != undefined &&
      details.transitionType != "reload"
    ) {
      cleanFrames(details.tabId);
      chrome.storage.local.get(
        ["APPLY_ALL", "ENABLED", "USER_DOC_ID", "UI_SCHEME"],
        function (result) {
          if (result.USER_DOC_ID) {
            // console.log("Writting into the Browser History")
            addHistory(
              details.transitionType,
              details.url,
              domainsCache[getDomain(details.url)],
              result.APPLY_ALL,
              result.ENABLED,
              result.USER_DOC_ID,
              details.tabId,
              result.UI_SCHEME,
              details.timeStamp,
              referer[details.tabId]
            );
            referer[details.tabId] = details.url;
          } else {
            console.log("Unregistered user: not connected to the database");
          }
        }
      );
    } else {
      // console.log("Not writing browser history to the database!");
    }
  });
});

// Set the ORIGIN_SITE property in local storage as current site url for option page
chrome.action.onClicked.addListener(function (tab) {
  let url = tab.url;
  chrome.storage.local.set({ ORIGIN_SITE: url }, () => {
    chrome.runtime.openOptionsPage(() => {
      openPage("options/options.html");
    });
  });
});
