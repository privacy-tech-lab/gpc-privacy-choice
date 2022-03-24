import { createUser } from "../background.js";
import { PASSWORD } from "../config.js";

let userProfile = null;

let profilesList = document.querySelectorAll(".choice");

// Add event listeners for toggling user choice of profile
profilesList.forEach((item) => {
	item.addEventListener("click", (event) => {
		let classList = event.target.classList;
		for (let profile of profilesList) {
			if (profile.children[0].firstElementChild.classList !== classList) {
				let card = profile.children[0];
				card.classList.remove("uk-card-primary");
				card.setAttribute("aria-expanded", false);
			}
		}
	});
});

// Storage the user's profile in the local storage for future reference, close the tab
document.querySelector(".submit-choice").onclick = (e) => {
	let prolificID = document.getElementById("prolific-id").value;
	let password = document.getElementById("password").value;
	let html = `<div class="uk-alert-danger" uk-alert><a class="uk-alert-close" uk-close></a>`;
	if (!prolificID)
		html += `<p class="uk-text-default">User Prolific ID Required</p>`;
	if (!password) html += `<p class="uk-text-default">Password is Required</p>`;
	if (prolificID && !validateID(prolificID))
		html += `<p class="uk-text-default">Invalid Prolific ID</p>`;
	if (password && password != PASSWORD)
		html += `<p class="uk-text-default">Invalid Password</p>`;
	if (
		prolificID &&
		password &&
		validateID(prolificID) &&
		password == PASSWORD
	) {
		try {
			userProfile = document.querySelector(".uk-card-primary").children[1]
				.innerText;
		} catch (e) {}
		if (userProfile) {
			chrome.storage.local.set({ USER_PROFILE: userProfile }, function () {
				submit(prolificID);
			});
			chrome.runtime.sendMessage({
				greeting: "UPDATE PRIVACY PROFILE",
				scheme: userProfile,
			});
		} else {
			html += `<p class="uk-text-default">Please Select Your Privacy Sensitivity Profile</p>`;
			html += `</div>`;
			let warnings = document.querySelector(".form-validation");
			warnings.innerHTML = html;
		}
	} else {
		html += `</div>`;
		let warnings = document.querySelector(".form-validation");
		warnings.innerHTML = html;
	}
};

// Add user information into the database
function submit(prolificID) {
	chrome.storage.local.get(["UI_SCHEME", "UV_SETTING"], function (result) {
		let schemeNumber = result.UI_SCHEME;
		if (schemeNumber == 6) {
			chrome.storage.local.set({ APPLY_ALL: true });
			if (userProfile == "Enable GPC") {
				chrome.declarativeNetRequest.updateEnabledRulesets(
					{ enableRulesetIds: ["universal_GPC"] },
					() => console.log("universal_GPC rule enabled")
				);
				chrome.storage.local.set({ ENABLED: true });
			} else {
				chrome.declarativeNetRequest.updateEnabledRulesets(
					{ disableRulesetIds: ["universal_GPC"] },
					() => console.log("universal_GPC rule disabled")
				);
				chrome.storage.local.set({ ENABLED: false });
			}
		}
		chrome.storage.local.set(
			{ USER_CHOICES: userProfile, MADE_DECISION: true },
			async function () {
				document.querySelector(".main").style.display = "none";
				document.querySelector(".loading").style.display = "block";
				await createUser(prolificID, schemeNumber);
				chrome.runtime.sendMessage({
					greeting: "INTERACTION",
					domain: "All future domains",
					setting: "Privacy Profile",
					prevSetting: "Preference not set",
					newSetting: userProfile,
					universalSetting: result.UV_SETTING,
					location: "Privacy Profile",
					subcollection: "Privacy Choice",
				});
				setTimeout(function () {
					document.querySelector(".loading").style.display = "none";
					let modal = UIkit.modal("#welcome-modal");
					modal.show();
					document.getElementById(
						"welcome-modal-button"
					).onclick = function () {
						modal.hide();
						window.close();
					};
				}, 2000);
			}
		);
	});
}

// Helper function to validate prolific ID
function validateID(id) {
	const re = /^([a-zA-Z0-9_-]){24,24}$/;
	return re.test(id);
}