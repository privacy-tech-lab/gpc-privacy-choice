// Add a new rule with id to the rule set
export async function addRule(domain, id, priority) {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [
      {
        id: id,
        priority: priority,
        action: {
          type: "modifyHeaders",
          requestHeaders: [
            { header: "Sec-GPC", operation: "set", value: "1" },
            { header: "DNT", operation: "set", value: "1" },
          ],
        },
        condition: {
          urlFilter: domain,
          resourceTypes: ["main_frame"],
        },
      },
    ],
  });
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
  console.log("New rule added with id", id);
}

// Remove a rule with id from the rule set
export async function rmRule(id) {
  console.log("Remove rule with id", id);
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
  chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
}

// Clear all rules from the rule set
export async function clearRules(ruleIds) {
  for (let id in ruleIds) {
    rmRule(id);
  }
}
