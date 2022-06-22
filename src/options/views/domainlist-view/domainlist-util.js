import {
	createDomainlistManagerButtons,
	createDefaultSettingInfo,
	createList,
	filterList,
} from "./domainlist-ui.js";

import { updatePrefScheme4, updatePrefScheme3 } from "./domainlist-view.js";

// Turn on / off the domain from the setting page
async function addDomainToggleListener(elementId, domain) {
	document.getElementById(elementId).addEventListener("click", () => {
		chrome.storage.local.set(
			{ ENABLED: true, DOMAINLIST_ENABLED: true },
			function () {
				chrome.storage.local.get(
					["DOMAINS", "UV_SETTING", "UI_SCHEME"],
					function (result) {
						console.log(
							"The current setting for ",
							domain,
							" is: ",
							result.DOMAINS[domain].bool
						);
						if (result.DOMAINS[domain].bool == true) {
							turnOffGPC(domain);
							if (result.UI_SCHEME == 1) {
								chrome.runtime.sendMessage({
									greeting: "INTERACTION",
									domain: domain,
									setting: "GPC signal",
									prevSetting: "Don't allow tracking",
									newSetting: "Allow tracking",
									universalSetting: result.UV_SETTING,
									location: "Options page",
									subcollection: "Domain",
								});
							} else {
								chrome.runtime.sendMessage({
									greeting: "INTERACTION",
									domain: domain,
									setting: "GPC signal",
									prevSetting: "Don't allow tracking",
									newSetting: "Allow tracking",
									universalSetting: null,
									location: "Options page",
									subcollection: "Domain",
								});
							}
						} else {
							turnOnGPC(domain);
							if (result.UI_SCHEME == 1) {
								chrome.runtime.sendMessage({
									greeting: "INTERACTION",
									domain: domain,
									setting: "GPC signal",
									prevSetting: "Allow tracking",
									newSetting: "Don't allow tracking",
									universalSetting: result.UV_SETTING,
									location: "Options page",
									subcollection: "Domain",
								});
							} else {
								chrome.runtime.sendMessage({
									greeting: "INTERACTION",
									domain: domain,
									setting: "GPC signal",
									prevSetting: "Allow tracking",
									newSetting: "Don't allow tracking",
									universalSetting: null,
									location: "Options page",
									subcollection: "Domain",
								});
							}
						}
					}
				);
			}
		);
	});
}

// Toggle delete buttons for each domain
// function addDeleteButtonListener(domain) {
// 	document
// 		.getElementById(`delete ${domain}`)
// 		.addEventListener("click", () => {
// 			deleteDomain(domain);
// 			document.getElementById(`li ${domain}`).remove();
// 			// delegate the edit of rule set to the background
// 			chrome.storage.local.get(["UV_SETTING"], function (result) {
// 				chrome.runtime.sendMessage({
// 					greeting: "INTERACTION",
// 					domain: domain,
// 					setting: "Delete domain",
// 					prevSetting: null,
// 					newSetting: null,
// 					universalSetting: result.UV_SETTING,
// 					location: "Options page",
// 					subcollection: "Domain",
// 				});
// 			});
// 		});
// }

// Sets DOMAINS[domainKey] to true
async function turnOnGPC(domainKey) {
	console.log("Turning GPC on for: " + domainKey);
	let new_domains = [];
	chrome.storage.local.get(["DOMAINS"], function (result) {
		new_domains = result.DOMAINS;
		new_domains[domainKey].bool = true;
		chrome.storage.local.set({ DOMAINS: new_domains });
	});
	chrome.runtime.sendMessage({
		greeting: "OPTION ENABLE GPC",
		domain: domainKey,
	});
}

// Sets DOMAINS[domainKey] to false
async function turnOffGPC(domainKey) {
	console.log("Turning GPC off for: " + domainKey);
	let new_domains = [];
	chrome.storage.local.get(["DOMAINS"], function (result) {
		new_domains = result.DOMAINS;
		new_domains[domainKey].bool = false;
		// id = new_domains[domainKey].id;
		chrome.storage.local.set({ DOMAINS: new_domains });
		chrome.runtime.sendMessage({
			greeting: "OPTION DISABLE GPC",
			domain: domainKey,
		});
	});
}

// Returns true if all domains are toggled on, false otherwise
function allOn(domains) {
	for (let d in domains) {
		if (domains[d].bool === false) return false;
	}
	return true;
}

// Returns true if all domains are toggled off, false otherwise
function allOff(domains) {
	for (let d in domains) {
		if (domains[d].bool === true) return false;
	}
	return true;
}

// Removes DOMAINS[domainKey] from DOMAINS
// TODO: Send a different message to the background
// async function deleteDomain(domainKey) {
// 	let new_domains = {};
// 	chrome.storage.local.get(["DOMAINS"], function (result) {
// 		new_domains = result.DOMAINS;
// 		id = new_domains[domainKey].id;
// 		delete new_domains[domainKey];
// 		chrome.storage.local.set({ DOMAINS: new_domains });
// 		chrome.runtime.sendMessage({
// 			greeting: "OPTION DELETE DOMAIN",
// 			domain: domainKey,
// 			id: id,
// 		});
// 	});
// }

// Creates the specific Domain List toggles as well as the perm delete
export function addToggleListeners() {
	chrome.storage.local.get(["DOMAINS"], function (result) {
		for (let domain in result.DOMAINS) {
			addDomainToggleListener(domain, domain);
			// addDeleteButtonListener(domain);
		}
	});
}

// "Do not allow tracking for all" button is clicked
export function handleToggleAllOn() {
	// "Apply all" box isn't checked
	let toggleOn_prompt = `Are you sure you would like to toggle on the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`;
	if (confirm(toggleOn_prompt)) {
		chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
			if (
				allOff(result.DOMAINS) === false &&
				allOn(result.DOMAINS) !== true
			) {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC signal",
					prevSetting: "Personalized domain list",
					newSetting: "Send signal",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			} else if (allOff(result.DOMAINS) === true) {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC signal",
					prevSetting: "Don't send signal",
					newSetting: "Send signal",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			} else {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC Signal",
					prevSetting: "Send signal",
					newSetting: "No change",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			}
			let new_domains = result.DOMAINS;
			for (let d in new_domains) {
				new_domains[d].bool = true;
				chrome.runtime.sendMessage({
					greeting: "OPTION ENABLE GPC",
					domain: d,
				});
			}
			chrome.storage.local.set({ DOMAINS: new_domains });
			createList();
			addToggleListeners();
		});
	}
}

// "Allow tracking for all" button is clicked
export function handleToggleAllOff() {
	let toggleOff_prompt = `Are you sure you would like to toggle off the GPC setting for all sites on the website list? NOTE: Your current preferences will be overwritten.`;
	if (confirm(toggleOff_prompt)) {
		chrome.storage.local.get(["DOMAINS", "UV_SETTING"], function (result) {
			if (
				allOn(result.DOMAINS) === false &&
				allOff(result.DOMAINS) === false
			) {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC Signal",
					prevSetting: "Personalized domain list",
					newSetting: "Don't send signal",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			} else if (allOn(result.DOMAINS) === true) {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC Signal",
					prevSetting: "Send signal",
					newSetting: "Don't send signal",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			} else {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All existing domains",
					setting: "GPC Signal",
					prevSetting: "Don't send signal",
					newSetting: "No change",
					universalSetting: result.UV_SETTING,
					location: "Options page",
					subcollection: "Domain",
				});
			}
			let new_domains = result.DOMAINS;
			for (let d in new_domains) {
				new_domains[d].bool = false;
				chrome.runtime.sendMessage({
					greeting: "OPTION DISABLE GPC",
					domain: d,
				});
			}
			chrome.storage.local.set({ DOMAINS: new_domains });
			createList();
			addToggleListeners();
		});
	}
}

// "Apply all" switch is hit
export function handleApplyAllSwitch() {
	chrome.storage.local.get(
		["UV_SETTING", "APPLY_ALL", "DOMAINS"],
		function (result) {
			if (result.APPLY_ALL) {
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All future domains",
					setting: "Universal Setting",
					prevSetting: result.UV_SETTING,
					newSetting: "Off",
					universalSetting: "Off",
					location: "Options page",
					subcollection: "Domain",
				});
				chrome.runtime.sendMessage({
					greeting: "DISABLE FUTURE GLOBAL SETTING",
					domains: result.DOMAINS,
				});
				chrome.storage.local.set({ DOMAINLIST_ENABLED: true });
				chrome.storage.local.set({ UV_SETTING: "Off" });
				chrome.storage.local.set({ APPLY_ALL: false });
				chrome.storage.local.set({ ENABLED: true });
				createDefaultSettingInfo();
			} else {
				createDefaultSettingInfo();
				UIkit.modal("#future_setting_prompt").show();
				createDefaultSettingInfo();
			}
		}
	);
}

// User interacts with future setting prompt, shown when users attempt to turn on the "Apply all" switch
export function handleFutureSettingPromptEvent(event) {
	// User hits "Allow tracking for all"
	if (event.target.id == "allow-future-btn") {
		chrome.storage.local.set({ APPLY_ALL: true });
		chrome.storage.local.set({ UV_SETTING: "Don't send signal to all" });
		chrome.storage.local.set({ ENABLED: false });
		createDefaultSettingInfo();
		chrome.runtime.sendMessage({
			greeting: "UPDATE FUTURE GLOBAL SETTING",
			enable: false,
		});
		chrome.runtime.sendMessage({
			greeting: "INTERACTION",
			domain: "All future domains",
			setting: "Universal Setting",
			prevSetting: "Off",
			newSetting: "Don't send signal to all",
			universalSetting: "Don't send signal to all",
			location: "Options page",
			subcollection: "Domain",
		});
	}
	// User hits "Don't allow tracking" for all
	else if (event.target.id == "dont-allow-future-btn") {
		chrome.storage.local.set({ APPLY_ALL: true });
		chrome.storage.local.set({ UV_SETTING: "Send signal to all" });
		chrome.storage.local.set({ ENABLED: true });
		createDefaultSettingInfo();
		chrome.runtime.sendMessage({
			greeting: "INTERACTION",
			domain: "All future domains",
			setting: "Universal Setting",
			prevSetting: "Off",
			newSetting: "Send signal to all",
			universalSetting: "Send signal to all",
			location: "Options page",
			subcollection: "Domain",
		});
		chrome.storage.local.get(["DOMAINS"], (res) => {
			chrome.runtime.sendMessage({
				greeting: "UPDATE FUTURE GLOBAL SETTING",
				enable: true,
				domains: res.DOMAINS,
			});
		});
	}
	// Otherwise, they hit cancel and nothing changes
}

// User changes their privacy profile on scheme 3
export function addPrivacyProfileEventListener() {
	document.addEventListener("click", function (event) {
		if (event.target.id == "high-privacy-sensitivity") {
			chrome.storage.local.get(["USER_CHOICES"], function (result) {
				if (result.USER_CHOICES !== "High Privacy-Sensitivity") {
					chrome.runtime.sendMessage({
						greeting: "INTERACTION",
						domain: "All future domains",
						setting: "Privacy Profile",
						prevSetting: result.USER_CHOICES,
						newSetting: "High Privacy-Sensitivity",
						location: "Options page",
						subcollection: "Privacy Choice",
					});
				}
			});
			chrome.storage.local.set({
				USER_CHOICES: "High Privacy-Sensitivity",
			});
			chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
			chrome.runtime.sendMessage({
				greeting: "UPDATE PRIVACY PROFILE",
				scheme: "High Privacy-Sensitivity",
			});
			createDefaultSettingInfo();
			updatePrefScheme3();
		} else if (event.target.id == "medium-privacy-sensitivity") {
			chrome.storage.local.get(["USER_CHOICES"], function (result) {
				if (result.USER_CHOICES !== "Medium Privacy-Sensitivity") {
					chrome.runtime.sendMessage({
						greeting: "INTERACTION",
						domain: "All future domains",
						setting: "Privacy Profile",
						prevSetting: result.USER_CHOICES,
						newSetting: "Medium Privacy-Sensitivity",
						location: "Options page",
						subcollection: "Privacy Choice",
					});
				}
			});
			chrome.storage.local.set({
				USER_CHOICES: "Medium Privacy-Sensitivity",
			});
			chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
			chrome.runtime.sendMessage({
				greeting: "UPDATE PRIVACY PROFILE",
				scheme: "Medium Privacy-Sensitivity",
			});
			createDefaultSettingInfo();
			updatePrefScheme3();
		} else if (event.target.id == "low-privacy-sensitivity") {
			chrome.storage.local.get(["USER_CHOICES"], function (result) {
				if (result.USER_CHOICES !== "Low Privacy-Sensitivity") {
					chrome.runtime.sendMessage({
						greeting: "INTERACTION",
						domain: "All future domains",
						setting: "Privacy Profile",
						prevSetting: result.USER_CHOICES,
						newSetting: "Low Privacy-Sensitivity",
						location: "Options page",
						subcollection: "Privacy Choice",
					});
				}
			});
			chrome.storage.local.set({
				USER_CHOICES: "Low Privacy-Sensitivity",
			});
			chrome.runtime.sendMessage({ greeting: "UPDATE PROFILE" });
			chrome.runtime.sendMessage({
				greeting: "UPDATE PRIVACY PROFILE",
				scheme: "Low Privacy-Sensitivity",
			});
			createDefaultSettingInfo();
			updatePrefScheme3();
		}
	});
}

// User alters their category choice on scheme 4
export function addCategoriesEventListener() {
	document.addEventListener("click", function (event) {
		chrome.storage.local.get(["USER_CHOICES"], function (result) {
			chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
			let userChoices = result.USER_CHOICES;
			if (event.target.id == "Advertising") {
				userChoices["Advertising"] = !userChoices["Advertising"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			} else if (event.target.id == "Analytics") {
				userChoices["Analytics"] = !userChoices["Analytics"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			} else if (event.target.id == "Fingerprinting") {
				userChoices["Fingerprinting"] = !userChoices["Fingerprinting"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			} else if (event.target.id == "Content & Social") {
				userChoices["Content & Social"] =
					!userChoices["Content & Social"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			} else if (event.target.id == "Cryptomining") {
				userChoices["Cryptomining"] = !userChoices["Cryptomining"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			} else if (event.target.id == "Others") {
				userChoices["Others"] = !userChoices["Others"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
				updatePrefScheme4();
			}
		});
	});
}

export function addDataCategoriesEventListener() {
	document.addEventListener("click", function (event) {
		chrome.storage.local.get(["USER_CHOICES"], function (result) {
			chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
			let userChoices = result.USER_CHOICES;
			if (event.target.id == "Phone Number") {
				userChoices["Phone Number"] = !userChoices["Phone Number"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Email Address") {
				userChoices["Email Address"] = !userChoices["Email Address"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "GPS Location") {
				userChoices["GPS Location"] = !userChoices["GPS Location"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Zip Code") {
				userChoices["Zip Code"] =
					!userChoices["Zip Code"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Browsing History") {
				userChoices["Browsing History"] = !userChoices["Browsing History"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Age") {
				userChoices["Age"] = !userChoices["Age"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Ethnicity/Race") {
				userChoices["Ethnicity/Race"] = !userChoices["Ethnicity/Race"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Income") {
				userChoices["Income"] = !userChoices["Income"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			} else if (event.target.id == "Gender") {
				userChoices["Gender"] = !userChoices["Gender"];
				chrome.storage.local.set({ USER_CHOICES: userChoices });
				chrome.storage.local.get(
					["USER_CHOICES", "PREV_CHOICE"],
					function (result) {
						chrome.runtime.sendMessage({
							greeting: "INTERACTION",
							domain: "All domains",
							setting: "Data Categories",
							prevSetting: result.PREV_CHOICE,
							newSetting: result.USER_CHOICES,
							location: "Options page",
							subcollection: "Privacy Choice",
						});
					}
				);
				chrome.storage.local.set({ PREV_CHOICE: result.USER_CHOICES });
				createDefaultSettingInfo();
			}
		});
	});
}

// User changes GPC signal send status on scheme 6
export function addGPCEventListener() {
	document.addEventListener("click", (event) => {
		if (event.target.id == "privacy-on") {
			chrome.storage.local.get(["USER_CHOICES", "DOMAINS"], function (result) {
				if (result.USER_CHOICES !== "Enable GPC") {
					chrome.declarativeNetRequest.updateEnabledRulesets(
						{ enableRulesetIds: ["universal_GPC"] },
						() => console.log("universal_GPC rule enabled")
					);
					chrome.runtime.sendMessage({
						greeting: "INTERACTION",
						domain: "All future domains",
						setting: "Privacy Profile",
						prevSetting: result.USER_CHOICES,
						newSetting: "Enable GPC",
						location: "Options page",
						subcollection: "Privacy Choice",
					});
				}
				chrome.storage.local.set({ USER_CHOICES: "Enable GPC" });
				createDefaultSettingInfo();
				let domains = result.DOMAINS;
				for (let currentDomain in domains) {
					let value = true;
					domains[currentDomain].bool = value;
				}
				chrome.storage.local.set({ DOMAINS: domains });
				createList();
				addToggleListeners();
			});
		} else if (event.target.id == "privacy-off") {
			chrome.storage.local.get(["USER_CHOICES", "DOMAINS"], function (result) {
				if (result.USER_CHOICES !== "Disable GPC") {
					chrome.declarativeNetRequest.updateEnabledRulesets(
						{ disableRulesetIds: ["universal_GPC"] },
						() => console.log("universal_GPC rule disabled")
					);
					chrome.runtime.sendMessage({
						greeting: "INTERACTION",
						domain: "All future domains",
						setting: "Privacy Profile",
						prevSetting: result.USER_CHOICES,
						newSetting: "Disable GPC",
						location: "Options page",
						subcollection: "Privacy Choice",
					});
				}
				chrome.storage.local.set({ USER_CHOICES: "Disable GPC" });
				createDefaultSettingInfo();
				let domains = result.DOMAINS;
				for (let currentDomain in domains) {
					let value = false;
					domains[currentDomain].bool = value;
				}
				chrome.storage.local.set({ DOMAINS: domains });
				createList();
				addToggleListeners();
			});
		}
	});
}
