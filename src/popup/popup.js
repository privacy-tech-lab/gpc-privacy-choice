/*
OptMeowt is licensed under the MIT License
Copyright (c) 2020 Kuba Alicki, Daniel Knopf, Abdallah Salia, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/
*/

import { addToDomainlist, removeFromDomainlist } from "../domainlist.js"

// Initialize the pop up window the pop up window
document.addEventListener("DOMContentLoaded", (event) => {
  // Send the message that the DOM has loaded to background.js to clear global_domains
  chrome.runtime.sendMessage({
    msg: "LOADED",
    data: Date.now(),
  });

  // Send the current domain such as "google.dom" for the currently active tab
  let parsed_domain = "";
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    let tab = tabs[0];
    try {
      let url = new URL(tab.url);
      let parsed = psl.parse(url.hostname);
      parsed_domain = parsed.domain;
      if (parsed_domain === null) {
        document.getElementById("dns-body").style.display = "none";
        document.getElementById("domain").style.display = "none";
      } else {
        document.getElementById("domain").innerHTML = parsed_domain;
      }
    } catch (e) {
      document.getElementById("domain").innerHTML = location.href;
    }
  });

  // Set enable/disable button
  chrome.storage.local.get(["ENABLED"], function (result) {
    if (result.ENABLED == undefined) {
      document.getElementById("img").src = "../assets/play-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Enable");
    } else if (result.ENABLED) {
      document.getElementById("img").src = "../assets/pause-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Disable");
      document.getElementById("content").style.opacity = "1";
      document.getElementById("message").style.opacity = "0";
      document.getElementById("message").style.display = "none";
    } else {
      document.getElementById("message").style.display = "";
      document.getElementById("img").src = "../assets/play-circle-outline.svg";
      document
        .getElementById("enable-disable")
        .setAttribute("uk-tooltip", "Enable");
      document.getElementById("content").style.opacity = "0.1";
      document.getElementById("message").style.opacity = "1";
    }
  });

  // Toggle enable/disable extension switch
  document.getElementById("enable-disable").addEventListener("click", () => {
    chrome.storage.local.get(["ENABLED"], function (result) {
      if (result.ENABLED) {
        document.getElementById("message").style.display = "";
        document.getElementById("img").src = "../assets/play-circle-outline.svg";
        document
          .getElementById("enable-disable")
          .setAttribute("uk-tooltip", "Enable");
        document.getElementById("content").style.opacity = "0.1";
        document.getElementById("message").style.opacity = "1";
        chrome.runtime.sendMessage({ ENABLED: false });
      } else {
        document.getElementById("img").src = "../assets/pause-circle-outline.svg";
        document
          .getElementById("enable-disable")
          .setAttribute("uk-tooltip", "Disable");
        document.getElementById("content").style.opacity = "1";
        document.getElementById("message").style.opacity = "0";
        document.getElementById("message").style.display = "none";
        chrome.runtime.sendMessage({ ENABLED: true });
      }
    });
  });

  // Sets domain list switch to correct position and adds listener
  chrome.storage.local.get(["DOMAINS"], function (result) {
    // Sets popup view
    let checkbox = "";
    let text = "";
    if (result.DOMAINS[parsed_domain]) {
      checkbox = `<input type="checkbox" id="input" checked/><span></span>`;
      text = "Do Not Sell Enabled";
    } else {
      checkbox = `<input type="checkbox" id="input"/><span></span>`;
      text = "Do Not Sell Disabled";
    }
    document.getElementById("switch-label").innerHTML = checkbox;
    document.getElementById("dns-text").innerHTML = text;
    document.getElementById("switch-label").addEventListener("click", () => {
      chrome.storage.local.set({ ENABLED: true, DOMAINLIST_ENABLED: true });
      chrome.storage.local.get(["DOMAINS"], function (result) {
        let text = "";
        if (result.DOMAINS[parsed_domain]) {
          text = "Do Not Sell Disabled";
          removeFromDomainlist(parsed_domain);
        } else {
          text = "Do Not Sell Enabled";
          addToDomainlist(parsed_domain);
        }
        document.getElementById("dns-text").innerHTML = text;
      })
    })
  })

  // Generates `X domains receiving signals` section in popup
  chrome.storage.local.get(["DOMAINS"], (result) => {
    var count = Object.keys(result.DOMAINS).filter((key) => {
      return result.DOMAINS[key] == true;
    }).length
    document.getElementById("block-count").innerHTML = `
        <p id = "domain-count" class="blue-heading" style="font-size:25px; 
        font-weight: bold">${count}</p> domains receiving signals
    `;
  })
})

// Add onClick event listener to direct the user to options page
document.getElementById("more").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// Sends "INIT" message to background page to start badge counter
chrome.runtime.sendMessage({
  msg: "INIT",
  data: null,
});