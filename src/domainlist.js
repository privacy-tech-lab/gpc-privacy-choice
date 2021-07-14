// Exports the domainlist in local storage as a .txt file
export async function handleDownload() {
    chrome.storage.local.get(["DOMAINS"], function (result) {
      var DOMAINS = result.DOMAINS;
      var blob = new Blob([JSON.stringify(DOMAINS, null, 4)], {type: "text/plain;charset=utf-8"});
      saveAs(blob, "OptMeowt_backup.json");
    })
}

// Sets DOMAINS[domainKey] to true
export async function addToDomainlist(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = true;
    chrome.storage.local.set({ DOMAINS: new_domains });
    chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet', newApplyAll: 'dontSet'  })
  });
}

// Sets DOMAINS[domainKey] to false
export async function removeFromDomainlist(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = false;
    chrome.storage.local.set({ DOMAINS: new_domains });
    chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet', newApplyAll: 'dontSet'  })
  });
}

// Removes DOMAINS[domainKey] from DOMAINS
export async function permRemoveFromDomainlist(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    delete new_domains[domainKey]
    chrome.storage.local.set({ DOMAINS: new_domains });
    chrome.runtime.sendMessage
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet', newApplyAll: 'dontSet'  })
  });
}

// Returns true if all domains are toggled on, false otherwise
export function allOn(domains) {
    for (let d in domains) {
      if (domains[d] === false) return false;
    };
  return true
}

// Returns true if all domains are toggled off, false otherwise
export function allOff(domains) {
    for (let d in domains) {
      if (domains[d] === true) return false;
    };
  return true
}

//Sends message depending on whether the previous setting was customized or not (whilst turning off all the toggles)
export async function toAllOff(domains) {
  if (allOn(domains) === false && allOff(domains) !== true) {
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains in list" , origin: "Options page", prevSetting: "Personalized domain list" , newSetting: "Allow tracking", applyAll: true })
  }
  if (allOn(domains) === true) {
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains in list" , origin: "Options page", prevSetting: "Don't Allow Tracking" , newSetting: "Allow tracking", applyAll: true })
  }
}

//Sends message depending on whether the previous setting was customized or not (whilst turning on all toggles)
export async function toAllOn(domains) {
  if (allOff(domains) === false && allOn(domains) !== true) {
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains in list" , origin: "Options page", prevSetting: "Personalized domain list" , newSetting: "Don't allow tracking", applyAll: true })
  }
  if (allOff(domains) === true) {
    chrome.runtime.sendMessage({greeting:"INTERACTION", domain: "All existing domains in list" , origin: "Options page", prevSetting: "Allow Tracking" , newSetting: "Don't allow tracking", applyAll: true })
  }
}

// Generates the HTML that will build the domainlist switch for a given domain in the domainlist
export function buildToggle(domain, bool) {
  let toggle;
  if (bool) toggle = `<input type="checkbox" id="${domain}" checked />`;
  else toggle = `<input type="checkbox" id="${domain}" />`;
  return toggle
}

// Turn on / off the domain from the setting page
export async function toggleListener(elementId, domain) {

  document.getElementById(elementId).addEventListener("click", () => {
    chrome.storage.local.set({ ENABLED: true, DOMAINLIST_ENABLED: true });
    chrome.storage.local.get(["DOMAINS"], function (result) {
      if (result.DOMAINS[domain]==true) {
        removeFromDomainlist(domain);
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: domain, origin: "Options page", prevSetting: "Don't allow tracking" , newSetting: "Allow tracking", applyAll: false })
      }
      else {
        addToDomainlist(domain);
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: domain , origin: "Options page", prevSetting: "Allow tracking" , newSetting: "Don't allow tracking", applyAll: false })
      }
    chrome.runtime.sendMessage
              ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: 'dontSet' , newDomainlistEnabled: true, newApplyAll: 'dontSet' })
    })
  })
}