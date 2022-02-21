// Sets DOMAINS[domainKey] to true
async function turnOnGPC(domainKey) {
  console.log("Turning GPC on for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = true;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Sets DOMAINS[domainKey] to false
async function turnOffGPC(domainKey) {
  console.log("Turning GPC off for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = false;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Removes DOMAINS[domainKey] from DOMAINS
export async function deleteDomain(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    delete new_domains[domainKey];
    chrome.storage.local.set({ DOMAINS: new_domains });
    chrome.runtime.sendMessage({
      greeting: "UPDATE CACHE",
      newEnabled: "dontSet",
      newDomains: new_domains,
      newDomainlistEnabled: "dontSet",
      newApplyAll: "dontSet",
    });
  });
}

// Returns true if all domains are toggled on, false otherwise
export function allOn(domains) {
  for (let d in domains) {
    if (domains[d].bool === false) return false;
  }
  return true;
}

// Returns true if all domains are toggled off, false otherwise
export function allOff(domains) {
  for (let d in domains) {
    if (domains[d].bool === true) return false;
  }
  return true;
}

// Generates the HTML that will build the domainlist switch for a given domain in the domainlist
export function buildToggle(domain, bool) {
  let toggle;
  if (bool) toggle = `<input type="checkbox" id="${domain}" checked />`;
  else toggle = `<input type="checkbox" id="${domain}" />`;
  return toggle;
}

// Creates the specific Domain List toggles as well as the perm delete
export function addToggleListeners() {
  chrome.storage.local.get(["DOMAINS"], function (result) {
    for (let domain in result.DOMAINS) {
      addDomainToggleListener(domain, domain);
      addDeleteButtonListener(domain);
    }
  });
}

// Turn on / off the domain from the setting page
async function addDomainToggleListener(elementId, domain) {
  document.getElementById(elementId).addEventListener("click", () => {
    chrome.storage.local.set(
      { ENABLED: true, DOMAINLIST_ENABLED: true },
      function () {
        chrome.storage.local.get(
          ["DOMAINS", "UV_SETTING", "UI_SCHEME"],
          function (result) {
            console.log("The current setting for ", domain, " is: ", result.DOMAINS[domain])
            if (result.DOMAINS[domain] == true) {
              turnOffGPC(domain);
              chrome.runtime.sendMessage({greeting: "DOMAIN SPECIFIC GPC OFF", domainKey: domain});
              if (result.UI_SCHEME == 1) {
                chrome.runtime.sendMessage({
                  greeting: "INTERACTION",
                  domain: domain,
                  setting: "GPC signal",
                  prevSetting: "Don't allow tracking",
                  newSetting: "Allow tracking",
                  universalSetting: result.UV_SETTING,
                  location: "Options page",
                  subcollection: "Domain",
                });
              } else {
                chrome.runtime.sendMessage({
                  greeting: "INTERACTION",
                  domain: domain,
                  setting: "GPC signal",
                  prevSetting: "Don't allow tracking",
                  newSetting: "Allow tracking",
                  universalSetting: null,
                  location: "Options page",
                  subcollection: "Domain",
                });
              }
            } else {
              turnOnGPC(domain);
              chrome.runtime.sendMessage({greeting: "DOMAIN SPECIFIC GPC ON", domainKey: domain});
              if (result.UI_SCHEME == 1) {
                chrome.runtime.sendMessage({
                  greeting: "INTERACTION",
                  domain: domain,
                  setting: "GPC signal",
                  prevSetting: "Allow tracking",
                  newSetting: "Don't allow tracking",
                  universalSetting: result.UV_SETTING,
                  location: "Options page",
                  subcollection: "Domain",
                });
              } else {
                chrome.runtime.sendMessage({
                  greeting: "INTERACTION",
                  domain: domain,
                  setting: "GPC signal",
                  prevSetting: "Allow tracking",
                  newSetting: "Don't allow tracking",
                  universalSetting: null,
                  location: "Options page",
                  subcollection: "Domain",
                });
              }
            }
          }
        );
      }
    );
  });
}

// Toggle delete buttons for each domain
function addDeleteButtonListener(domain) {
  document.getElementById(`delete ${domain}`).addEventListener("click", () => {
    deleteDomain(domain);
    document.getElementById(`li ${domain}`).remove();
    chrome.storage.local.get(["UV_SETTING"], function (result) {
      chrome.runtime.sendMessage({
        greeting: "INTERACTION",
        domain: domain,
        setting: "Delete domain",
        prevSetting: null,
        newSetting: null,
        universalSetting: result.UV_SETTING,
        location: "Options page",
        subcollection: "Domain",
      });
    });
  });
}

// "Do not allow tracking for all" button is clicked
export function handleToggleAllOn() {
  // "Apply all" box isn't checked
  let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`;
  if (confirm(toggleOn_prompt)) {
    chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
      if (allOff(result.DOMAINS) === false && allOn(result.DOMAINS) !== true) {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC signal",
          prevSetting: "Personalized domain list",
          newSetting: "Send signal",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      } else if (allOff(result.DOMAINS) === true) {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC signal",
          prevSetting: "Don't send signal",
          newSetting: "Send signal",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      } else {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC Signal",
          prevSetting: "Send signal",
          newSetting: "No change",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      }
      let new_domains = result.DOMAINS;
      for (let d in new_domains) {
        new_domains[d].bool = true;
      }
      chrome.runtime.sendMessage({
        greeting: "UPDATE CACHE",
        newEnabled: "dontSet",
        newDomains: new_domains,
        newDomainlistEnabled: "dontSet",
      });
      chrome.storage.local.set({ DOMAINS: new_domains });
      createList();
      addToggleListeners();
    });
  }
}

// "Allow tracking for all" button is clicked
export function handleToggleAllOff() {
  let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`;
  if (confirm(toggleOff_prompt)) {
    chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
      if (allOn(result.DOMAINS) === false && allOff(result.DOMAINS) === false) {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC Signal",
          prevSetting: "Personalized domain list",
          newSetting: "Don't send signal",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      } else if (allOn(result.DOMAINS) === true) {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC Signal",
          prevSetting: "Send signal",
          newSetting: "Don't send signal",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      } else {
        chrome.runtime.sendMessage({
          greeting: "INTERACTION",
          domain: "All existing domains",
          setting: "GPC Signal",
          prevSetting: "Don't send signal",
          newSetting: "No change",
          universalSetting: result.UV_SETTING,
          location: "Options page",
          subcollection: "Domain",
        });
      }
      let new_domains = result.DOMAINS;
      for (let d in new_domains) {
        new_domains[d].bool = false;
      }
      chrome.storage.local.set({ DOMAINS: new_domains });
      chrome.runtime.sendMessage({
        greeting: "UPDATE CACHE",
        newEnabled: "dontSet",
        newDomains: new_domains,
        newDomainlistEnabled: "dontSet",
      });
      createList();
      addToggleListeners();
    });
  }
}

// "Apply all" switch is hit
export function handleApplyAllSwitch() {
  chrome.storage.local.get(["UV_SETTING", "APPLY_ALL"], function (result) {
    if (result.APPLY_ALL) {
      chrome.runtime.sendMessage({
        greeting: "INTERACTION",
        domain: "All future domains",
        setting: "Universal Setting",
        prevSetting: result.UV_SETTING,
        newSetting: "Off",
        universalSetting: "Off",
        location: "Options page",
        subcollection: "Domain",
      });
      chrome.storage.local.set({ DOMAINLIST_ENABLED: true });
      chrome.storage.local.set({ UV_SETTING: "Off" });
      chrome.storage.local.set({ APPLY_ALL: false });
      chrome.storage.local.set({ ENABLED: true });
      createDefaultSettingInfo();
      chrome.runtime.sendMessage({
        greeting: "UPDATE CACHE",
        newEnabled: true,
        newDomains: "dontSet",
        newDomainlistEnabled: true,
      });
    } else {
      createDefaultSettingInfo();
      UIkit.modal("#future_setting_prompt").show();
      createDefaultSettingInfo();
    }
  });
}

// User interacts with future setting prompt, shown when users attempt to turn on the "Apply all" switch
export function handleFutureSettingPromptEvent(event) {
  // User hits "Allow tracking for all"
  if (event.target.id == "allow-future-btn") {
    chrome.storage.local.set({ APPLY_ALL: true });
    chrome.storage.local.set({ UV_SETTING: "Don't send signal to all" });
    chrome.storage.local.set({ ENABLED: false });
    createDefaultSettingInfo();
    chrome.runtime.sendMessage({
      greeting: "INTERACTION",
      domain: "All future domains",
      setting: "Universal Setting",
      prevSetting: "Off",
      newSetting: "Don't send signal to all",
      universalSetting: "Don't send signal to all",
      location: "Options page",
      subcollection: "Domain",
    });
  }
  // User hits "Don't allow tracking" for all
  else if (event.target.id == "dont-allow-future-btn") {
    chrome.storage.local.set({ APPLY_ALL: true });
    chrome.storage.local.set({ UV_SETTING: "Send signal to all" });
    chrome.storage.local.set({ ENABLED: true });
    createDefaultSettingInfo();
    chrome.runtime.sendMessage({
      greeting: "INTERACTION",
      domain: "All future domains",
      setting: "Universal Setting",
      prevSetting: "Off",
      newSetting: "Send signal to all",
      universalSetting: "Send signal to all",
      location: "Options page",
      subcollection: "Domain",
    });
  }
  // Otherwise, they hit cancel and nothing changes
}

// Entire domain list is deleted
export function handleDeleteDomainListEvent() {
  let delete_prompt = `Are you sure you would like to permanently delete all domains from the Domain List? NOTE: Domains will be automatically added back to the list when the domain is requested again.`;
  if (confirm(delete_prompt)) {
    chrome.storage.local.get(["UV_SETTING"], function (result) {
      chrome.runtime.sendMessage({
        greeting: "INTERACTION",
        domain: "All existing domains",
        setting: "Delete domain",
        prevSetting: null,
        newSetting: null,
        universalSetting: result.UV_SETTING,
        location: "Options page",
        subcollection: "Domain",
      });
    });
    chrome.storage.local.set({ DOMAINS: {} });
    chrome.runtime.sendMessage({
      greeting: "UPDATE CACHE",
      newEnabled: "dontSet",
      newDomains: {},
      newDomainlistEnabled: "dontSet",
    });
  }
  createList();
  addToggleListeners();
}
