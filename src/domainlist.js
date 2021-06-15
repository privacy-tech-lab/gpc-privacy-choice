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
  });
}

// Sets DOMAINS[domainKey] to false
export async function removeFromDomainlist(domainKey) {
  let new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    new_domains[domainKey] = false;
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Removes DOMAINS[domainKey] from DOMAINS
export async function permRemoveFromDomainlist(domainKey) {
  var new_domains = [];
  chrome.storage.local.get(["DOMAINS"], function (result) {
    new_domains = result.DOMAINS;
    delete new_domains[domainKey]
    chrome.storage.local.set({ DOMAINS: new_domains });
  });
}

// Generates the HTML that will build the domainlist switch for a given domain in the domainlist
export function buildToggle(domain, bool) {
  let toggle;
  if (bool) {
    // checkbox = `<input type="checkbox" id="select ${domain}"
    //           class="check text-color dark-checkbox" checked />`;
    toggle = `<input type="checkbox" id="${domain}" checked />`;
  } else {
    // checkbox = `<input type="checkbox" id="select ${domain}"
    //           class="check text-color dark-checkbox"/>`;
    toggle = `<input type="checkbox" id="${domain}" />`;
  }
  return toggle
}

// Creates an event listener that toggles a given domain's stored value in the domainlist if a user clicks on the object with the given element ID
export async function toggleListener(elementId, domain) {

  document.getElementById(elementId).addEventListener("click", () => {
    chrome.storage.local.set({ ENABLED: true, DOMAINLIST_ENABLED: true });
    chrome.storage.local.get(["DOMAINS"], function (result) {
      if (result.DOMAINS[domain]) {
        removeFromDomainlist(domain);
      } else {
        addToDomainlist(domain);
      }
    })
  })

}