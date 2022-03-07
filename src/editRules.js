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
		return hash;
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
					urlFilter: domain,
					resourceTypes: ["main_frame"],
				},
			},
		],
	});
	chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
	console.log("New rule added with id", id);
}

// Get list of originating domains where GPC is enabled
function getEnabledDomains() {
	let domains = chrome.declarativeNetRequest.getDynamicRules((res) => {
		let rule = res.filter((obj) => {
			return obj.id === 2;
		});
		if (rule.length === 0) {
			return [];
		} else {
			return rule[0].conditions.domains;
		}
	});
	return domains;
}

// Add a new rule with id to the rule set that adds gpc to requests originating from a set of domains
export async function addDomainRule(domain) {
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
					domains: getEnabledDomains().push(domain),
					resourceTypes: ["main_frame"],
				},
			},
		],
		removeRuleIds: [2],
	});
	chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
	console.log("Rule modified with id", id);
}

export async function removeDomainFromRule(domain) {
	let domains = await getEnabledDomains();
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
					resourceTypes: ["main_frame"],
				},
			},
		],
		removeRuleIds: [2],
	});
	chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
	console.log("rule modified with id", id);
}

// Remove a rule with id from the rule set
export async function rmRule(url) {
	let id = await getIdFromUrl(url);
	console.log("Remove rule with id", id);
	chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [id] });
	chrome.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
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
