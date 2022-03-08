/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/

!IMPORT NOTES!
Dynamic rule with id == 2 is reserved for specifying domains from which GPC headers should be attached
*/

// Generate unique id based on the domain url
function getIdFromUrl(url) {
  String.prototype.hashCode = function () {
    var hash = 0,
      i,
      chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  return url.hashCode();
}

// Add a new rule to rule set specifying the urls of the rule
export async function addUrlRule(domain) {
  let id = getIdFromUrl(domain);
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: id,
        priority: 3,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "Sec-GPC", operation: "set", value: "1" },
            { header: "DNT", operation: "set", value: "1" },
          ],
        },
        condition: {
          urlFilter: "*" + domain + "*",
          resourceTypes: ["main_frame"],
        },
      },
    ],
  });
  //   chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
  console.log("New rule added with id", id);
}

// Remove a rule with id from the rule set
export async function rmUrlRule(domain) {
  let id = await getIdFromUrl(domain);
  console.log("Remove rule with id", id);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
  //   chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
}

// Add a new domain to rule 2's domain field
export async function addDomainToRule(domain) {
  chrome.declarativeNetRequest.getDynamicRules((res) => {
    let domains;
    let rule = res.filter((obj) => {
      return obj.id === 2;
    });
    // console.log(rule);
    if (rule.length === 0) {
      domains = [];
    } else {
      domains = rule[0].condition.domains;
    }
    // console.log(domains);
    let id = 2;
    domains.push(domain);
    console.log(domains, domain);
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: id,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              { header: "Sec-GPC", operation: "set", value: "1" },
              { header: "DNT", operation: "set", value: "1" },
            ],
          },
          condition: {
            domains: domains,
            resourceTypes: [
              "main_frame",
              "sub_frame",
              "stylesheet",
              "script",
              "image",
              "font",
              "object",
              "xmlhttprequest",
              "ping",
              "csp_report",
              "media",
              "websocket",
              "webtransport",
              "webbundle",
            ],
          },
        },
      ],
      removeRuleIds: [2],
    });
    chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
    console.log("Rule modified with id", id);
  });
}

// Remove a domain from rule 2's domains field
export async function removeDomainFromRule(domain) {
  chrome.declarativeNetRequest.getDynamicRules((res) => {
    let domains;
    let rule = res.filter((obj) => {
      return obj.id === 2;
    });
    console.log(rule);
    if (rule.length === 0) {
      domains = [];
    } else {
      domains = rule[0].condition.domains;
    }
    for (var i = domains.length - 1; i >= 0; i--) {
      if (domains[i] === domain) {
        domains.splice(i, 1);
      }
    }
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 2,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              { header: "Sec-GPC", operation: "set", value: "1" },
              { header: "DNT", operation: "set", value: "1" },
            ],
          },
          condition: {
            domains: domains,
            resourceTypes: [
              "main_frame",
              "sub_frame",
              "stylesheet",
              "script",
              "image",
              "font",
              "object",
              "xmlhttprequest",
              "ping",
              "csp_report",
              "media",
              "websocket",
              "webtransport",
              "webbundle",
            ],
          },
        },
      ],
      removeRuleIds: [2],
    });
    chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
    console.log("rule modified with id", 2);
  });
}

// Clear all rules from the rule set
export async function clearRules() {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    for (let r in rules) {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [rules[r].id],
      });
    }
  });
}
