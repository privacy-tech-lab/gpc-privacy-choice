// Add rules to the rule set
export function addRule(domain, id) {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: id,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "Sec-GPC", operation: "set", value: "1" },
            { header: "DNT", operation: "set", value: "1" },
          ],
        },
        condition: {
          urlFilter: "||^" + domain + "*",
        },
      },
    ],
  });
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
  console.log("New rule added with id", id);
}

// Remove rules from the rule set
export function rmRule(id) {
  console.log("Remove rule with id", id);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
}

async function clearRules() {
  chrome.declarativeNetRequest.getDynamicRules((rules) => {
    console.log("before: ", rules);
    for (let id = 1; id <= rules.length; id++) {
      rmRule(id);
    }
  });
}

// Create new rule sets based on the user privacy profile
export async function updateProfileRuleSets() {
  // clear all existing rules
  await clearRules();
  chrome.storage.local.get(["CHECKLIST", "USER_CHOICES"], function (result) {
    console.log(result.USER_CHOICES);
    // High privacy sensitivity => add all domains
    if (result.USER_CHOICES == "High Privacy-Sensitivity") {
      const promise = chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: [
                { header: "Sec-GPC", operation: "set", value: "1" },
                { header: "DNT", operation: "set", value: "1" },
              ],
            },
            condition: {
              urlFilter: "*",
            },
          },
        ],
      });
      promise.then(function (res) {
        chrome.declarativeNetRequest.getDynamicRules((rules) =>
          console.log("After: ", rules)
        );
      });
    }
    // Medium privacy sensitivity => add all domains from CHECKLIST
    else if (result.USER_CHOICES == "Medium Privacy-Sensitivity") {
      let domains = result.CHECKLIST;
      console.log(domains);
      const promise = chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            action: {
              type: "modifyHeaders",
              requestHeaders: [
                { header: "Sec-GPC", operation: "set", value: "1" },
                { header: "DNT", operation: "set", value: "1" },
              ],
            },
            condition: {
              urlFilter: "|*",
              domains: domains,
            },
          },
        ],
      });
      promise.then(function (res) {
        chrome.declarativeNetRequest.getDynamicRules((rules) =>
          console.log("After: ", rules)
        );
      });
    }
  });
}

export function updateCategoryRuleSets() {
  console.log("updateCategoryRuleSets to be implemented");
}
