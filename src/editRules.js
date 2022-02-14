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
  console.log("New Rule Added");
}

// Remove rules from the rule set
export function rmRule(id) {
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
}
