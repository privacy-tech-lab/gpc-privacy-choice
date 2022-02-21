// Sets DOMAINS[domainKey] to true
export async function turnOnGPC(domainKey) {
  console.log("turning gpc on for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = true;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Sets DOMAINS[domainKey] to false
export async function turnOffGPC(domainKey) {
  console.log("turning gpc off for: " + domainKey);
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey].bool = false;
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


