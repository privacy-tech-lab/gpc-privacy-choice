// Update the sendSignal boolean for the current page
export async function updateSendSignal(tab) {
	await chrome.storage.local.get(["UI_SCHEME"], async function (result) {
		let userScheme = result.UI_SCHEME;
		if (userScheme == 0 || userScheme == 1 || userScheme == 2)
			updateSendSignalScheme1(tab);
		else if (userScheme == 3) updateSendSignalScheme3();
		else if (userScheme == 4) updateSendSignalScheme4();
		else if (userScheme == 5) updateSendSignalScheme5();
		else updateSendSignalScheme6();
	});
}

// SCHEME 0/1/2 : Banner
export function updateSendSignalScheme1(tabId) {
	if (domainlistEnabledCache) {
		if (tabId < 0) sendSignal = false;
		else
			chrome.tabs.get(tabId, (tab) => {
				let siteDomain = getDomain(tab.url);
				if (!(domainsCache[siteDomain] === undefined))
					sendSignal = domainsCache[siteDomain];
				else {
					if (applyAllCache) sendSignal = enabledCache;
					else sendSignal = false;
				}
			});
	} else sendSignal = enabledCache;
}

// SCHEME 4: Questionnaire
export async function updateSendSignalScheme4() {
	if (currentDomain in domainsCache) sendSignal = domainsCache[currentDomain];
	else {
		await chrome.storage.local.get(
			["CHECKLIST", "USER_CHOICES"],
			function (result) {
				if (result.USER_CHOICES["All Sites"] == true) sendSignal = true;
				else {
					if (result.CHECKLIST.includes(currentDomain)) sendSignal = true;
				}
			}
		);
	}
	// console.log("updated signal for " + currentDomain + " is " + sendSignal);
}

// SCHEME 3: Privacy Profile
export async function updateSendSignalScheme3() {
	if (currentDomain in domainsCache) sendSignal = domainsCache[currentDomain];
	else {
		await chrome.storage.local.get(
			["CHECKLIST", "NPSLIST", "USER_CHOICES"],
			function (result) {
				if (result.USER_CHOICES == "Low Privacy-Sensitivity") {
					if (result.NPSLIST.includes(currentDomain)) sendSignal = true;
				} else if (result.USER_CHOICES == "Medium Privacy-Sensitivity") {
					if (result.CHECKLIST.includes(currentDomain)) sendSignal = true;
				} else {
					sendSignal = true;
				}
			}
		);
	}
	// console.log("updated signal for " + currentDomain + " is " + sendSignal);
}

// SCHEME 5: Machine Learning
export async function updateSendSignalScheme5() {
	if (domainlistEnabledCache) {
		if (!(domainsCache[currentDomain] === undefined))
			sendSignal = domainsCache[currentDomain];
		else {
			if (applyAllCache) sendSignal = enabledCache;
			else sendSignal = false;
		}
	} else sendSignal = enabledCache;

	await chrome.storage.local.get(
		["SEND_SIGNAL_BANNER", "DO_NOT_SEND_SIGNAL_BANNER"],
		function (result) {
			let sendSignalBanner = result.SEND_SIGNAL_BANNER;
			let doNotSendSignalBanner = result.DO_NOT_SEND_SIGNAL_BANNER;
			if (sendSignalBanner + doNotSendSignalBanner == 5) {
				chrome.storage.local.set({
					UI_SCHEME: 3,
					USER_CHOICES: "Low Privacy-Sensitivity",
				});
			}
		}
	);
}

// SCHEME 6: Plain YES/NO to Privacy
export async function updateSendSignalScheme6() {
	await chrome.storage.local.get(["USER_CHOICES"], function (result) {
		if (result.USER_CHOICES == "Enable GPC") sendSignal = true;
		else sendSignal = false;
	});
}
