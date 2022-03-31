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

// Add a new rule with id to the rule set that adds gpc to requests being sent to domain
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
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
  console.log("New rule added with id", id);
}

// Get list of originating domains where GPC is enabled
export async function addDomainRule(domain) {
  chrome.declarativeNetRequest.getDynamicRules((res) => {
    let domains;
    let rule = res.filter((obj) => {
      return obj.id === 2;
    });
    if (rule.length === 0) {
      domains = [];
    } else {
      domains = rule[0].condition.domains;
    }
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

//disables GPC for certain domain when universal GPC is on
export async function addDisableDomainRule(domain) {
  chrome.declarativeNetRequest.getDynamicRules((res) => {
    let domains;
    let rule = res.filter((obj) => {
      return obj.id === 3;
    });
    console.log(rule);
    if (rule.length === 0) {
      domains = [];
    } else {
      domains = rule[0].condition.domains;
    }
    console.log(domains);
    let id = 3;
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
              { header: "Sec-GPC", operation: "remove" },
              { header: "DNT", operation: "remove" },
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
      removeRuleIds: [3],
    });
    chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
    console.log("Rule modified with id", id);
  });
}

//enables GPC for certain domain when universal GPC is on
export async function rmDisableDomainRule(domain) {
  chrome.declarativeNetRequest.getDynamicRules((res) => {
    let domains;
    let rule = res.filter((obj) => {
      return obj.id === 3;
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
      if (domains.length == 0) {
        rmRuleId(2);
        return;
      }
    }
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [
        {
          id: 3,
          priority: 1,
          action: {
            type: "modifyHeaders",
            requestHeaders: [
              { header: "Sec-GPC", operation: "remove" },
              { header: "DNT", operation: "remove" },
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
      removeRuleIds: [3],
    });
    chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
    console.log("rule modified with id", 3);
  });
}

//turn on global medium profile
export function mediumRulesOn() {
  chrome.declarativeNetRequest.updateEnabledRulesets(
    {
      enableRulesetIds: [
        "advertising",
        "FG",
        "FI",
        "cryptomining",
        "analytics",
        "disconnect",
      ],
    },
    () => console.log("medium profile enbled")
  );
}

//turn on global GPC
export function globalRuleOn() {
  chrome.declarativeNetRequest.updateEnabledRulesets(
    { enableRulesetIds: ["universal_GPC"] },
    () => console.log("universal_GPC rule enabled")
  );
}
//turn off global GPC
export function globalRuleOff() {
  chrome.declarativeNetRequest.updateEnabledRulesets(
    { disableRulesetIds: ["universal_GPC"] },
    () => console.log("universal_GPC rule disabled")
  );
}

export function updateCategories(choices) {
  console.log(choices);
  let enabled = [];
  let disabled = [];
  if (choices["Advertising"]) {
    enabled.push("advertising");
  } else disabled.push("advertising");
  if (choices["Analytics"]) {
    enabled.push("analytics");
  } else disabled.push("analytics");
  if (choices["Analytics"]) {
    enabled.push("analytics");
  } else disabled.push("analytics");
  if (choices["Content & Social"]) {
    enabled.push("content");
    enabled.push("social");
  } else {
    disabled.push("content");
    disabled.push("social");
  }
  if (choices["Fingerprinting"]) {
    enabled.push("FG");
    enabled.push("FI");
  } else {
    disabled.push("FG");
    disabled.push("FI");
  }
  if (choices["Cryptomining"]) {
    enabled.push("cryptomining");
  } else {
    disabled.push("cryptomining");
  }
  if (choices["Others"]) globalRuleOn();
  else globalRuleOff();
  chrome.declarativeNetRequest.updateEnabledRulesets(
    { enableRulesetIds: enabled, disableRulesetIds: disabled },
    () => console.log("categories updated")
  );
}

// Add a new rule with id to the rule set that adds gpc to requests originating from a set of domains
// export async function addDomainRule(domain) {
// 	getEnabledDomains();
// }

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
      if (domains.length == 0) {
        rmRuleId(2);
        return;
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

// Remove a rule with url from the rule set
export async function rmRuleUrl(url) {
  let id = await getIdFromUrl(url);
  console.log("Remove rule with id", id);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
}

// Remove a rule with id from the rule set
export async function rmRuleId(id) {
  console.log("Remove rule with id", id);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
}

// Clear dynamic rules from the rule set
export async function clearRules() {
  console.log("Clearing All Rules");
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    for (let r in rules) {
      chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [rules[r].id],
      });
    }
  });
}
