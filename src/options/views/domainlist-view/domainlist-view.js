/*
GPC Privacy Choice is licensed under the MIT License
Copyright (c) 2021 Chunyue Ma, Isabella Tassone, Eliza Kuller, Sebastian Zimmeck
privacy-tech-lab, https://privacytechlab.org/

This file is the main driver file which communicates with the background service worker. 
It exports the domainListView function, which builds the UI for the domain list page, as well as adding the event listeners responding to the users interaction with the page

users actions on domains-list/options page --- chrome runtime --> background.js service worker
*/

import { renderParse, fetchParse } from "../../components/util.js";
import {
	addToggleListeners,
	handleToggleAllOn,
	handleToggleAllOff,
	handleApplyAllSwitch,
	handleFutureSettingPromptEvent,
	addCategoriesEventListener,
	addDataCategoriesEventListener,
	addGPCEventListener,
	addPrivacyProfileEventListener,
} from "./domainlist-util.js";

import {
	createDomainlistManagerButtons,
	createDefaultSettingInfo,
	createList,
	filterList,
} from "./domainlist-ui.js";

const domainListHeadings = {
	title: "Global Privacy Control (GPC) Settings",
	subtitle: "Review or Modify Your GPC Settings",
};

// Creates all the event listeners for the options page buttons
function addEventListeners() {
	// Add event listener based on the user's scheme
	chrome.storage.local.get(["UI_SCHEME"], function (result) {
		if (result.UI_SCHEME != 7) addToggleListeners();
		if (result.UI_SCHEME == 3) addPrivacyProfileEventListener();
		if (result.UI_SCHEME == 4) addCategoriesEventListener();
		if (result.UI_SCHEME == 6) addGPCEventListener();
		if (result.UI_SCHEME == 7) addDataCategoriesEventListener();
	});
	// Add the serach handler if exist
	if (document.getElementById("searchbar") != null)
		document.getElementById("searchbar").addEventListener("keyup", filterList);
	// Add global toggle functionalities if exist
	document.addEventListener("click", (event) => {
		if (event.target.id == "toggle_all_off") {
			handleToggleAllOff();
		} else if (event.target.id == "toggle_all_on") {
			handleToggleAllOn();
		} else if (event.target.id == "apply-all-switch") {
			handleApplyAllSwitch();
		} else if (
			event.target.id == "allow-future-btn" ||
			event.target.id == "dont-allow-future-btn"
		) {
			handleFutureSettingPromptEvent(event);
		} else if (event.target.id == "delete_all_domainlist") {
			handleDeleteDomainListEvent();
		}
	});
}

// Update the check list based on the user's choice in scheme 3
export function updatePrefScheme3() {
	chrome.storage.local.get(
		["DOMAINS", "CHECKLIST", "USER_CHOICES", "NPSLIST"],
		function (result) {
			let domains = result.DOMAINS;
			for (let d in domains) {
				// by default, do not send GPC signals
				let value = false;
				// if user chose extremely privacy sensitive: send GPC signals
				if (result.USER_CHOICES == "High Privacy-Sensitivity") value = true;
				// if user chose not privacy sensitive: do not send GPC signals
				else if (result.USER_CHOICES == "Low Privacy-Sensitivity") {
					value = false;
					if (result.NPSLIST.includes(d)) value = true;
				}
				// if the user chose moderately gpc signals
				else if (result.USER_CHOICES == "Medium Privacy-Sensitivity") {
					// by default, the GPC signals are not sent unless the currentDomain is the the checkList
					value = false;
					if (result.CHECKLIST.includes(d)) value = true;
				}
				// add the currentDomain and store it in the local storage
				domains[d].bool = value;
			}
			chrome.storage.local.set({ DOMAINS: domains });
			createList();
			addToggleListeners();
		}
	);
}

// Update the check list based on the user's choice in scheme 4
export async function updatePrefScheme4() {
	chrome.storage.local.get(
		["DOMAINS", "CHECKLIST", "USER_CHOICES"],
		async function (result) {
			let checkList = [];
			let userChoices = result.USER_CHOICES;
			// Parse the networks json file based on the user's response to JSON
			await fetch("../../json/services.json")
				.then((response) => response.text())
				.then((result) => {
					let networks = JSON.parse(result)["categories"];
					for (let category of Object.keys(userChoices)) {
						if (!(userChoices["Others"] == true)) {
							if (userChoices[category] == true) {
								if (category === "Fingerprinting") {
									for (let cat of [
										"FingerprintingGeneral",
										"FingerprintingInvasive",
									]) {
										for (let n of networks[cat]) {
											for (let c of Object.values(n)) {
												for (let list of Object.values(c)) {
													checkList = checkList.concat(list);
												}
											}
										}
									}
								} else if (category === "Content & Social") {
									for (let cat of ["Content", "Social", "Disconnect"]) {
										for (let n of networks[cat]) {
											for (let c of Object.values(n)) {
												for (let list of Object.values(c)) {
													checkList = checkList.concat(list);
												}
											}
										}
									}
								} else {
									for (let n of networks[category]) {
										for (let c of Object.values(n)) {
											for (let list of Object.values(c)) {
												checkList = checkList.concat(list);
											}
										}
									}
								}
							}
						}
					}
				});
			chrome.storage.local.set({
				CHECKLIST: checkList,
			});

			let domains = result.DOMAINS;
			for (let currentDomain in domains) {
				// by default, do not send GPC signals
				let value = false;
				// send GPC signals if the currentDomain is in the checkList
				if (result.USER_CHOICES["Others"] == true) value = true;
				else {
					if (checkList.includes(currentDomain)) value = true;
				}
				// add the currentDomain and store it in the local storage
				domains[currentDomain].bool = value;
			}
			chrome.storage.local.set({ DOMAINS: domains });
			createList();
			addToggleListeners();
		}
	);
}

// Renders the `domain list` view in the options page
export async function domainlistView(scaffoldTemplate, buildList) {
	let body;
	let content;

	if (buildList) {
		body = renderParse(
			scaffoldTemplate,
			domainListHeadings,
			"scaffold-component"
		);
		content = await fetchParse(
			"./views/domainlist-view/domainlist-view.html",
			"domainlist-view"
		);
	} else {
		body = renderParse(
			scaffoldTemplate,
			domainListHeadings,
			"scaffold-component"
		);
		content = await fetchParse(
			"./views/domainlist-view/domainlist-view-plain.html",
			"domainlist-view-plain"
		);
	}

	document.getElementById("content").innerHTML = body.innerHTML;
	document.getElementById("scaffold-component-body").innerHTML =
		content.innerHTML;

	createDefaultSettingInfo();

	if (buildList) {
		createDomainlistManagerButtons();
		createList();
	}
	addEventListeners();
	chrome.storage.local.get(["LEARNING"], function (result) {
		if (result.LEARNING == "Just Finished") {
			chrome.storage.local.set({ LEARNING: "Completed" }, function () {
				let modal = UIkit.modal("#learning-finish-modal");
				modal.show();
				document.getElementById(
					"learning-finish-modal-button"
				).onclick = function () {
					modal.hide();
				};
			});
		}
	});
}
