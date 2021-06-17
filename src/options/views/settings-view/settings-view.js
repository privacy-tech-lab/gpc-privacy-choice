/*
settings-view.js
================================================================================
settings-view.js loads settings-view.html when clicked on the options page
*/
import { renderParse, fetchParse } from "../../components/util.js";
import { handleDownload } from "../../../domainlist.js";
import "../../../libs-js/FileSaver.js";

const headings = {
  title: "Settings",
  subtitle: "Adjust extension settings",
};

// Creates the event listeners for the `Settings` page buttons and options
function eventListeners() {
  document
    .getElementById("settings-view-radio0")
    .addEventListener("click", () => {
      chrome.runtime.sendMessage({ ENABLED: true, DOMAINLIST_ENABLED: false });
      chrome.storage.local.set({ ENABLED: true, DOMAINLIST_ENABLED: false });
    });
  document
    .getElementById("settings-view-radio1")
    .addEventListener("click", () => {
      chrome.runtime.sendMessage({ ENABLED: false, DOMAINLIST_ENABLED: false });
      chrome.storage.local.set({ ENABLED: false, DOMAINLIST_ENABLED: false });
    });
  document
    .getElementById("settings-view-radio2")
    .addEventListener("click", () => {
      chrome.runtime.sendMessage({ ENABLED: true, DOMAINLIST_ENABLED: true });
      chrome.storage.local.set({ ENABLED: true, DOMAINLIST_ENABLED: true });
    });
  document
    .getElementById("download-button")
    .addEventListener("click", handleDownload);
}

// Renders the `Settings` view in the options page
export async function settingsView(scaffoldTemplate) {
  const body = renderParse(scaffoldTemplate, headings, "scaffold-component");
  let content = await fetchParse(
    "./views/settings-view/settings-view.html",
    "settings-view"
  );

  document.getElementById("content").innerHTML = body.innerHTML;
  document.getElementById("scaffold-component-body").innerHTML =
    content.innerHTML;

  chrome.storage.local.get(["ENABLED", "DOMAINLIST_ENABLED"], function (
    result
  ) {
    console.log(result.ENABLED);
    if (result.ENABLED == undefined) {
      chrome.storage.local.set({ ENABLED: true });
      document.getElementById("settings-view-radio0").checked = true;
    } else if (result.ENABLED) {
      document.getElementById("settings-view-radio0").checked = true;
    } else {
      document.getElementById("settings-view-radio1").checked = true;
    }
    if (result.DOMAINLIST_ENABLED) {
      document.getElementById("settings-view-radio2").checked = true;
    }
  });

  eventListeners();
}
