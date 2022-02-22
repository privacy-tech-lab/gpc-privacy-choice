/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/

This file is the main driver file which communicates with the background service worker. 
It exports the domainListView function, which builds the UI for the domain list page, as well as adding the event listeners responding to the users interaction with the page

users actions on domains-list/options page --- chrome runtime --> background.js service worker
*/

import { renderParse, fetchParse } from "../../components/util.js";
import {
  addToggleListeners,
  handleToggleAllOn, 
  handleToggleAllOff, 
  handleApplyAllSwitch, 
  handleDeleteDomainListEvent,
  handleFutureSettingPromptEvent
} from "./domainlist-util.js";

import { createDomainlistManagerButtons, createDefaultSettingInfo, createList} from "./domainlist-ui.js";

const domainListHeadings = {
  title: "Global Privacy Control (GPC) Settings",
  subtitle: "Review or Modify Your GPC Settings",
};

// Renders the `domain list` view in the options page
export async function domainlistView(scaffoldTemplate, buildList) {
  let body;
  let content;

  if (buildList) {
    body = renderParse(
      scaffoldTemplate,
      domainListHeadings,
      "scaffold-component"
    );
    content = await fetchParse(
      "./views/domainlist-view/domainlist-view.html",
      "domainlist-view"
    );
  } else {
    body = renderParse(
      scaffoldTemplate,
      domainListHeadings,
      "scaffold-component"
    );
    content = await fetchParse(
      "./views/domainlist-view/domainlist-view-plain.html",
      "domainlist-view-plain"
    );
  }

  document.getElementById("content").innerHTML = body.innerHTML;
  document.getElementById("scaffold-component-body").innerHTML =
    content.innerHTML;

  createDefaultSettingInfo();

  if (buildList) {
    createDomainlistManagerButtons();
    createList();
  }
  addEventListeners();
  chrome.storage.local.get(["LEARNING"], function (result) {
    if (result.LEARNING == "Just Finished") {
      chrome.storage.local.set({ LEARNING: "Completed" }, function () {
        let modal = UIkit.modal("#learning-finish-modal");
        modal.show();
        document.getElementById("learning-finish-modal-button").onclick =
          function () {
            modal.hide();
          };
      });
    }
  });
}

// Creates all the event listeners for the options page buttons
function addEventListeners() {
  // Add event listener based on the user's scheme
  chrome.storage.local.get(["UI_SCHEME"], function (result) {
    if (result.UI_SCHEME != 6) addToggleListeners();
    if (result.UI_SCHEME == 3) addPrivacyProfileEventListener();
    if (result.UI_SCHEME == 4) addCategoriesEventListener();
    if (result.UI_SCHEME == 6) addGPCEventListener();
  });
  // Add the serach handler if exist
  if (document.getElementById("searchbar") != null)
    document.getElementById("searchbar").addEventListener("keyup", filterList);
  // Add global toggle functionalities if exist
  document.addEventListener("click", (event) => {
    if (event.target.id == "toggle_all_off") {
      handleToggleAllOff();
    } else if (event.target.id == "toggle_all_on") {
      handleToggleAllOn();
    } else if (event.target.id == "apply-all-switch") {
      handleApplyAllSwitch();
    } else if (
      event.target.id == "allow-future-btn" ||
      event.target.id == "dont-allow-future-btn"
    ) {
      handleFutureSettingPromptEvent(event);
    } else if (event.target.id == "delete_all_domainlist") {
      handleDeleteDomainListEvent();
    }
  });
}

// User changes GPC signal send status on scheme 6
function addGPCEventListener() {
  document.addEventListener("click", (event) => {
    if (event.target.id == "privacy-on") {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Enable GPC") {
          chrome.declarativeNetRequest.updateEnabledRulesets(
            { enableRulesetIds: ["universal_GPC"] },
            () => console.log("universal_GPC rule enabled")
          );
          chrome.runtime.sendMessage({
            greeting: "INTERACTION",
            domain: "All future domains",
            setting: "Privacy Profile",
            prevSetting: result.USER_CHOICES,
            newSetting: "Enable GPC",
            location: "Options page",
            subcollection: "Privacy Choice",
          });
        }
      });
      chrome.storage.local.set({ USER_CHOICES: "Enable GPC" });
      createDefaultSettingInfo();
    } else if (event.target.id == "privacy-off") {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Disable GPC") {
          chrome.declarativeNetRequest.updateEnabledRulesets(
            { disableRulesetIds: ["universal_GPC"] },
            () => console.log("universal_GPC rule disabled")
          );
          chrome.runtime.sendMessage({
            greeting: "INTERACTION",
            domain: "All future domains",
            setting: "Privacy Profile",
            prevSetting: result.USER_CHOICES,
            newSetting: "Disable GPC",
            location: "Options page",
            subcollection: "Privacy Choice",
          });
        }
      });
      chrome.storage.local.set({ USER_CHOICES: "Disable GPC" });
      createDefaultSettingInfo();
    }
  });
}

// User changes their privacy profile on scheme 3
function addPrivacyProfileEventListener() {
  document.addEventListener("click", function (event) {
    if (event.target.id == "high-privacy-sensitivity") {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "High Privacy-Sensitivity") {
          chrome.runtime.sendMessage({
            greeting: "INTERACTION",
            domain: "All future domains",
            setting: "Privacy Profile",
            prevSetting: result.USER_CHOICES,
            newSetting: "High Privacy-Sensitivity",
            location: "Options page",
            subcollection: "Privacy Choice",
          });
        }
      });
      chrome.storage.local.set({ USER_CHOICES: "High Privacy-Sensitivity" });
      chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
    } else if (event.target.id == "medium-privacy-sensitivity") {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Medium Privacy-Sensitivity") {
          chrome.runtime.sendMessage({
            greeting: "INTERACTION",
            domain: "All future domains",
            setting: "Privacy Profile",
            prevSetting: result.USER_CHOICES,
            newSetting: "Medium Privacy-Sensitivity",
            location: "Options page",
            subcollection: "Privacy Choice",
          });
        }
      });
      chrome.storage.local.set({ USER_CHOICES: "Medium Privacy-Sensitivity" });
      chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
    } else if (event.target.id == "low-privacy-sensitivity") {
      chrome.storage.local.get(["USER_CHOICES"], function (result) {
        if (result.USER_CHOICES !== "Low Privacy-Sensitivity") {
          chrome.runtime.sendMessage({
            greeting: "INTERACTION",
            domain: "All future domains",
            setting: "Privacy Profile",
            prevSetting: result.USER_CHOICES,
            newSetting: "Not Privacy Sensitive",
            location: "Options page",
            subcollection: "Privacy Choice",
          });
        }
      });
      chrome.storage.local.set({ USER_CHOICES: "Low Privacy-Sensitivity" });
      chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
    }
    createDefaultSettingInfo();
    updatePrefScheme3();
  });
}

// User alters their category choice on scheme 4
function addCategoriesEventListener() {
  document.addEventListener("click", function (event) {
    chrome.storage.local.get(["USER_CHOICES"], function (result) {
      chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
      let userChoices = result.USER_CHOICES;
      if (event.target.id == "Advertising") {
        userChoices["Advertising"] = !userChoices["Advertising"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      } else if (event.target.id == "Analytics") {
        userChoices["Analytics"] = !userChoices["Analytics"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      } else if (event.target.id == "Fingerprinting") {
        userChoices["Fingerprinting"] = !userChoices["Fingerprinting"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      } else if (event.target.id == "Content & Social") {
        userChoices["Content & Social"] = !userChoices["Content & Social"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      } else if (event.target.id == "Cryptomining") {
        userChoices["Cryptomining"] = !userChoices["Cryptomining"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      } else if (event.target.id == "Others") {
        userChoices["Others"] = !userChoices["Others"];
        chrome.storage.local.set({ USER_CHOICES: userChoices });
        chrome.storage.local.get(
          ["USER_CHOICES", "PREV_CHOICE"],
          function (result) {
            chrome.runtime.sendMessage({
              greeting: "INTERACTION",
              domain: "All domains",
              setting: "Categories",
              prevSetting: result.PREV_CHOICE,
              newSetting: result.USER_CHOICES,
              location: "Options page",
              subcollection: "Privacy Choice",
            });
          }
        );
        chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
        createDefaultSettingInfo();
        updatePrefScheme4();
      }
    });
  });
}

// Filtered lists code heavily inspired by
function filterList() {
  let input, list, li, count;
  input = document.getElementById("searchbar").value.toLowerCase();
  list = document.getElementById("domainlist-main");
  li = list.getElementsByTagName("li");
  count = li.length;

  for (let i = 0; i < count; i++) {
    let d = li[i].getElementsByClassName("domain")[0];
    let txtValue = d.innerText;
    if (txtValue.toLowerCase().indexOf(input) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}

// Update the check list based on the user's choice in scheme 3
function updatePrefScheme3() {
  chrome.storage.local.get(
    ["DOMAINS", "CHECKLIST", "USER_CHOICES", "NPSLIST"],
    function (result) {
      let domains = result.DOMAINS;
      for (let d in domains) {
        // by default, do not send GPC signals
        let value = false;
        // if user chose extremely privacy sensitive: send GPC signals
        if (result.USER_CHOICES == "High Privacy-Sensitivity") value = true;
        // if user chose not privacy sensitive: do not send GPC signals
        else if (result.USER_CHOICES == "Low Privacy-Sensitivity") {
          value = false;
          if (result.NPSLIST.includes(d)) value = true;
        }
        // if the user chose moderately gpc signals
        else if (result.USER_CHOICES == "Medium Privacy-Sensitivity") {
          // by default, the GPC signals are not sent unless the currentDomain is the the checkList
          value = false;
          if (result.CHECKLIST.includes(d)) value = true;
        }
        // add the currentDomain and store it in the local storage
        domains[d].bool = value;
      }
      chrome.storage.local.set({ DOMAINS: domains });
      createList();
      addToggleListeners();
      // notify background to update the cache used for look up
      chrome.runtime.sendMessage({
        greeting: "UPDATE CACHE",
        newEnabled: "dontSet",
        newDomains: domains,
        newDomainlistEnabled: "dontSet",
        newApplyAll: "dontSet",
      });
    }
  );
}

// Update the check list based on the user's choice in scheme 4
async function updatePrefScheme4() {
  chrome.storage.local.get(
    ["DOMAINS", "CHECKLIST", "CHECKNOTLIST", "USER_CHOICES"],
    async function (result) {
      let checkList = [];
      let checkNotList = [];
      let userChoices = result.USER_CHOICES;
      // Parse the networks json file based on the user's response to JSON
      await fetch("../../json/services.json")
        .then((response) => response.text())
        .then((result) => {
          let networks = JSON.parse(result)["categories"];
          for (let category of Object.keys(userChoices)) {
            if (userChoices[category] == true) {
              if (category != "Others") {
                if (category === "Fingerprinting") {
                  for (let cat of [
                    "FingerprintingGeneral",
                    "FingerprintingInvasive",
                  ]) {
                    for (let n of networks[cat]) {
                      for (let c of Object.values(n)) {
                        for (let list of Object.values(c)) {
                          checkList = checkList.concat(list);
                        }
                      }
                    }
                  }
                } else if (category === "Content & Social") {
                  for (let cat of ["Content", "Social", "Disconnect"]) {
                    for (let n of networks[cat]) {
                      for (let c of Object.values(n)) {
                        for (let list of Object.values(c)) {
                          checkList = checkList.concat(list);
                        }
                      }
                    }
                  }
                } else {
                  for (let n of networks[category]) {
                    for (let c of Object.values(n)) {
                      for (let list of Object.values(c)) {
                        checkList = checkList.concat(list);
                      }
                    }
                  }
                }
              }
            } else {
              if (category != "Others") {
                if (category === "Fingerprinting") {
                  for (let cat of [
                    "FingerprintingGeneral",
                    "FingerprintingInvasive",
                  ]) {
                    for (let n of networks[cat]) {
                      for (let c of Object.values(n)) {
                        for (let list of Object.values(c)) {
                          checkNotList = checkNotList.concat(list);
                        }
                      }
                    }
                  }
                } else if (category === "Content & Social") {
                  for (let cat of ["Content", "Social", "Disconnect"]) {
                    for (let n of networks[cat]) {
                      for (let c of Object.values(n)) {
                        for (let list of Object.values(c)) {
                          checkNotList = checkNotList.concat(list);
                        }
                      }
                    }
                  }
                } else {
                  for (let n of networks[category]) {
                    for (let c of Object.values(n)) {
                      for (let list of Object.values(c)) {
                        checkNotList = checkNotList.concat(list);
                      }
                    }
                  }
                }
              }
            }
          }
        });
      chrome.storage.local.set({
        CHECKLIST: checkList,
        CHECKNOTLIST: checkNotList,
      });

      let domains = result.DOMAINS;
      for (let currentDomain in domains) {
        // by default, do not send GPC signals
        let value = false;
        // send GPC signals if the currentDomain is in the checkList
        if (checkList.includes(currentDomain)) value = true;
        else {
          // send GPC is the currentDomain is not on the checkList, but the user has chosen Others and the currentDomain is not on the checknotlist
          if (result.USER_CHOICES["Others"] == true) {
            if (!checkNotList.includes(currentDomain)) value = true;
          }
        }
        // add the currentDomain and store it in the local storage
        domains[currentDomain].bool = value;
      }
      chrome.storage.local.set({ DOMAINS: domains });
      createList();
      addToggleListeners();
      // notify background to update the cache used for look up
      chrome.runtime.sendMessage({
        greeting: "UPDATE CACHE",
        newEnabled: "dontSet",
        newDomains: domains,
        newDomainlistEnabled: "dontSet",
        newApplyAll: "dontSet",
      });
    }
  );
}


