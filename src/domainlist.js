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

export function updatePrefScheme3() {
  chrome.storage.local.get(["DOMAINS", "CHECKLIST", "USER_CHOICES", "ADVLIST"], function (result){
    let domains = result.DOMAINS;
    for(let d in domains){
      // by default, do not send GPC signals
      let value = false;
      // if user chose extremely privacy sensitive: send GPC signals
      if (result.USER_CHOICES == "Extremely Privacy-Sensitive") value = true;
      // if user chose not privacy sensitive: do not send GPC signals
      else if (result.USER_CHOICES == "Not Privacy-Sensitive")  {
          value = false;
          if (result.ADVLIST.includes(d)) value = true;
      }
      // if the user chose moderately gpc signals
      else if (result.USER_CHOICES == "Moderately Privacy-Sensitive"){
          // by default, the GPC signals are not sent unless the currentDomain is the the checkList
          value = false;
          if (result.CHECKLIST.includes(d)) value = true;
      }
      // add the currentDomain and store it in the local storage
      domains[d] = value;
      console.log(domains)
    }
    chrome.storage.local.set({DOMAINS: domains});
    // notify background to update the cache used for look up
    chrome.runtime.sendMessage({greeting: "UPDATE CACHE", newEnabled:'dontSet' , newDomains: domains , newDomainlistEnabled: "dontSet", newApplyAll: 'dontSet' })
})}



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
    chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
      if (result.DOMAINS[domain]==true) {
        removeFromDomainlist(domain);
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: domain, location: "Options page", setting: "GPC signal", prevSetting: "Don't allow tracking" , newSetting: "Allow tracking", universalSetting: result.UV_SETTING})
      }
      else {
        addToDomainlist(domain);
        chrome.runtime.sendMessage({greeting:"INTERACTION", domain: domain, location: "Options page", setting: "GPC signal", prevSetting: "Allow tracking" , newSetting: "Don't allow tracking", universalSetting: result.UV_SETTING})
      }
    chrome.runtime.sendMessage
              ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: 'dontSet' , newDomainlistEnabled: true, newApplyAll: 'dontSet' })
    })
  })
}