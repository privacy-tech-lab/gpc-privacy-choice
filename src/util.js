/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/

This file provides utility functions to the firebase.js
*/

// Get GPC Global Status
export function getGPCGlobalStatus(applyALLBool, enabledBool, uiScheme) {
	if (uiScheme === 3 || uiScheme === 4 || uiScheme === 5) {
		return "N/A";
	} else if (applyALLBool) return enabledBool;
	else return "unset";
}

// Get the Browser
export function getBrowser() {
	let browser = "unknown";
	let ua = navigator.userAgent;
	if (window.chrome) {
		if ((ua.indexOf("Opera") || ua.indexOf("OPR")) != -1) browser = "Opera";
		else if (ua.indexOf("Edg") != -1) browser = "Edge";
		else if (ua.indexOf("Chrome") != -1) {
			browser = "Chrome";
			if (navigator.brave != undefined) browser = "Brave";
		}
	}
	return browser;
}

// Get the operating system of the user device
export function getOS() {
	let OSName = "Unknown";
	if (window.navigator.userAgent.indexOf("Windows NT 10.0") != -1)
		OSName = "Windows 10";
	if (window.navigator.userAgent.indexOf("Windows NT 6.3") != -1)
		OSName = "Windows 8.1";
	if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1)
		OSName = "Windows 8";
	if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1)
		OSName = "Windows 7";
	if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1)
		OSName = "Windows Vista";
	if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1)
		OSName = "Windows XP";
	if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1)
		OSName = "Windows 2000";
	if (window.navigator.userAgent.indexOf("Mac") != -1) OSName = "Mac/iOS";
	if (window.navigator.userAgent.indexOf("X11") != -1) OSName = "UNIX";
	if (window.navigator.userAgent.indexOf("Linux") != -1) OSName = "Linux";
	return OSName;
}

// Get the plugins on the user's browser [will this change?]
export function getPlugins() {
	let pluginArray = navigator.plugins;
	let plugins = [];
	for (let i in pluginArray) {
		if (typeof pluginArray[i] == "object") {
			plugins.push(pluginArray[i].name);
		}
	}
	return plugins;
}

// Get the language setting of the user's browser
export function getLanguage() {
	return navigator.language;
}

// Get the time zone of the user
export function getTimeZone() {
	let timeZone = new Date().toTimeString().slice(9);
	return timeZone;
}

// Get the FirstPartyCookiesEnabled status of the user
export function getFirstPartyCookiesEnabled() {
	return navigator.cookieEnabled;
}

// Get the user's local storage enable status
export function getLocalStorageEnabled() {
	let test = "test";
	try {
		localStorage.setItem(test, test);
		localStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

// Get the user's session storage enable status
export function getSessionStorageEnabled() {
	let test = "test";
	try {
		sessionStorage.setItem(test, test);
		sessionStorage.removeItem(test);
		return true;
	} catch (e) {
		return false;
	}
}

// Get the user's location
export async function getLocation() {
	let crd = "unknown";
	await requestLocation()
		.then((pos) => (crd = pos.coords))
		.catch((err) => console.log(err));
	return crd;
}

// Helper function for getting user location
export function requestLocation() {
	return new Promise(function (resolve, reject) {
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				resolve(pos);
			},
			(err) => {
				reject(err);
			}
		);
	});
}

// Auxiliary function for getDomain function
export function getHostName(url) {
	let match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
	if (
		match != null &&
		match.length > 2 &&
		typeof match[2] === "string" &&
		match[2].length > 0
	)
		return match[2];
	else return null;
}

// Get the top level domain from the url
export function getDomain(url) {
	let hostName = getHostName(url);
	let domain = hostName;

	if (hostName != null) {
		let parts = hostName.split(".").reverse();
		if (parts != null && parts.length > 1) {
			domain = parts[1] + "." + parts[0];
			if (hostName.toLowerCase().indexOf(".co.uk") != -1 && parts.length > 2) {
				domain = parts[2] + "." + domain;
			}
		}
	}
	return domain;
}

export const sleep = (milliseconds) => {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

// Check if domain is in list of ad networks
export function isInDisconnect(domain) {
	if (Object.keys(disconnectList).includes(domain)) {
		// console.log(true, disconnectList[domain])
		return true;
	} else return false;
	// if(i.includes(domain))
	// console.log(Object.keys(c))
}

//function to remove information on frames that no longer exist
export function cleanFrames(tabId) {
	chrome.tabs.get(tabId, (tab) => {
		if (tab != undefined) {
			let toRemove = [];
			let url = tab.url;
			if (frames[tabId] != undefined) {
				for (let frame of Object.keys(frames[tabId])) {
					// console.log(frame)
					if (frames[tabId][frame] != url) {
						toRemove.push(frame);
					}
				}
				sleep(1000).then(() => {
					for (let frame in toRemove) {
						delete frames[tabId][toRemove[frame]];
					}
				});
			}
		}
	});
}

// Enable the extenstion with default sendSignal set to true
export const enable = () => {
	fetch("json/headers.json")
		.then((response) => response.text())
		.then((value) => {
			optout_headers = JSON.parse(value);
			chrome.storage.local.set({ ENABLED: true });
			// setCache(enabled=true)
		})
		.catch((e) =>
			console.log(
				`Failed to intialize OptMeowt (JSON load process) (ContentScript): ${e}`
			)
		);
};

// Open the relevant page based on the schemes
export function openPage(url) {
	chrome.tabs.create({
		url: url,
		active: true,
	});
}
