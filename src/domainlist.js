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
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet' })
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
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet' })
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
                ({greeting:"UPDATE CACHE", newEnabled:'dontSet' , newDomains: new_domains , newDomainlistEnabled: 'dontSet' })
  });
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
      if (result.DOMAINS[domain]==true) removeFromDomainlist(domain);
      else addToDomainlist(domain);
    chrome.runtime.sendMessage
              ({greeting:"UPDATE CACHE", newEnabled:true , newDomains: 'dontSet' , newDomainlistEnabled: 'dontSet' })
    })
  })
}