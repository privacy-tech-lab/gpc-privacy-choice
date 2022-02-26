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
  handleFutureSettingPromptEvent,
  addCategoriesEventListener,
  addGPCEventListener,
  addPrivacyProfileEventListener,
} from "./domainlist-util.js";

import {
  createDomainlistManagerButtons,
  createDefaultSettingInfo,
  createList,
  filterList,
} from "./domainlist-ui.js";

const domainListHeadings = {
  title: "Global Privacy Control (GPC) Settings",
  subtitle: "Review or Modify Your GPC Settings",
};

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